/**
 * Jest setup for Next.js / React component tests
 */

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock HashConnect wallet service
const mockWalletService = {
  connect: jest.fn().mockResolvedValue({
    isConnected: true,
    accountId: '0.0.12345',
    network: 'testnet',
  }),
  disconnect: jest.fn().mockResolvedValue(undefined),
  getState: jest.fn().mockReturnValue({
    isConnected: false,
    accountId: null,
    network: 'testnet',
  }),
};

jest.mock('@/lib/hedera', () => ({
  HederaWalletService: jest.fn().mockImplementation(() => mockWalletService),
  getWalletService: jest.fn(() => mockWalletService),
  WalletConnectionState: {},
}));

// Suppress console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

