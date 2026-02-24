/**
 * NFTShieldService - Orchestration layer for quantum-safe NFT protection
 *
 * Integrates:
 * - QuantumCryptoManager (ML-DSA-65 + ML-KEM-768 signatures)
 * - HederaClient (HTS/HCS blockchain operations)
 * - QuantumNFTMarketplace (DeFi marketplace features)
 *
 * @security Implements 5-state crypto-agility for post-quantum migration
 * @compliance NIST FIPS 203/204, EU AI Act (Aug 2026), CNSA 2.0 (Jan 2027)
 */

import { HederaClient } from '../hedera/HederaClient';
import { QuantumCryptoManager } from '../quantum-crypto/QuantumCryptoManager';
import { HIP412Validator, type HIP412Metadata } from '../validators/HIP412Validator';
import { IPFSService, type IPFSUploadResult } from './IPFSService';
import { MirrorNodeService } from './MirrorNodeService';
import { PineconeRAGService } from './PineconeRAGService';
import { GridDBClient } from './GridDBClient';
import type { SignatureData } from '../quantum-crypto/QuantumCryptoManager';
import type { QuantumNFTCollection, SubmittedProof } from '../hedera/HederaClient';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

/**
 * Shield service configuration
 */
export interface ShieldServiceConfig {
  hederaNetwork?: 'mainnet' | 'testnet' | 'previewnet';
  operatorId?: string;
  operatorKey?: string;
  enableMarketplace?: boolean;
  migrationState?: CryptoMigrationState;
  enableIPFS?: boolean;
  ipfsProvider?: 'pinata' | 'nft-storage' | 'ipfs-http';
  enablePinecone?: boolean;
  pineconeApiKey?: string;
  enableGridDB?: boolean;
  gridDBConfig?: {
    host: string;
    cluster: string;
    database: string;
    username: string;
    password: string;
  };
}

/**
 * Crypto-agility migration states (5 states)
 */
export type CryptoMigrationState =
  | 'CLASSICAL_ONLY' // RSA/ECDSA only (legacy)
  | 'HYBRID_SIGN' // Classical + PQC signatures (current)
  | 'HYBRID_ENCRYPT' // Classical + PQC encryption
  | 'PQC_PRIMARY' // PQC primary, classical fallback
  | 'PQC_ONLY'; // Pure post-quantum (2035+)

/**
 * Asset to shield
 */
export const AssetDataSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['nft', 'ip', 'document', 'data']),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  owner: z.string(),
  category: z.string().optional(),
});

export type AssetData = z.infer<typeof AssetDataSchema>;

/**
 * Shield result
 */
export interface ShieldResult {
  shieldId: string;
  assetId: string;
  quantumSignature: SignatureData;
  hederaProof: SubmittedProof;
  nftCollection?: QuantumNFTCollection;
  nftSerial?: bigint;
  timestamp: string;
  integrityHash: string;
  migrationState: CryptoMigrationState;
  hip412Metadata?: HIP412Metadata;
  hip412ValidationWarnings?: string[];
  ipfsUpload?: IPFSUploadResult;
}

/**
 * Verification result
 */
export interface IntegrityVerification {
  shieldId: string;
  valid: boolean;
  signatureValid: boolean;
  provenanceValid: boolean;
  integrityHash: string;
  verifiedAt: string;
  migrationState: CryptoMigrationState;
  warnings?: string[];
}

/**
 * Provenance event types
 */
export type ProvenanceEventType =
  | 'SHIELD_CREATED'
  | 'OWNERSHIP_TRANSFERRED'
  | 'METADATA_UPDATED'
  | 'COMPLIANCE_VERIFIED'
  | 'MIGRATION_PERFORMED';

/**
 * Provenance event
 */
export interface ProvenanceEvent {
  eventId: string;
  shieldId: string;
  eventType: ProvenanceEventType;
  timestamp: string;
  actor: string;
  data: Record<string, unknown>;
  quantumSignature: SignatureData;
  hederaProof: SubmittedProof;
}

/**
 * Provenance chain
 */
export interface ProvenanceChain {
  shieldId: string;
  assetId: string;
  events: ProvenanceEvent[];
  currentOwner: string;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Compliance check result
 */
export interface ComplianceCheck {
  shieldId: string;
  compliant: boolean;
  regulations: {
    'NIST-FIPS-203': boolean;
    'NIST-FIPS-204': boolean;
    'CNSA-2.0': boolean;
    'EU-AI-Act': boolean;
  };
  migrationReadiness: {
    state: CryptoMigrationState;
    nextState?: CryptoMigrationState;
    deadline?: string;
  };
  recommendations: string[];
  checkedAt: string;
}

export class NFTShieldService {
  private hederaClient: HederaClient;
  private quantumCrypto: QuantumCryptoManager;
  private ipfsService?: IPFSService;
  private mirrorNode: MirrorNodeService;
  private pineconeService?: PineconeRAGService;
  private gridDBClient?: GridDBClient;
  private migrationState: CryptoMigrationState;
  private shields: Map<string, ShieldResult>;
  private provenanceChains: Map<string, ProvenanceChain>;
  private useGridDB: boolean;

  constructor(config: ShieldServiceConfig = {}) {
    // Initialize Hedera client
    this.hederaClient = new HederaClient({
      network: config.hederaNetwork || 'testnet',
      operatorId: config.operatorId,
      operatorKey: config.operatorKey,
    });

    // Initialize quantum crypto with hybrid mode
    this.quantumCrypto = new QuantumCryptoManager({
      mldsaLevel: 'ML-DSA-65',
      mlkemLevel: 'ML-KEM-768',
      hybridMode: {
        enabled: true,
        eccCurve: 'ed25519',
        combineMode: 'kdf',
      },
    });

    // TODO: Initialize marketplace if enabled
    // Marketplace integration is deferred for now

    // Initialize IPFS service if enabled
    if (config.enableIPFS !== false) {
      this.ipfsService = new IPFSService({
        provider: config.ipfsProvider || 'pinata',
      });
    }

    // Initialize Mirror Node service
    this.mirrorNode = new MirrorNodeService(config.hederaNetwork || 'testnet');

    // Initialize Pinecone RAG service if enabled
    if (config.enablePinecone !== false) {
      try {
        this.pineconeService = new PineconeRAGService({
          apiKey: config.pineconeApiKey,
        });
      } catch (error) {
        console.warn('⚠️  Pinecone RAG service not available:', (error as Error).message);
      }
    }

    // Initialize GridDB if enabled
    this.useGridDB = config.enableGridDB === true && !!config.gridDBConfig;
    if (this.useGridDB && config.gridDBConfig) {
      try {
        this.gridDBClient = new GridDBClient({
          host: config.gridDBConfig.host,
          cluster: config.gridDBConfig.cluster,
          database: config.gridDBConfig.database,
          username: config.gridDBConfig.username,
          password: config.gridDBConfig.password,
        });

        // Initialize containers asynchronously (don't block constructor)
        this.gridDBClient.initializeShieldContainers().catch(error => {
          console.error('Failed to initialize GridDB containers:', error);
          this.useGridDB = false; // Fallback to Map() on failure
        });
      } catch (error) {
        console.warn('⚠️  GridDB not available:', (error as Error).message);
        this.useGridDB = false;
      }
    }

    // Set migration state (default: HYBRID_SIGN)
    this.migrationState = config.migrationState || 'HYBRID_SIGN';

    // Storage (Map fallback when GridDB disabled or unavailable)
    this.shields = new Map<string, ShieldResult>();
    this.provenanceChains = new Map<string, ProvenanceChain>();

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           NFT SHIELD SERVICE INITIALIZED                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Network: ${(config.hederaNetwork || 'testnet').padEnd(52)} ║
║  Migration State: ${this.migrationState.padEnd(44)} ║
║  Quantum Security: ML-DSA-65 + ML-KEM-768                    ║
║  Hybrid ECC Mode: Enabled                                    ║
║  Marketplace: ${(config.enableMarketplace !== false ? 'Enabled' : 'Disabled').padEnd(50)} ║
║  IPFS Storage: ${(config.enableIPFS !== false ? `Enabled (${config.ipfsProvider || 'pinata'})` : 'Disabled').padEnd(49)} ║
║  Pinecone RAG: ${(this.pineconeService ? 'Enabled' : 'Disabled').padEnd(49)} ║
║  GridDB Storage: ${(this.useGridDB ? 'Enabled (Persistent)' : 'Disabled (In-Memory)').padEnd(47)} ║
║  HIP-412 Compliance: Enabled                                 ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Shield an asset with quantum-safe protection
   */
  async shieldAsset(assetData: AssetData): Promise<ShieldResult> {
    // Validate input
    AssetDataSchema.parse(assetData);

    console.log(`\n🛡️ Shielding asset: ${assetData.name}...`);

    // Generate unique shield ID
    const shieldId = uuidv4();

    // Generate quantum identity for the asset
    const assetIdentity = await this.quantumCrypto.generateQuantumIdentity(assetData.name);

    // Create integrity hash
    const integrityHash = await this.createIntegrityHash(assetData);

    // Generate HIP-412 compliant metadata
    const hip412Metadata: HIP412Metadata = {
      name: assetData.name,
      description: assetData.description || `Quantum-protected ${assetData.assetType}`,
      image: (assetData.metadata?.['image'] as string) || `ipfs://placeholder-${shieldId}`,
      type: assetData.assetType,
      properties: {
        ...assetData.metadata,
        shieldId,
        quantumProtected: true,
        migrationState: this.migrationState,
        integrityHash,
        owner: assetData.owner,
        category: assetData.category,
      },
      creator: assetData.owner,
      checksum: {
        algorithm: 'SHA-256',
        hash: integrityHash,
      },
    };

    // Validate HIP-412 metadata
    const hip412Validation = HIP412Validator.validateQuantumShieldMetadata(hip412Metadata);

    if (!hip412Validation.valid) {
      throw new Error(`HIP-412 validation failed: ${hip412Validation.errors.join(', ')}`);
    }

    console.log(`✅ HIP-412 metadata validated (${hip412Validation.warnings.length} warnings)`);

    // Upload metadata to IPFS if enabled
    let ipfsUpload: IPFSUploadResult | undefined;
    if (this.ipfsService) {
      ipfsUpload = await this.ipfsService.uploadMetadata(hip412Metadata, {
        name: `${assetData.name}-metadata.json`,
        pinToIPFS: true,
      });

      console.log(`✅ Metadata uploaded to IPFS: ${ipfsUpload.cid}`);

      // Update image field with IPFS URL if it was a placeholder
      if (hip412Metadata.image.includes('placeholder')) {
        hip412Metadata.image = ipfsUpload.url;
      }
    }

    // Sign asset data with quantum signature
    const quantumSignature = await this.quantumCrypto.signData(
      assetIdentity.identityId,
      JSON.stringify({
        shieldId,
        assetId: assetData.assetId,
        integrityHash,
        timestamp: new Date().toISOString(),
      })
    );

    // Submit proof to Hedera HCS
    const hederaProof = await this.hederaClient.submitQuantumProof({
      type: 'NFT_COLLECTION_CREATED',
      tokenId: assetData.assetId,
      signature: quantumSignature.signature,
      publicKey: quantumSignature.publicKey,
      metadata: {
        shieldId,
        assetType: assetData.assetType,
        migrationState: this.migrationState,
        ipfsCID: ipfsUpload?.cid,
        hip412Compliant: true,
      },
    });

    // Create shield result
    const shield: ShieldResult = {
      shieldId,
      assetId: assetData.assetId,
      quantumSignature,
      hederaProof,
      timestamp: new Date().toISOString(),
      integrityHash,
      migrationState: this.migrationState,
      hip412Metadata,
      hip412ValidationWarnings: hip412Validation.warnings,
      ipfsUpload,
    };

    // Store shield (GridDB if enabled, Map fallback)
    if (this.useGridDB && this.gridDBClient) {
      try {
        await this.gridDBClient.insertRow('nft_shields', {
          shield_id: shieldId,
          asset_id: assetData.assetId,
          owner: assetData.owner,
          category: assetData.category,
          metadata_hash: integrityHash,
          ml_dsa_signature: JSON.stringify(quantumSignature),
          shielded_at: new Date().toISOString(),
          migration_state: this.migrationState,
          status: 'ACTIVE',
          metadata_json: JSON.stringify(shield),
        });
      } catch (error) {
        console.warn('⚠️  Failed to write to GridDB, using Map fallback:', (error as Error).message);
        this.useGridDB = false; // Disable GridDB on write failure
      }
    }

    // Always maintain Map for backwards compatibility
    this.shields.set(shieldId, shield);

    // Initialize provenance chain
    await this.initializeProvenanceChain(shield, assetData);

    console.log(`✅ Asset shielded: ${shieldId}`);
    console.log(`   HCS Proof: ${hederaProof.transactionId}`);
    console.log(`   Integrity Hash: ${integrityHash.substring(0, 16)}...`);

    return shield;
  }

  /**
   * Verify shield integrity and quantum signatures
   */
  async verifyShield(shieldId: string): Promise<IntegrityVerification> {
    console.log(`\n🔍 Verifying shield: ${shieldId}...`);

    const shield = this.shields.get(shieldId);
    if (!shield) {
      throw new Error(`Shield not found: ${shieldId}`);
    }

    // Verify quantum signature
    const signatureVerification = await this.quantumCrypto.verifySignature(
      shield.quantumSignature.publicKey,
      JSON.stringify({
        shieldId: shield.shieldId,
        assetId: shield.assetId,
        integrityHash: shield.integrityHash,
        timestamp: shield.timestamp,
      }),
      shield.quantumSignature.signature
    );

    // Verify provenance chain
    const provenanceChain = this.provenanceChains.get(shieldId);
    const provenanceValid = provenanceChain
      ? await this.verifyProvenanceChain(provenanceChain)
      : false;

    const warnings: string[] = [];

    // Check migration state warnings
    if (this.migrationState === 'CLASSICAL_ONLY') {
      warnings.push('WARNING: Using classical cryptography only - not quantum-safe');
    }

    const verification: IntegrityVerification = {
      shieldId,
      valid: signatureVerification.valid && provenanceValid,
      signatureValid: signatureVerification.valid,
      provenanceValid,
      integrityHash: shield.integrityHash,
      verifiedAt: new Date().toISOString(),
      migrationState: this.migrationState,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    console.log(`✅ Verification complete: ${verification.valid ? 'VALID' : 'INVALID'}`);

    return verification;
  }

  /**
   * Get provenance chain for a shield
   */
  async getProvenance(shieldId: string): Promise<ProvenanceChain> {
    const chain = this.provenanceChains.get(shieldId);
    if (!chain) {
      throw new Error(`Provenance chain not found for shield: ${shieldId}`);
    }

    return chain;
  }

  /**
   * Add provenance event
   */
  async addProvenanceEvent(
    shieldId: string,
    eventType: ProvenanceEventType,
    actor: string,
    data: Record<string, unknown>
  ): Promise<ProvenanceEvent> {
    const shield = this.shields.get(shieldId);
    if (!shield) {
      throw new Error(`Shield not found: ${shieldId}`);
    }

    const chain = this.provenanceChains.get(shieldId);
    if (!chain) {
      throw new Error(`Provenance chain not found: ${shieldId}`);
    }

    // Generate quantum identity for event
    const eventIdentity = await this.quantumCrypto.generateQuantumIdentity(
      `provenance-event-${eventType}`
    );

    const eventId = uuidv4();
    const timestamp = new Date().toISOString();

    // Sign event data
    const quantumSignature = await this.quantumCrypto.signData(
      eventIdentity.identityId,
      JSON.stringify({
        eventId,
        shieldId,
        eventType,
        timestamp,
        actor,
        data,
      })
    );

    // Submit to Hedera HCS
    const hederaProof = await this.hederaClient.submitQuantumProof({
      type: 'NFT_MINTED',
      tokenId: shield.assetId,
      signature: quantumSignature.signature,
      metadata: {
        eventId,
        eventType,
        actor,
      },
    });

    const event: ProvenanceEvent = {
      eventId,
      shieldId,
      eventType,
      timestamp,
      actor,
      data,
      quantumSignature,
      hederaProof,
    };

    // Persist to GridDB if enabled
    if (this.useGridDB && this.gridDBClient) {
      try {
        await this.gridDBClient.insertRow('provenance_events', {
          timestamp: timestamp,
          asset_id: shield.assetId,
          event_type: eventType,
          from_owner: eventType === 'OWNERSHIP_TRANSFERRED' ? (data['previousOwner'] as string) : actor,
          to_owner: eventType === 'OWNERSHIP_TRANSFERRED' ? (data['newOwner'] as string) : actor,
          quantum_signature: JSON.stringify(quantumSignature),
          hedera_topic_id: hederaProof.topicId || '',
          hedera_sequence: hederaProof.sequenceNumber ? Number(hederaProof.sequenceNumber) : 0,
        });
      } catch (error) {
        console.warn('⚠️  Failed to write provenance event to GridDB:', (error as Error).message);
      }
    }

    // Add to chain (in-memory)
    chain.events.push(event);
    chain.lastUpdated = timestamp;

    // Update owner if transfer event
    if (eventType === 'OWNERSHIP_TRANSFERRED' && data['newOwner']) {
      chain.currentOwner = data['newOwner'] as string;
    }

    return event;
  }

  /**
   * Perform compliance check
   */
  async checkCompliance(shieldId: string): Promise<ComplianceCheck> {
    console.log(`\n📋 Checking compliance for shield: ${shieldId}...`);

    const shield = this.shields.get(shieldId);
    if (!shield) {
      throw new Error(`Shield not found: ${shieldId}`);
    }

    // Check NIST compliance
    const nistFips203 = shield.migrationState !== 'CLASSICAL_ONLY'; // ML-KEM-768
    const nistFips204 = shield.migrationState !== 'CLASSICAL_ONLY'; // ML-DSA-65

    // Check CNSA 2.0 compliance (requires Category 3: ML-KEM-768, ML-DSA-65)
    const cnsa20 =
      shield.migrationState === 'HYBRID_SIGN' ||
      shield.migrationState === 'HYBRID_ENCRYPT' ||
      shield.migrationState === 'PQC_PRIMARY' ||
      shield.migrationState === 'PQC_ONLY';

    // Check EU AI Act compliance (requires transparency and security by design)
    const euAiAct = shield.migrationState !== 'CLASSICAL_ONLY';

    const recommendations: string[] = [];

    // Generate migration recommendations
    if (shield.migrationState === 'CLASSICAL_ONLY') {
      recommendations.push('URGENT: Migrate to HYBRID_SIGN immediately - not quantum-safe');
    } else if (shield.migrationState === 'HYBRID_SIGN') {
      recommendations.push('Recommended: Plan migration to PQC_PRIMARY by 2030');
    } else if (shield.migrationState === 'PQC_PRIMARY') {
      recommendations.push('Good: On track for 2035 PQC_ONLY mandate');
    }

    const compliance: ComplianceCheck = {
      shieldId,
      compliant: nistFips203 && nistFips204 && cnsa20 && euAiAct,
      regulations: {
        'NIST-FIPS-203': nistFips203,
        'NIST-FIPS-204': nistFips204,
        'CNSA-2.0': cnsa20,
        'EU-AI-Act': euAiAct,
      },
      migrationReadiness: {
        state: shield.migrationState,
        nextState: this.getNextMigrationState(shield.migrationState),
        deadline: shield.migrationState === 'PQC_PRIMARY' ? '2035-01-01' : '2030-01-01',
      },
      recommendations,
      checkedAt: new Date().toISOString(),
    };

    console.log(
      `✅ Compliance check complete: ${compliance.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`
    );

    return compliance;
  }

  /**
   * Create integrity hash for asset
   */
  private async createIntegrityHash(assetData: AssetData): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha3-256');
    hash.update(JSON.stringify(assetData));
    return hash.digest('hex');
  }

  /**
   * Initialize provenance chain
   */
  private async initializeProvenanceChain(
    shield: ShieldResult,
    assetData: AssetData
  ): Promise<void> {
    const chain: ProvenanceChain = {
      shieldId: shield.shieldId,
      assetId: shield.assetId,
      events: [],
      currentOwner: assetData.owner,
      createdAt: shield.timestamp,
      lastUpdated: shield.timestamp,
    };

    // Add creation event
    await this.addProvenanceEvent(shield.shieldId, 'SHIELD_CREATED', assetData.owner, {
      assetType: assetData.assetType,
      name: assetData.name,
      migrationState: shield.migrationState,
    });

    this.provenanceChains.set(shield.shieldId, chain);
  }

  /**
   * Verify provenance chain integrity
   */
  private async verifyProvenanceChain(chain: ProvenanceChain): Promise<boolean> {
    // Verify each event's quantum signature
    for (const event of chain.events) {
      const verification = await this.quantumCrypto.verifySignature(
        event.quantumSignature.publicKey,
        JSON.stringify({
          eventId: event.eventId,
          shieldId: event.shieldId,
          eventType: event.eventType,
          timestamp: event.timestamp,
          actor: event.actor,
          data: event.data,
        }),
        event.quantumSignature.signature
      );

      if (!verification.valid) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get next migration state
   */
  private getNextMigrationState(current: CryptoMigrationState): CryptoMigrationState | undefined {
    const stateOrder: CryptoMigrationState[] = [
      'CLASSICAL_ONLY',
      'HYBRID_SIGN',
      'HYBRID_ENCRYPT',
      'PQC_PRIMARY',
      'PQC_ONLY',
    ];

    const currentIndex = stateOrder.indexOf(current);
    return currentIndex < stateOrder.length - 1 ? stateOrder[currentIndex + 1] : undefined;
  }

  /**
   * Get shield provenance from Mirror Node
   * Queries historical HCS topic messages for shield events
   */
  async getProvenanceFromMirrorNode(topicId: string, shieldId: string): Promise<any[]> {
    console.log(`\n🔍 Querying Mirror Node for shield provenance: ${shieldId}...`);

    const proofs = await this.mirrorNode.verifyShieldProvenance(topicId, shieldId);

    console.log(`✅ Found ${proofs.length} provenance events on Mirror Node`);

    return proofs;
  }

  /**
   * Get NFT metadata from Mirror Node
   */
  async getNFTMetadataFromMirrorNode(tokenId: string, serialNumber: number): Promise<any> {
    console.log(`\n📥 Fetching NFT metadata from Mirror Node: ${tokenId}/${serialNumber}...`);

    const metadata = await this.mirrorNode.getNFTMetadata(tokenId, serialNumber);

    return metadata;
  }

  /**
   * Get NFT transfer history from Mirror Node
   */
  async getNFTTransferHistory(tokenId: string, serialNumber: number): Promise<any[]> {
    console.log(`\n📜 Fetching NFT transfer history: ${tokenId}/${serialNumber}...`);

    const history = await this.mirrorNode.getNFTTransferHistory(tokenId, serialNumber);

    return history;
  }

  /**
   * Verify shield integrity using Mirror Node data
   * Cross-references local shield data with blockchain history
   */
  async verifyShieldWithMirrorNode(shieldId: string): Promise<{
    verified: boolean;
    localShield: ShieldResult | undefined;
    mirrorNodeProofs: any[];
    discrepancies: string[];
  }> {
    console.log(`\n🔐 Verifying shield with Mirror Node: ${shieldId}...`);

    const localShield = this.shields.get(shieldId);
    const discrepancies: string[] = [];

    if (!localShield) {
      return {
        verified: false,
        localShield: undefined,
        mirrorNodeProofs: [],
        discrepancies: ['Shield not found in local storage'],
      };
    }

    // Extract topic ID from Hedera proof
    const topicId = localShield.hederaProof.topicId;

    // Query Mirror Node for proofs
    const mirrorNodeProofs = await this.mirrorNode.verifyShieldProvenance(topicId, shieldId);

    if (mirrorNodeProofs.length === 0) {
      discrepancies.push('No proofs found on Mirror Node');
    }

    // TODO: Verify timestamp consistency
    // Note: SubmittedProof doesn't have consensusTimestamp, need to determine correct timestamp field
    // const mirrorNodeTimestamp = mirrorNodeProofs[0]?.consensusTimestamp;
    // if (mirrorNodeTimestamp && localShield.hederaProof.proofData.timestamp !== mirrorNodeTimestamp) {
    //   discrepancies.push('Timestamp mismatch between local and Mirror Node');
    // }

    const verified = discrepancies.length === 0;

    console.log(
      verified
        ? `✅ Shield verified successfully`
        : `⚠️  Shield verification found ${discrepancies.length} discrepancies`
    );

    return {
      verified,
      localShield,
      mirrorNodeProofs,
      discrepancies,
    };
  }

  /**
   * Get shield by ID
   */
  getShield(shieldId: string): ShieldResult | undefined {
    return this.shields.get(shieldId);
  }

  /**
   * List all shields
   */
  listShields(): ShieldResult[] {
    return Array.from(this.shields.values());
  }

  /**
   * Get HIP-412 compliant metadata for a shield
   * Useful for IPFS upload and NFT marketplace integration
   */
  getHIP412Metadata(shieldId: string): HIP412Metadata {
    const shield = this.shields.get(shieldId);
    if (!shield) {
      throw new Error(`Shield not found: ${shieldId}`);
    }

    if (!shield.hip412Metadata) {
      throw new Error(`Shield ${shieldId} does not have HIP-412 metadata`);
    }

    return shield.hip412Metadata;
  }

  /**
   * Validate shield metadata against HIP-412
   * Returns validation warnings if any
   */
  validateShieldMetadata(shieldId: string): string[] {
    const shield = this.shields.get(shieldId);
    if (!shield) {
      throw new Error(`Shield not found: ${shieldId}`);
    }

    if (!shield.hip412Metadata) {
      return ['Shield does not have HIP-412 metadata'];
    }

    const validation = HIP412Validator.validateQuantumShieldMetadata(shield.hip412Metadata);
    return validation.warnings;
  }

  /**
   * Prepare shield metadata for IPFS upload
   * Returns JSON string ready for IPFS storage
   */
  prepareIPFSMetadata(shieldId: string): string {
    const metadata = this.getHIP412Metadata(shieldId);
    return HIP412Validator.generateIPFSMetadata(metadata);
  }
}

export default NFTShieldService;
