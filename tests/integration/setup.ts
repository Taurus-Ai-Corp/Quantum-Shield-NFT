/**
 * Integration Test Setup
 *
 * Configures environment for integration tests that interact with real external services.
 *
 * IMPORTANT: Integration tests require:
 * 1. Hedera testnet credentials (.env file)
 * 2. Network connectivity
 * 3. Sufficient HBAR balance for operations
 */

import dotenv from 'dotenv';

// Load environment variables from project root
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'HEDERA_NETWORK',
  'HEDERA_OPERATOR_ID',
  'HEDERA_OPERATOR_KEY',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Warning: Missing environment variables for integration tests: ${missingVars.join(', ')}`
  );
  console.warn('   Integration tests may fail or be skipped.');
  console.warn('   Create a .env file with Hedera testnet credentials.');
}

// Set test timeout (integration tests may take longer)
jest.setTimeout(60000); // 60 seconds

// Global test configuration
export const integrationTestConfig = {
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    operatorId: process.env.HEDERA_OPERATOR_ID || '',
    operatorKey: process.env.HEDERA_OPERATOR_KEY || '',
  },
  timeouts: {
    networkRequest: 30000, // 30 seconds
    transactionSubmit: 45000, // 45 seconds
    consensusWait: 60000, // 60 seconds
  },
  skipTests: {
    // Skip tests if required environment variables are missing
    hedera: missingVars.includes('HEDERA_OPERATOR_ID') || missingVars.includes('HEDERA_OPERATOR_KEY'),
  },
};

// Helper to conditionally skip tests
export function skipIfMissingEnv(testName: string, envVars: string[]) {
  const missing = envVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.log(`⏭️  Skipping ${testName}: Missing ${missing.join(', ')}`);
    return true;
  }
  return false;
}

// Cleanup helper
export async function cleanup<T>(resource: T, cleanupFn: (r: T) => Promise<void>) {
  try {
    await cleanupFn(resource);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}
