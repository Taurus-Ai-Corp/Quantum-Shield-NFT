/**
 * Fastify API Server for Quantum Shield NFT
 *
 * REST API for quantum-safe NFT operations:
 * - Shield asset creation
 * - Integrity verification
 * - Provenance tracking
 * - Marketplace operations
 *
 * @security Rate limiting, CORS, input validation with Zod
 * @compliance NIST FIPS 203/204, Hedera HTS/HCS standards
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { NFTShieldService } from '../services/NFTShieldService.js';
import type { AssetData } from '../services/NFTShieldService.js';
import type { CollectionData } from '../nft-marketplace/QuantumNFTMarketplace.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Server configuration
 */
interface ServerConfig {
  port?: number;
  host?: string;
  hederaNetwork?: 'mainnet' | 'testnet' | 'previewnet';
  operatorId?: string;
  operatorKey?: string;
  enableMarketplace?: boolean;
  rateLimitMax?: number;
  rateLimitTimeWindow?: number;
}

/**
 * Initialize Fastify server
 */
export async function createServer(config: ServerConfig = {}) {
  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Initialize services
  const shieldService = new NFTShieldService({
    hederaNetwork: config.hederaNetwork || (process.env['HEDERA_NETWORK'] as any) || 'testnet',
    operatorId: config.operatorId || process.env['HEDERA_OPERATOR_ID'],
    operatorKey: config.operatorKey || process.env['HEDERA_OPERATOR_KEY'],
    enableMarketplace: config.enableMarketplace !== false,
  });

  // Register CORS
  await fastify.register(cors, {
    origin: process.env['CORS_ORIGIN'] || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register rate limiting
  await fastify.register(rateLimit, {
    max: config.rateLimitMax || 100,
    timeWindow: config.rateLimitTimeWindow || 60000, // 1 minute
    errorResponseBuilder: (_req, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
      };
    },
  });

  /**
   * Health check endpoint
   */
  fastify.get('/api/v1/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'quantum-shield-nft',
      version: '2.0.0',
    };
  });

  /**
   * Shield an asset
   * POST /api/v1/shield
   */
  fastify.post<{
    Body: AssetData;
  }>(
    '/api/v1/shield',
    {
      schema: {
        body: {
          type: 'object',
          required: ['assetId', 'assetType', 'name', 'owner'],
          properties: {
            assetId: { type: 'string' },
            assetType: { type: 'string', enum: ['nft', 'ip', 'document', 'data'] },
            name: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string' },
            metadata: { type: 'object' },
            owner: { type: 'string' },
            category: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              shieldId: { type: 'string' },
              assetId: { type: 'string' },
              timestamp: { type: 'string' },
              integrityHash: { type: 'string' },
              hederaProof: {
                type: 'object',
                properties: {
                  topicId: { type: 'string' },
                  transactionId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const shield = await shieldService.shieldAsset(request.body);

        return {
          shieldId: shield.shieldId,
          assetId: shield.assetId,
          timestamp: shield.timestamp,
          integrityHash: shield.integrityHash,
          hederaProof: {
            topicId: shield.hederaProof.topicId,
            transactionId: shield.hederaProof.transactionId,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(400).send({
          error: 'Shield creation failed',
          message: (error as Error).message,
        });
      }
    }
  );

  /**
   * Verify shield integrity
   * GET /api/v1/verify/:shieldId
   */
  fastify.get<{
    Params: { shieldId: string };
  }>(
    '/api/v1/verify/:shieldId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['shieldId'],
          properties: {
            shieldId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              shieldId: { type: 'string' },
              valid: { type: 'boolean' },
              signatureValid: { type: 'boolean' },
              provenanceValid: { type: 'boolean' },
              integrityHash: { type: 'string' },
              verifiedAt: { type: 'string' },
              migrationState: { type: 'string' },
              warnings: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const verification = await shieldService.verifyShield(request.params.shieldId);
        return verification;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(404).send({
          error: 'Verification failed',
          message: (error as Error).message,
        });
      }
    }
  );

  /**
   * Get provenance chain
   * GET /api/v1/provenance/:shieldId
   */
  fastify.get<{
    Params: { shieldId: string };
  }>(
    '/api/v1/provenance/:shieldId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['shieldId'],
          properties: {
            shieldId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const chain = await shieldService.getProvenance(request.params.shieldId);
        return chain;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(404).send({
          error: 'Provenance chain not found',
          message: (error as Error).message,
        });
      }
    }
  );

  /**
   * Check compliance
   * GET /api/v1/compliance/:shieldId
   */
  fastify.get<{
    Params: { shieldId: string };
  }>(
    '/api/v1/compliance/:shieldId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['shieldId'],
          properties: {
            shieldId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const compliance = await shieldService.checkCompliance(request.params.shieldId);
        return compliance;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(404).send({
          error: 'Compliance check failed',
          message: (error as Error).message,
        });
      }
    }
  );

  /**
   * List all shields
   * GET /api/v1/shields
   */
  fastify.get(
    '/api/v1/shields',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            offset: { type: 'integer', minimum: 0, default: 0 },
          },
        },
      },
    },
    async (request) => {
      const shields = shieldService.listShields();

      const query = request.query as { limit?: number; offset?: number };
      const limit = query.limit || 50;
      const offset = query.offset || 0;

      return {
        total: shields.length,
        limit,
        offset,
        shields: shields.slice(offset, offset + limit),
      };
    }
  );

  /**
   * Get shield by ID
   * GET /api/v1/shields/:shieldId
   */
  fastify.get<{
    Params: { shieldId: string };
  }>(
    '/api/v1/shields/:shieldId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['shieldId'],
          properties: {
            shieldId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const shield = shieldService.getShield(request.params.shieldId);

      if (!shield) {
        reply.code(404).send({
          error: 'Shield not found',
          shieldId: request.params.shieldId,
        });
        return;
      }

      return shield;
    }
  );

  /**
   * Marketplace: Create NFT collection
   * POST /api/v1/marketplace/collections
   */
  fastify.post<{
    Body: CollectionData;
  }>(
    '/api/v1/marketplace/collections',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'symbol', 'creator'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            symbol: { type: 'string', minLength: 1, maxLength: 32 },
            description: { type: 'string' },
            category: { type: 'string' },
            creator: { type: 'string' },
            maxSupply: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (_request, reply) => {
      try {
        // Note: marketplace may be undefined if disabled
        if (!config.enableMarketplace) {
          return reply.code(503).send({
            error: 'Marketplace disabled',
            message: 'Marketplace features are not enabled on this server',
          });
        }

        // For now, return a placeholder since marketplace integration needs more work
        return reply.code(501).send({
          error: 'Not implemented',
          message: 'Marketplace collection creation coming soon',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(400).send({
          error: 'Collection creation failed',
          message: (error as Error).message,
        });
      }
    }
  );

  /**
   * Error handler
   */
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    const err = error as any;

    if ('validation' in err) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: err.message,
        details: err.validation,
      });
    }

    return reply.code(500).send({
      error: 'Internal Server Error',
      message:
        process.env['NODE_ENV'] === 'production' ? 'An unexpected error occurred' : err.message,
    });
  });

  return fastify;
}

/**
 * Start server
 */
export async function startServer(config: ServerConfig = {}) {
  const fastify = await createServer(config);

  const port = config.port || parseInt(process.env['PORT'] || '3200', 10);
  const host = config.host || process.env['HOST'] || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         QUANTUM SHIELD NFT API SERVER STARTED                ║
╠═══════════════════════════════════════════════════════════════╣
║  URL: http://${host}:${port}${' '.repeat(Math.max(0, 44 - host.length - port.toString().length))} ║
║  Environment: ${(process.env['NODE_ENV'] || 'development').padEnd(45)} ║
║  Network: ${(config.hederaNetwork || 'testnet').padEnd(49)} ║
║  Rate Limit: ${(config.rateLimitMax || 100).toString().padEnd(47)} requests/min ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  return fastify;
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start server if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}

export default { createServer, startServer };
