/**
 * Quantum-Shield-NFT SDK Type Definitions
 *
 * Public-facing types for the SDK.
 * NO proprietary algorithm details exposed.
 */

/**
 * Hedera network configuration
 */
export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet';

/**
 * Asset category for NFT protection
 */
export type AssetCategory = 'art' | 'collectible' | 'document' | 'ip' | 'certificate' | 'other';

/**
 * Cryptographic state in the 5-state migration model
 */
export type CryptoState =
  | 'CLASSICAL_ONLY'
  | 'HYBRID_PREPARE'
  | 'HYBRID_SIGN'
  | 'HYBRID_VERIFY'
  | 'QUANTUM_ONLY';

/**
 * SDK Client Configuration Options
 */
export interface ShieldOptions {
  /**
   * Hedera network to connect to
   * @default 'testnet'
   */
  network?: HederaNetwork;

  /**
   * Hedera operator account ID (format: "0.0.xxxxx")
   */
  operatorId: string;

  /**
   * Hedera operator private key (hex or DER format)
   */
  operatorKey: string;

  /**
   * Current cryptographic state for migration management
   * @default 'HYBRID_SIGN'
   */
  cryptoState?: CryptoState;

  /**
   * Enable verbose logging for debugging
   * @default false
   */
  debug?: boolean;
}

/**
 * Asset metadata for NFT shielding
 */
export interface AssetMetadata {
  /**
   * Human-readable name of the asset
   */
  name: string;

  /**
   * Asset category (art, ip, document, etc.)
   */
  category: AssetCategory;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Optional image URI (IPFS, HTTP, or Hedera File ID)
   */
  image?: string;

  /**
   * Optional external URL
   */
  externalUrl?: string;

  /**
   * Optional custom attributes (key-value pairs)
   */
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Parameters for shielding an asset
 */
export interface ShieldAssetParams {
  /**
   * Hedera Token ID of the NFT to shield (format: "0.0.xxxxx:serialNumber")
   */
  assetId: string;

  /**
   * Asset metadata to embed in the shield
   */
  metadata: AssetMetadata;

  /**
   * Optional HCS topic ID for provenance recording
   * If not provided, a new topic will be created
   */
  provenanceTopicId?: string;
}

/**
 * Result of asset shielding operation
 */
export interface ShieldResult {
  /**
   * Unique shield identifier (UUID)
   */
  shieldId: string;

  /**
   * Quantum-safe digital signature (ML-DSA-65)
   */
  signature: string;

  /**
   * HCS topic ID where provenance is recorded
   */
  provenanceTopicId: string;

  /**
   * HCS message sequence number of shield creation event
   */
  sequenceNumber: number;

  /**
   * Timestamp of shield creation (ISO 8601)
   */
  timestamp: string;

  /**
   * Original asset ID that was shielded
   */
  assetId: string;

  /**
   * Cryptographic state used for this shield
   */
  cryptoState: CryptoState;
}

/**
 * Integrity verification result
 */
export interface VerificationResult {
  /**
   * Whether the shield integrity is valid
   */
  isValid: boolean;

  /**
   * Shield identifier
   */
  shieldId: string;

  /**
   * Asset ID associated with this shield
   */
  assetId: string;

  /**
   * Verification timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * Cryptographic state used for verification
   */
  cryptoState: CryptoState;

  /**
   * Error message if verification failed
   */
  error?: string;
}

/**
 * Provenance event types
 */
export type ProvenanceEventType =
  | 'SHIELD_CREATED'
  | 'OWNERSHIP_TRANSFERRED'
  | 'METADATA_UPDATED'
  | 'INTEGRITY_VERIFIED'
  | 'CRYPTO_STATE_MIGRATED';

/**
 * Provenance event recorded on Hedera HCS
 */
export interface ProvenanceEvent {
  /**
   * Event type
   */
  type: ProvenanceEventType;

  /**
   * Shield identifier
   */
  shieldId: string;

  /**
   * Asset identifier
   */
  assetId: string;

  /**
   * Event timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * HCS topic ID
   */
  topicId: string;

  /**
   * HCS message sequence number
   */
  sequenceNumber: number;

  /**
   * Account that triggered this event
   */
  actor: string;

  /**
   * Event-specific data
   */
  data?: Record<string, any>;
}

/**
 * Migration status for crypto-agility
 */
export interface MigrationStatus {
  /**
   * Current cryptographic state
   */
  currentState: CryptoState;

  /**
   * Target state for migration
   */
  targetState: CryptoState;

  /**
   * Number of shields migrated
   */
  migratedCount: number;

  /**
   * Total shields to migrate
   */
  totalCount: number;

  /**
   * Migration progress (0-100)
   */
  progress: number;

  /**
   * Migration start timestamp
   */
  startedAt?: string;

  /**
   * Migration completion timestamp
   */
  completedAt?: string;

  /**
   * Error message if migration failed
   */
  error?: string;
}

/**
 * SDK Error Types
 */
export type SDKErrorType =
  | 'CONFIGURATION_ERROR'
  | 'NETWORK_ERROR'
  | 'HEDERA_ERROR'
  | 'VALIDATION_ERROR'
  | 'CRYPTO_ERROR'
  | 'NOT_FOUND';

/**
 * SDK Error Class
 */
export class ShieldSDKError extends Error {
  constructor(
    public type: SDKErrorType,
    message: string,
    public override cause?: Error
  ) {
    super(message);
    this.name = 'ShieldSDKError';
  }
}
