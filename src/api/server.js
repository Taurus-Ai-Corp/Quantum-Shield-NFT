/**
 * Quantum-Shield-NFT Enterprise API
 *
 * Fastify REST API for enterprise NFT protection.
 * Endpoints for shielding, verification, provenance, and migration management.
 *
 * @copyright TAURUS AI Corp
 */

import { timingSafeEqual } from 'node:crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { NFTShieldService } from '../services/NFTShieldService.js';

dotenv.config();

const PORT = parseInt(process.env.SHIELD_API_PORT || '3200', 10);
const HOST = process.env.SHIELD_API_HOST || '0.0.0.0';

// Initialize Fastify
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined
  }
});

// Plugins
const ALLOWED_ORIGINS = [
  'https://shield.q-grid.ca',
  'https://quantum-shield-nft.vercel.app',
  /^https:\/\/quantum-shield-nft[a-z0-9-]*\.vercel\.app$/,
];

if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:3100');
}

await app.register(cors, {
  origin: ALLOWED_ORIGINS,
  credentials: true,
});
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Initialize service
const shieldService = new NFTShieldService({
  mldsaLevel: process.env.MLDSA_LEVEL || 'ML-DSA-65',
  migrationState: process.env.MIGRATION_STATE || 'HYBRID_SIGN'
});

// --- Health ---

app.get('/health', async () => ({
  status: 'ok',
  service: 'quantum-shield-nft',
  version: '2.0.0',
  migrationState: shieldService.agility.getState(),
  migrationProgress: shieldService.agility.getProgress(),
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}));

// --- API Key Auth Guard ---

const API_KEY = process.env.SHIELD_API_KEY;

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function requireApiKey(request, reply, done) {
  if (!API_KEY) {
    // No API key configured — skip auth in development
    if (process.env.NODE_ENV === 'production') {
      reply.code(500).send({ error: 'Server misconfigured: API key not set' });
      return;
    }
    done();
    return;
  }

  const provided = request.headers['x-api-key'] || request.headers['authorization']?.replace('Bearer ', '');
  if (!provided || !safeCompare(provided, API_KEY)) {
    reply.code(401).send({ error: 'Unauthorized: invalid or missing API key' });
    return;
  }
  done();
}

// --- Shield Endpoints ---

app.post('/api/v1/shield', {
  preHandler: requireApiKey,
  schema: {
    body: {
      type: 'object',
      required: ['assetId', 'metadata', 'owner'],
      properties: {
        assetId: { type: 'string', minLength: 1, maxLength: 200 },
        metadata: { type: 'object' },
        owner: { type: 'string', minLength: 1, maxLength: 200 },
        category: { type: 'string', maxLength: 100 },
      },
      additionalProperties: false,
    },
  },
}, async (request, reply) => {
  const { assetId, metadata, owner, category } = request.body;

  const result = await shieldService.shieldAsset({
    assetId, metadata, owner, category
  });

  return reply.code(201).send(result);
});

app.get('/api/v1/shield/:shieldId', { preHandler: requireApiKey }, async (request, reply) => {
  const { shieldId } = request.params;
  const status = shieldService.getShieldStatus(shieldId);

  if (!status) {
    return reply.code(404).send({ error: 'Shield not found' });
  }

  return status;
});

// --- Verification ---

app.post('/api/v1/verify', {
  schema: {
    body: {
      type: 'object',
      required: ['shieldId', 'metadata'],
      properties: {
        shieldId: { type: 'string', minLength: 1, maxLength: 200 },
        metadata: { type: 'object' },
      },
      additionalProperties: false,
    },
  },
}, async (request, reply) => {
  const { shieldId, metadata } = request.body;
  const result = await shieldService.verifyShield(shieldId, metadata);
  return result;
});

// --- Transfer ---

app.post('/api/v1/transfer', {
  preHandler: requireApiKey,
  schema: {
    body: {
      type: 'object',
      required: ['shieldId', 'newOwner', 'currentOwner'],
      properties: {
        shieldId: { type: 'string', minLength: 1, maxLength: 200 },
        newOwner: { type: 'string', minLength: 1, maxLength: 200 },
        currentOwner: { type: 'string', minLength: 1, maxLength: 200 },
      },
      additionalProperties: false,
    },
  },
}, async (request, reply) => {
  const { shieldId, newOwner, currentOwner } = request.body;

  // IDOR check: verify requester owns this shield
  const shield = shieldService.getShieldStatus(shieldId);
  if (!shield) {
    return reply.code(404).send({ error: 'Shield not found' });
  }
  if (shield.owner !== currentOwner) {
    return reply.code(403).send({ error: 'Forbidden: you do not own this shield' });
  }

  const result = await shieldService.transferShield(shieldId, newOwner);
  return result;
});

// --- Provenance ---

app.get('/api/v1/provenance/:assetId', async (request, reply) => {
  const { assetId } = request.params;
  const chain = shieldService.getProvenanceChain(assetId);

  return {
    assetId,
    events: chain,
    depth: chain.length,
    timestamp: new Date().toISOString()
  };
});

// --- Migration Management ---

app.get('/api/v1/migration/status', { preHandler: requireApiKey }, async () => {
  return shieldService.getComplianceReport();
});

app.get('/api/v1/migration/readiness', { preHandler: requireApiKey }, async () => {
  return shieldService.agility.getReadinessAssessment();
});

app.post('/api/v1/migration/advance', {
  preHandler: requireApiKey,
}, async (request, reply) => {
  const result = shieldService.advanceMigration();
  return result;
});

// --- Stats ---

app.get('/api/v1/stats', { preHandler: requireApiKey }, async () => {
  return shieldService.getStats();
});

// --- Error Handler ---

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);

  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
    });
  }

  return reply.code(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message,
  });
});

// --- Start Server ---

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         QUANTUM-SHIELD-NFT API SERVER                        ║
╠═══════════════════════════════════════════════════════════════╣
║  URL: http://${HOST}:${PORT}                                 ║
║  Migration: ${shieldService.agility.getState().padEnd(48)} ║
║  Crypto: ML-DSA-65 + ML-KEM-768                             ║
║  Status: RUNNING                                             ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
