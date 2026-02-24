/**
 * Quantum-Shield-NFT SDK API Interface
 *
 * Defines the public API surface for the SDK.
 * Implementation details are in compiled code (dist/).
 */

import type {
  ShieldAssetParams,
  ShieldResult,
  VerificationResult,
  ProvenanceEvent,
  MigrationStatus,
  CryptoState,
} from './types';

/**
 * Shield API Interface
 *
 * Core methods for quantum-safe NFT protection.
 */
export interface ShieldAPI {
  /**
   * Shield an asset with quantum-safe cryptography
   *
   * Creates a quantum-safe digital signature (ML-DSA-65) and records
   * the shield creation event to Hedera HCS for immutable provenance.
   *
   * @param params - Asset information and metadata
   * @returns Shield result with signature and provenance details
   *
   * @throws {ShieldSDKError} If shielding fails
   *
   * @example
   * ```typescript
   * const result = await client.shieldAsset({
   *   assetId: '0.0.12345:1',
   *   metadata: {
   *     name: 'Patent #001',
   *     category: 'ip',
   *     description: 'Machine learning patent'
   *   }
   * });
   *
   * console.log('Shield ID:', result.shieldId);
   * console.log('Quantum Signature:', result.signature);
   * ```
   */
  shieldAsset(params: ShieldAssetParams): Promise<ShieldResult>;

  /**
   * Verify the integrity of a shielded asset
   *
   * Validates the quantum-safe signature and checks if the asset
   * metadata has been tampered with since shielding.
   *
   * @param shieldId - Unique shield identifier
   * @returns Verification result with validity status
   *
   * @throws {ShieldSDKError} If shield not found or verification fails
   *
   * @example
   * ```typescript
   * const result = await client.verifyIntegrity('550e8400-e29b-41d4-a716-446655440000');
   *
   * if (result.isValid) {
   *   console.log('✅ Shield integrity verified');
   * } else {
   *   console.error('❌ Shield compromised:', result.error);
   * }
   * ```
   */
  verifyIntegrity(shieldId: string): Promise<VerificationResult>;

  /**
   * Get complete provenance history for a shielded asset
   *
   * Retrieves all events from Hedera HCS topic associated with the shield,
   * providing a tamper-proof audit trail.
   *
   * @param shieldId - Unique shield identifier
   * @returns Array of provenance events, ordered chronologically
   *
   * @throws {ShieldSDKError} If shield not found
   *
   * @example
   * ```typescript
   * const events = await client.getProvenance('550e8400-e29b-41d4-a716-446655440000');
   *
   * events.forEach(event => {
   *   console.log(`${event.timestamp}: ${event.type} by ${event.actor}`);
   * });
   * ```
   */
  getProvenance(shieldId: string): Promise<ProvenanceEvent[]>;

  /**
   * Get current crypto-agility migration status
   *
   * Returns the current cryptographic state and migration progress
   * for transitioning between classical, hybrid, and quantum-only states.
   *
   * @returns Migration status with progress percentage
   *
   * @example
   * ```typescript
   * const status = await client.getMigrationStatus();
   *
   * console.log('Current State:', status.currentState);
   * console.log('Progress:', status.progress, '%');
   * ```
   */
  getMigrationStatus(): Promise<MigrationStatus>;

  /**
   * Migrate shields to a new cryptographic state
   *
   * Initiates batch migration of all shields to the target crypto state.
   * This is part of the 5-state crypto-agility model:
   * CLASSICAL_ONLY → HYBRID_PREPARE → HYBRID_SIGN → HYBRID_VERIFY → QUANTUM_ONLY
   *
   * @param targetState - Desired cryptographic state
   * @returns Migration status with progress tracking
   *
   * @throws {ShieldSDKError} If migration fails
   *
   * @example
   * ```typescript
   * const status = await client.migrateToState('QUANTUM_ONLY');
   *
   * console.log('Migration started:', status.migratedCount, '/', status.totalCount);
   * ```
   */
  migrateToState(targetState: CryptoState): Promise<MigrationStatus>;

  /**
   * Transfer ownership of a shielded asset
   *
   * Records ownership transfer event to Hedera HCS and updates shield metadata.
   *
   * @param shieldId - Unique shield identifier
   * @param newOwner - New owner's Hedera account ID
   * @returns Updated provenance event
   *
   * @throws {ShieldSDKError} If transfer fails
   *
   * @example
   * ```typescript
   * const event = await client.transferOwnership(
   *   '550e8400-e29b-41d4-a716-446655440000',
   *   '0.0.67890'
   * );
   *
   * console.log('Ownership transferred at:', event.timestamp);
   * ```
   */
  transferOwnership(
    shieldId: string,
    newOwner: string
  ): Promise<ProvenanceEvent>;

  /**
   * Update metadata for a shielded asset
   *
   * Updates asset metadata and records the change to Hedera HCS.
   * The quantum signature is regenerated with the new metadata.
   *
   * @param shieldId - Unique shield identifier
   * @param metadata - Updated metadata (partial or full)
   * @returns Updated shield result with new signature
   *
   * @throws {ShieldSDKError} If update fails
   *
   * @example
   * ```typescript
   * const result = await client.updateMetadata(
   *   '550e8400-e29b-41d4-a716-446655440000',
   *   { description: 'Updated patent description' }
   * );
   *
   * console.log('New signature:', result.signature);
   * ```
   */
  updateMetadata(
    shieldId: string,
    metadata: Partial<AssetMetadata>
  ): Promise<ShieldResult>;

  /**
   * Get shield details by ID
   *
   * Retrieves complete shield information including metadata,
   * signature, and provenance topic details.
   *
   * @param shieldId - Unique shield identifier
   * @returns Shield result with all details
   *
   * @throws {ShieldSDKError} If shield not found
   *
   * @example
   * ```typescript
   * const shield = await client.getShield('550e8400-e29b-41d4-a716-446655440000');
   *
   * console.log('Asset:', shield.assetId);
   * console.log('Crypto State:', shield.cryptoState);
   * console.log('Created:', shield.timestamp);
   * ```
   */
  getShield(shieldId: string): Promise<ShieldResult>;

  /**
   * List all shields for the current operator account
   *
   * Returns paginated list of shields created by this account.
   *
   * @param options - Pagination options
   * @returns Array of shield results
   *
   * @example
   * ```typescript
   * const shields = await client.listShields({ limit: 10, offset: 0 });
   *
   * shields.forEach(shield => {
   *   console.log(`${shield.shieldId}: ${shield.assetId}`);
   * });
   * ```
   */
  listShields(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ShieldResult[]>;
}

/**
 * Asset metadata (re-exported for convenience)
 */
export type { AssetMetadata } from './types';
