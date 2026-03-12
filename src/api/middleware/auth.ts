import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

const SERVICE_TOKEN = process.env['INTERNAL_SERVICE_TOKEN'] || '';

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  // Hash both values to fixed length to prevent length-based timing leaks
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

/**
 * Internal auth: Next.js -> Fastify via shared service token
 */
export async function requireServiceAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers['x-service-token'] as string;
  const userId = request.headers['x-user-id'] as string;

  if (!token || !SERVICE_TOKEN || !safeCompare(token, SERVICE_TOKEN)) {
    return reply.code(401).send({ error: 'Invalid service token' });
  }

  if (!userId) {
    return reply.code(401).send({ error: 'Missing user context' });
  }

  request.userId = userId;
}

/**
 * External auth: CLI/SDK -> Fastify via per-user API key
 * Note: Requires Prisma client - import lazily to avoid circular deps
 */
export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    return reply.code(401).send({ error: 'API key required (X-API-Key header)' });
  }

  // Dynamic import to avoid requiring Prisma at module load
  // Variable path prevents TypeScript from statically resolving the cross-boundary import
  // (web/src/lib/prisma depends on @prisma/client which is only in web/node_modules)
  const prismaPath = '../../../web/src/lib/prisma';
  const { prisma } = await import(prismaPath);

  const user = await prisma.user.findUnique({
    where: { apiKey },
    select: { id: true, role: true },
  });

  if (!user) {
    return reply.code(401).send({ error: 'Invalid API key' });
  }

  request.userId = user.id;
}

/**
 * Combined auth: accepts either service token OR API key
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const serviceToken = request.headers['x-service-token'] as string;

  if (serviceToken) {
    return requireServiceAuth(request, reply);
  }

  return requireApiKey(request, reply);
}
