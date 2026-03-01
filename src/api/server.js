/**
 * Quantum-Shield-NFT Enterprise API
 *
 * Fastify REST API for enterprise NFT protection.
 * Endpoints for shielding, verification, provenance, and migration management.
 *
 * @copyright TAURUS AI Corp
 */

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
  /\.vercel\.app$/,
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

// --- Shield Endpoints ---

app.post('/api/v1/shield', async (request, reply) => {
  const { assetId, metadata, owner, category } = request.body;

  if (!assetId || !metadata || !owner) {
    return reply.code(400).send({
      error: 'Missing required fields: assetId, metadata, owner'
    });
  }

  const result = await shieldService.shieldAsset({
    assetId, metadata, owner, category
  });

  return reply.code(201).send(result);
});

app.get('/api/v1/shield/:shieldId', async (request, reply) => {
  const { shieldId } = request.params;
  const status = shieldService.getShieldStatus(shieldId);

  if (!status) {
    return reply.code(404).send({ error: 'Shield not found' });
  }

  return status;
});

// --- Verification ---

app.post('/api/v1/verify', async (request, reply) => {
  const { shieldId, metadata } = request.body;

  if (!shieldId || !metadata) {
    return reply.code(400).send({
      error: 'Missing required fields: shieldId, metadata'
    });
  }

  const result = await shieldService.verifyShield(shieldId, metadata);
  return result;
});

// --- Transfer ---

app.post('/api/v1/transfer', async (request, reply) => {
  const { shieldId, newOwner } = request.body;

  if (!shieldId || !newOwner) {
    return reply.code(400).send({
      error: 'Missing required fields: shieldId, newOwner'
    });
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

app.get('/api/v1/migration/status', async () => {
  return shieldService.getComplianceReport();
});

app.get('/api/v1/migration/readiness', async () => {
  return shieldService.agility.getReadinessAssessment();
});

app.post('/api/v1/migration/advance', async (request, reply) => {
  const result = shieldService.advanceMigration();
  return result;
});

// --- Stats ---

app.get('/api/v1/stats', async () => {
  return shieldService.getStats();
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
