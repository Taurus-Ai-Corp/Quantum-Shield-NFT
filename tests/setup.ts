/**
 * Jest test setup file
 * Configures test environment and global utilities
 */

// Extend Jest matchers
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.HEDERA_NETWORK = 'testnet';
process.env.HEDERA_OPERATOR_ID = '0.0.12345';
process.env.HEDERA_OPERATOR_KEY = 'test-key';
process.env.SHIELD_API_PORT = '3200';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(), // Silent error logs in tests
  warn: jest.fn(),  // Silent warning logs in tests
};

// Mock Hedera SDK for unit tests (integration tests will use real SDK)
jest.mock('@hashgraph/sdk', () => ({
  Client: jest.fn().mockImplementation(() => ({
    setOperator: jest.fn(),
    close: jest.fn(),
  })),
  PrivateKey: {
    generate: jest.fn().mockReturnValue({
      publicKey: { toString: () => 'mock-public-key' },
      toString: () => 'mock-private-key',
    }),
  },
  TopicMessageSubmitTransaction: jest.fn(),
  TokenCreateTransaction: jest.fn(),
  AccountId: {
    fromString: jest.fn((id) => ({ toString: () => id })),
  },
}));

// Global test timeout (5 seconds)
jest.setTimeout(5000);

