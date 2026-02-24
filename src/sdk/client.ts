/**
 * Quantum-Shield-NFT SDK Client
 *
 * Public interface for quantum-safe NFT protection using Hedera blockchain.
 *
 * This class delegates to compiled code in dist/ to protect proprietary algorithms.
 */

import type { ShieldAPI, AssetMetadata } from './api';
import type {
  ShieldOptions,
  ShieldAssetParams,
  ShieldResult,
  VerificationResult,
  ProvenanceEvent,
  MigrationStatus,
  CryptoState,
} from './types';
import { ShieldSDKError } from './types';

/**
 * Quantum-Shield-NFT SDK Client
 *
 * @example
 * ```typescript
 * import { QuantumShieldClient } from '@quantum-shield/sdk';
 *
 * const client = new QuantumShieldClient({
 *   network: 'testnet',
 *   operatorId: process.env.HEDERA_OPERATOR_ID!,
 *   operatorKey: process.env.HEDERA_OPERATOR_KEY!
 * });
 *
 * // Shield an asset
 * const result = await client.shieldAsset({
 *   assetId: '0.0.12345:1',
 *   metadata: {
 *     name: 'Patent #001',
 *     category: 'ip'
 *   }
 * });
 * ```
 */
export class QuantumShieldClient implements ShieldAPI {
  private config: Required<ShieldOptions>;
  private compiled: any;

  /**
   * Create a new Quantum-Shield client
   *
   * @param options - Configuration options
   * @throws {ShieldSDKError} If configuration is invalid
   */
  constructor(options: ShieldOptions) {
    this.validateOptions(options);

    this.config = {
      network: options.network || 'testnet',
      operatorId: options.operatorId,
      operatorKey: options.operatorKey,
      cryptoState: options.cryptoState || 'HYBRID_SIGN',
      debug: options.debug || false,
    };

    try {
      // Load compiled implementation from dist/
      // This prevents exposing proprietary quantum crypto algorithms
      this.compiled = require('../../../dist/sdk-impl.js');
    } catch (error) {
      throw new ShieldSDKError(
        'CONFIGURATION_ERROR',
        'Failed to load SDK implementation. Ensure the package is properly built.',
        error as Error
      );
    }
  }

  /**
   * Validate configuration options
   */
  private validateOptions(options: ShieldOptions): void {
    if (!options.operatorId) {
      throw new ShieldSDKError(
        'CONFIGURATION_ERROR',
        'operatorId is required'
      );
    }

    if (!options.operatorKey) {
      throw new ShieldSDKError(
        'CONFIGURATION_ERROR',
        'operatorKey is required'
      );
    }

    // Validate Hedera account ID format (0.0.xxxxx)
    const accountIdPattern = /^0\.0\.\d+$/;
    if (!accountIdPattern.test(options.operatorId)) {
      throw new ShieldSDKError(
        'VALIDATION_ERROR',
        `Invalid operatorId format. Expected "0.0.xxxxx", got "${options.operatorId}"`
      );
    }

    // Validate network
    const validNetworks: HederaNetwork[] = ['testnet', 'mainnet', 'previewnet'];
    if (options.network && !validNetworks.includes(options.network)) {
      throw new ShieldSDKError(
        'VALIDATION_ERROR',
        `Invalid network. Must be one of: ${validNetworks.join(', ')}`
      );
    }

    // Validate crypto state
    const validStates: CryptoState[] = [
      'CLASSICAL_ONLY',
      'HYBRID_PREPARE',
      'HYBRID_SIGN',
      'HYBRID_VERIFY',
      'QUANTUM_ONLY',
    ];
    if (options.cryptoState && !validStates.includes(options.cryptoState)) {
      throw new ShieldSDKError(
        'VALIDATION_ERROR',
        `Invalid cryptoState. Must be one of: ${validStates.join(', ')}`
      );
    }
  }

  /**
   * Shield an asset with quantum-safe cryptography
   */
  async shieldAsset(params: ShieldAssetParams): Promise<ShieldResult> {
    try {
      return await this.compiled.shieldAsset(this.config, params);
    } catch (error) {
      if (error instanceof ShieldSDKError) {
        throw error;
      }
      throw new ShieldSDKError(
        'CRYPTO_ERROR',
        'Failed to shield asset',
        error as Error
      );
    }
  }

  /**
   * Verify the integrity of a shielded asset
   */
  async verifyIntegrity(shieldId: string): Promise<VerificationResult> {
    try {
      return await this.compiled.verifyIntegrity(this.config, shieldId);
    } catch (error) {
      if (error instanceof ShieldSDKError) {
        throw error;
      }
      throw new ShieldSDKError(
        'CRYPTO_ERROR',
        'Failed to verify integrity',
        error as Error
      );
    }
  }

  /**
   * Get complete provenance history for a shielded asset
   */
  async getProvenance(shieldId: string): Promise<ProvenanceEvent[]> {
    try {
      return await this.compiled.getProvenance(this.config, shieldId);
    } catch (error) {
      if (error instanceof ShieldSDKError) {
        throw error;
      }
      throw new ShieldSDKError(
        'HEDERA_ERROR',
        'Failed to retrieve provenance',
        error as Error
      );
    }
  }

  /**
   * Get current crypto-agility migration status
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    try {
      return await this.compiled.getMigrationStatus(this.config);
    } catch (error) {
      throw new ShieldSDKError(
        'CRYPTO_ERROR',
        'Failed to get migration status',
        error as Error
      );
    }
  }

  /**
   * Migrate shields to a new cryptographic state
   */
  async migrateToState(targetState: CryptoState): Promise<MigrationStatus> {
    try {
      return await this.compiled.migrateToState(this.config, targetState);
    } catch (error) {
      throw new ShieldSDKError(
        'CRYPTO_ERROR',
        'Failed to migrate crypto state',
        error as Error
      );
    }
  }

  /**
   * Transfer ownership of a shielded asset
   */
  async transferOwnership(
    shieldId: string,
    newOwner: string
  ): Promise<ProvenanceEvent> {
    try {
      return await this.compiled.transferOwnership(
        this.config,
        shieldId,
        newOwner
      );
    } catch (error) {
      throw new ShieldSDKError(
        'HEDERA_ERROR',
        'Failed to transfer ownership',
        error as Error
      );
    }
  }

  /**
   * Update metadata for a shielded asset
   */
  async updateMetadata(
    shieldId: string,
    metadata: Partial<AssetMetadata>
  ): Promise<ShieldResult> {
    try {
      return await this.compiled.updateMetadata(this.config, shieldId, metadata);
    } catch (error) {
      throw new ShieldSDKError(
        'CRYPTO_ERROR',
        'Failed to update metadata',
        error as Error
      );
    }
  }

  /**
   * Get shield details by ID
   */
  async getShield(shieldId: string): Promise<ShieldResult> {
    try {
      return await this.compiled.getShield(this.config, shieldId);
    } catch (error) {
      if (error instanceof ShieldSDKError) {
        throw error;
      }
      throw new ShieldSDKError(
        'NOT_FOUND',
        `Shield not found: ${shieldId}`,
        error as Error
      );
    }
  }

  /**
   * List all shields for the current operator account
   */
  async listShields(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ShieldResult[]> {
    try {
      return await this.compiled.listShields(this.config, options);
    } catch (error) {
      throw new ShieldSDKError(
        'HEDERA_ERROR',
        'Failed to list shields',
        error as Error
      );
    }
  }

  /**
   * Get current configuration (for debugging)
   *
   * @internal
   */
  getConfig(): Readonly<Required<ShieldOptions>> {
    return { ...this.config };
  }
}

/**
 * Type alias for Hedera network (re-exported for convenience)
 */
type HederaNetwork = ShieldOptions['network'];
