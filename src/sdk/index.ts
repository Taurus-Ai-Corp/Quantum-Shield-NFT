/**
 * Quantum-Shield-NFT SDK
 *
 * Public API for quantum-safe NFT protection using Hedera blockchain.
 *
 * @packageDocumentation
 */

// Re-export main client
export { QuantumShieldClient } from './client';

// Re-export API interface
export type { ShieldAPI, AssetMetadata } from './api';

// Re-export all public types
export type {
  HederaNetwork,
  AssetCategory,
  CryptoState,
  ShieldOptions,
  AssetMetadata as AssetMetadataType, // Renamed to avoid conflict
  ShieldAssetParams,
  ShieldResult,
  VerificationResult,
  ProvenanceEventType,
  ProvenanceEvent,
  MigrationStatus,
  SDKErrorType,
} from './types';

// Re-export error class
export { ShieldSDKError } from './types';

/**
 * Package version
 */
export const VERSION = '2.0.0';

/**
 * SDK metadata
 */
export const SDK_INFO = {
  name: '@quantum-shield/sdk',
  version: VERSION,
  license: 'FSL-1.1-MIT',
  repository: 'https://github.com/Taurus-Ai-Corp/quantum-shield-sdk',
  homepage: 'https://taurusai.io',
  documentation: 'https://docs.taurusai.io/quantum-shield',
} as const;
