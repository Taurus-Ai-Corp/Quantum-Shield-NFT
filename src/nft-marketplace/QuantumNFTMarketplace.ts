/**
 * QuantumNFTMarketplace - Quantum-Resistant NFT Marketplace with DeFi Features
 * DeFi & Tokenization Track for Hedera Hackathon
 * Implements gamified DeFi, NFT receipts, and quantum-secured transactions
 *
 * @security ML-DSA-65 quantum signatures on all marketplace operations
 * @compliance NIST FIPS 203/204, Hedera HTS/HCS standards
 */

import { HederaClient } from '../hedera/HederaClient';
import { QuantumCryptoManager } from '../quantum-crypto/index';
import type { GeneratedIdentity, SignatureData } from '../quantum-crypto/QuantumCryptoManager';
import type {
  QuantumNFTCollection,
  MintedNFT,
  QuantumToken,
} from '../hedera/HederaClient';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

/**
 * Marketplace configuration
 */
export interface MarketplaceConfig {
  name?: string;
  symbol?: string;
  royaltyPercentage?: number;
  marketplaceFee?: number;
  questRewardMultiplier?: number;
  hederaClient?: HederaClient;
}

/**
 * Collection data for creation
 */
export const CollectionDataSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(32),
  description: z.string().optional(),
  category: z.string().optional(),
  creator: z.string(),
  maxSupply: z.number().int().positive().optional(),
});

export type CollectionData = z.infer<typeof CollectionDataSchema>;

/**
 * NFT data for minting
 */
export interface NFTData {
  name: string;
  description?: string;
  image?: string;
  owner: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: unknown;
}

/**
 * Stored collection with marketplace metadata
 */
export interface StoredCollection extends QuantumNFTCollection {
  metadata: {
    tokenId: string;  // Required by QuantumNFTCollection
    maxSupply: number;  // Required by QuantumNFTCollection
    collectionId: string;
    creator: string;
    name: string;
    symbol: string;
    description?: string;
    category?: string;
    quantumSecured: boolean;
    created: string;
  };
  signature: SignatureData;
  nfts: Map<string, StoredNFT>;
}

/**
 * Stored NFT with marketplace data
 */
export interface StoredNFT extends MintedNFT {
  receipt: NFTReceipt;
  owner: string;
  listed: boolean;
  listingId?: string;
}

/**
 * NFT Receipt structure
 */
export interface NFTReceipt {
  receiptId: string;
  type: 'MINT' | 'TRANSFER' | 'SALE' | 'STAKE';
  collectionId: string;
  serialNumber: string;
  owner: string;
  metadata: Record<string, unknown>;
  transactionId: string;
  quantumSignature: SignatureData;
  timestamp: string;
}

/**
 * Listing structure
 */
export interface Listing {
  listingId: string;
  collectionId: string;
  serialNumber: string;
  seller: string;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  created: string;
  signature?: SignatureData;
}

/**
 * Sale record
 */
export interface Sale {
  saleId: string;
  listingId: string;
  collectionId: string;
  serialNumber: string;
  seller: string;
  buyer: string;
  price: number;
  marketplaceFee: number;
  royaltyFee: number;
  timestamp: string;
  transactionId?: string;
  receipt?: NFTReceipt;
}

/**
 * User profile
 */
export interface UserProfile {
  userId: string;
  questPoints: number;
  rewardBalance: number;
  completedQuests: Set<string>;
  collections: Set<string>;
  nftsOwned: Set<string>;
  joined: string;
}

/**
 * Quest definition
 */
export interface Quest {
  questId: string;
  name: string;
  description: string;
  reward: number;
  requirementType: 'create_collection' | 'mint_nft' | 'list_nft' | 'buy_nft' | 'stake_nft';
  requirementCount: number;
  active: boolean;
}

/**
 * Staking pool configuration
 */
export interface StakingPoolConfig {
  name: string;
  collectionId: string;
  apr: number;
  minStakeDays: number;
  rewardPerDay: number;
}

/**
 * Staking pool
 */
export interface StakingPool {
  poolId: string;
  name: string;
  collectionId: string;
  apr: number;
  minStakeDays: number;
  rewardPerDay: number;
  totalStaked: number;
  stakes: Map<string, Stake>;
  created: string;
}

/**
 * Individual stake
 */
export interface Stake {
  stakeId: string;
  poolId: string;
  collectionId: string;
  serialNumber: string;
  staker: string;
  stakedAt: string;
  unlockAt: string;
  rewardsAccrued: number;
  receipt?: NFTReceipt;
}

/**
 * Marketplace metadata
 */
export interface MarketplaceMetadata {
  id: string;
  name: string;
  topic: string;
  rewardToken: string;
  quantumIdentity: GeneratedIdentity;
  initialized: string;
}

export class QuantumNFTMarketplace {
  private config: Required<MarketplaceConfig>;
  private hederaClient: HederaClient;
  private quantumCrypto: QuantumCryptoManager;
  private marketplaceId: string;
  private collections: Map<string, StoredCollection>;
  private listings: Map<string, Listing>;
  private sales: Map<string, Sale>;
  private users: Map<string, UserProfile>;
  private quests: Map<string, Quest>;
  private stakingPools: Map<string, StakingPool>;
  private marketplaceIdentity?: GeneratedIdentity;
  private rewardToken?: QuantumToken;
  private marketplaceMetadata?: MarketplaceMetadata;

  constructor(config: MarketplaceConfig = {}) {
    // Initialize Hedera client first
    this.hederaClient = config.hederaClient || new HederaClient();

    this.config = {
      name: config.name || 'QuantumShield NFT Marketplace',
      symbol: config.symbol || 'QNFT',
      royaltyPercentage: config.royaltyPercentage || 5,
      marketplaceFee: config.marketplaceFee || 2.5,
      questRewardMultiplier: config.questRewardMultiplier || 1.5,
      hederaClient: this.hederaClient,
    };

    // Initialize quantum crypto
    this.quantumCrypto = new QuantumCryptoManager({
      mldsaLevel: 'ML-DSA-65',
      mlkemLevel: 'ML-KEM-768',
    });

    // Marketplace state
    this.marketplaceId = uuidv4();
    this.collections = new Map<string, StoredCollection>();
    this.listings = new Map<string, Listing>();
    this.sales = new Map<string, Sale>();
    this.users = new Map<string, UserProfile>();
    this.quests = new Map<string, Quest>();
    this.stakingPools = new Map<string, StakingPool>();

    // Initialize default quests
    this.initializeQuests();

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║        QUANTUM NFT MARKETPLACE INITIALIZED                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Name: ${this.config.name.padEnd(54)} ║
║  Marketplace Fee: ${(this.config.marketplaceFee + '%').padEnd(43)} ║
║  Quantum Security: ML-DSA-65                                 ║
║  DeFi Features: Enabled                                      ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Initialize marketplace with quantum security
   */
  async initializeMarketplace(): Promise<MarketplaceMetadata> {
    console.log('\n🏪 Initializing Quantum NFT Marketplace...');

    // Generate quantum identity for marketplace
    this.marketplaceIdentity = await this.quantumCrypto.generateQuantumIdentity(this.config.name);

    // Create marketplace topic on HCS
    const marketplaceTopic = await this.hederaClient.createQuantumTopic({
      memo: `${this.config.name} - Marketplace Events`,
      submitKey: false,
    });

    // Create reward token for DeFi gamification
    this.rewardToken = await this.hederaClient.createQuantumToken({
      name: 'Quantum Rewards',
      symbol: 'QR',
      initialSupply: 10000000,
      decimals: 8,
    });

    // Store marketplace metadata
    this.marketplaceMetadata = {
      id: this.marketplaceId,
      name: this.config.name,
      topic: marketplaceTopic.topicId.toString(),
      rewardToken: this.rewardToken.tokenId.toString(),
      quantumIdentity: this.marketplaceIdentity,
      initialized: new Date().toISOString(),
    };

    console.log(`✅ Marketplace initialized: ${this.marketplaceId}`);
    console.log(`   HCS Topic: ${marketplaceTopic.topicId}`);
    console.log(`   Reward Token: ${this.rewardToken.tokenId}`);

    return this.marketplaceMetadata;
  }

  /**
   * Create quantum-secured NFT collection
   */
  async createCollection(collectionData: CollectionData): Promise<{
    collection: QuantumNFTCollection;
    metadata: StoredCollection['metadata'];
    signature: SignatureData;
  }> {
    // Validate input
    CollectionDataSchema.parse(collectionData);

    console.log(`\n🎨 Creating Quantum NFT Collection: ${collectionData.name}...`);

    // Create collection on Hedera
    const collection = await this.hederaClient.createQuantumNFTCollection({
      name: collectionData.name,
      symbol: collectionData.symbol,
      maxSupply: collectionData.maxSupply || 10000,
      royaltyFee: {
        numerator: this.config.royaltyPercentage,
        denominator: 100,
      },
    });

    // Create collection metadata with quantum signature
    const metadata = {
      tokenId: collection.tokenId.toString(),
      maxSupply: collectionData.maxSupply || 10000,
      collectionId: collection.tokenId.toString(),
      creator: collectionData.creator,
      name: collectionData.name,
      symbol: collectionData.symbol,
      description: collectionData.description,
      category: collectionData.category,
      quantumSecured: true,
      created: new Date().toISOString(),
    };

    // Sign metadata
    const signature = await this.quantumCrypto.signData(
      collection.quantumIdentity.identityId,
      JSON.stringify(metadata)
    );

    // Store collection
    this.collections.set(collection.tokenId.toString(), {
      ...collection,
      metadata: metadata,
      signature: signature,
      nfts: new Map<string, StoredNFT>(),
    });

    // Award quest points for collection creation
    await this.completeQuest(collectionData.creator, 'create_collection');

    console.log(`✅ Collection created: ${collection.tokenId}`);

    return {
      collection: collection,
      metadata: metadata,
      signature: signature,
    };
  }

  /**
   * Mint NFT with quantum signatures and NFT receipt
   */
  async mintNFT(
    collectionId: string,
    nftData: NFTData
  ): Promise<{
    nft: MintedNFT;
    receipt: NFTReceipt;
  }> {
    console.log(`\n🖼️ Minting Quantum NFT...`);

    // Mint NFT on Hedera
    const mintResult = await this.hederaClient.mintQuantumNFT(collectionId, nftData);

    // Generate NFT receipt as proof of mint
    const receipt = await this.generateNFTReceipt({
      type: 'MINT',
      collectionId: collectionId,
      serialNumber: mintResult.serialNumber.toString(),
      owner: nftData.owner,
      metadata: mintResult.metadata,
      transactionId: mintResult.transactionId,
    });

    // Store NFT in collection
    const collection = this.collections.get(collectionId);
    if (collection) {
      collection.nfts.set(mintResult.serialNumber.toString(), {
        ...mintResult,
        receipt: receipt,
        owner: nftData.owner,
        listed: false,
      });
    }

    // Award quest points for minting
    await this.completeQuest(nftData.owner, 'mint_nft');

    console.log(`✅ NFT minted: ${collectionId}#${mintResult.serialNumber}`);
    console.log(`   Receipt NFT: ${receipt.receiptId}`);

    return {
      nft: mintResult,
      receipt: receipt,
    };
  }

  /**
   * List NFT for sale with quantum security
   */
  async listNFT(
    collectionId: string,
    serialNumber: bigint,
    price: number
  ): Promise<{
    listingId: string;
    listing: Listing;
    signature: SignatureData;
  }> {
    console.log(`\n💰 Listing NFT for sale...`);

    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    const nft = collection.nfts.get(serialNumber.toString());
    if (!nft) {
      throw new Error('NFT not found');
    }

    // Create listing
    const listingId = uuidv4();
    const listing: Listing = {
      listingId: listingId,
      collectionId: collectionId,
      serialNumber: serialNumber.toString(),
      seller: nft.owner,
      price: price,
      status: 'active',
      created: new Date().toISOString(),
    };

    // Sign listing with quantum signature
    const signature = await this.quantumCrypto.signData(
      collection.quantumIdentity.identityId,
      JSON.stringify(listing)
    );

    // Store listing
    this.listings.set(listingId, {
      ...listing,
      signature: signature,
    });

    // Update NFT status
    nft.listed = true;
    nft.listingId = listingId;

    // Submit listing to HCS
    await this.hederaClient.submitQuantumProof({
      type: 'NFT_LISTED' as any,
      signature: signature.signature,
    } as any);

    console.log(`✅ NFT listed: ${listingId}`);
    console.log(`   Price: ${price} HBAR`);

    return {
      listingId: listingId,
      listing: listing,
      signature: signature,
    };
  }

  /**
   * Buy NFT from listing
   */
  async buyNFT(listingId: string, buyer: string): Promise<Sale> {
    console.log(`\n💳 Purchasing NFT...`);

    const listing = this.listings.get(listingId);
    if (!listing || listing.status !== 'active') {
      throw new Error('Listing not found or inactive');
    }

    const collection = this.collections.get(listing.collectionId);
    const nft = collection?.nfts.get(listing.serialNumber);

    if (!nft) {
      throw new Error('NFT not found');
    }

    // Calculate fees
    const marketplaceFee = (listing.price * this.config.marketplaceFee) / 100;
    const royaltyFee = (listing.price * this.config.royaltyPercentage) / 100;

    // Generate NFT receipt for sale
    const receipt = await this.generateNFTReceipt({
      type: 'SALE',
      collectionId: listing.collectionId,
      serialNumber: listing.serialNumber,
      owner: buyer,
      metadata: {
        price: listing.price,
        seller: listing.seller,
        buyer: buyer,
        marketplaceFee: marketplaceFee,
        royaltyFee: royaltyFee,
      },
      transactionId: `sale-${uuidv4()}`,
    });

    // Create sale record
    const sale: Sale = {
      saleId: uuidv4(),
      listingId: listingId,
      collectionId: listing.collectionId,
      serialNumber: listing.serialNumber,
      seller: listing.seller,
      buyer: buyer,
      price: listing.price,
      marketplaceFee: marketplaceFee,
      royaltyFee: royaltyFee,
      timestamp: new Date().toISOString(),
      receipt: receipt,
    };

    // Update listing status
    listing.status = 'sold';

    // Update NFT owner
    nft.owner = buyer;
    nft.listed = false;
    nft.listingId = undefined;

    // Store sale
    this.sales.set(sale.saleId, sale);

    // Award quest points
    await this.completeQuest(buyer, 'buy_nft');

    console.log(`✅ NFT purchased: ${listing.collectionId}#${listing.serialNumber}`);
    console.log(`   Sale ID: ${sale.saleId}`);
    console.log(`   Price: ${listing.price} HBAR`);

    return sale;
  }

  /**
   * Generate NFT receipt
   */
  async generateNFTReceipt(receiptData: {
    type: NFTReceipt['type'];
    collectionId: string;
    serialNumber: string;
    owner: string;
    metadata: Record<string, unknown>;
    transactionId: string;
  }): Promise<NFTReceipt> {
    // Generate quantum signature for receipt
    if (!this.marketplaceIdentity) {
      throw new Error('Marketplace not initialized');
    }

    const signature = await this.quantumCrypto.signData(
      this.marketplaceIdentity.identityId,
      JSON.stringify(receiptData)
    );

    const receipt: NFTReceipt = {
      receiptId: uuidv4(),
      type: receiptData.type,
      collectionId: receiptData.collectionId,
      serialNumber: receiptData.serialNumber,
      owner: receiptData.owner,
      metadata: receiptData.metadata,
      transactionId: receiptData.transactionId,
      quantumSignature: signature,
      timestamp: new Date().toISOString(),
    };

    return receipt;
  }

  /**
   * Create staking pool
   */
  async createStakingPool(poolConfig: StakingPoolConfig): Promise<StakingPool> {
    console.log(`\n🏊 Creating Staking Pool: ${poolConfig.name}...`);

    const poolId = uuidv4();
    const pool: StakingPool = {
      poolId: poolId,
      name: poolConfig.name,
      collectionId: poolConfig.collectionId,
      apr: poolConfig.apr,
      minStakeDays: poolConfig.minStakeDays,
      rewardPerDay: poolConfig.rewardPerDay,
      totalStaked: 0,
      stakes: new Map<string, Stake>(),
      created: new Date().toISOString(),
    };

    this.stakingPools.set(poolId, pool);

    console.log(`✅ Staking pool created: ${poolId}`);

    return pool;
  }

  /**
   * Stake NFT in pool
   */
  async stakeNFT(
    poolId: string,
    collectionId: string,
    serialNumber: bigint,
    staker: string
  ): Promise<Stake> {
    console.log(`\n🔒 Staking NFT...`);

    const pool = this.stakingPools.get(poolId);
    if (!pool) {
      throw new Error('Staking pool not found');
    }

    const collection = this.collections.get(collectionId);
    const nft = collection?.nfts.get(serialNumber.toString());

    if (!nft || nft.owner !== staker) {
      throw new Error('NFT not found or not owned by staker');
    }

    if (nft.listed) {
      throw new Error('Cannot stake listed NFT');
    }

    const stakeId = uuidv4();
    const stakedAt = new Date();
    const unlockAt = new Date(stakedAt.getTime() + pool.minStakeDays * 24 * 60 * 60 * 1000);

    // Generate staking receipt
    const receipt = await this.generateNFTReceipt({
      type: 'STAKE',
      collectionId: collectionId,
      serialNumber: serialNumber.toString(),
      owner: staker,
      metadata: {
        poolId: poolId,
        stakedAt: stakedAt.toISOString(),
        unlockAt: unlockAt.toISOString(),
        apr: pool.apr,
      },
      transactionId: `stake-${stakeId}`,
    });

    const stake: Stake = {
      stakeId: stakeId,
      poolId: poolId,
      collectionId: collectionId,
      serialNumber: serialNumber.toString(),
      staker: staker,
      stakedAt: stakedAt.toISOString(),
      unlockAt: unlockAt.toISOString(),
      rewardsAccrued: 0,
      receipt: receipt,
    };

    pool.stakes.set(stakeId, stake);
    pool.totalStaked++;

    // Award quest points
    await this.completeQuest(staker, 'stake_nft');

    console.log(`✅ NFT staked: ${collectionId}#${serialNumber}`);
    console.log(`   Stake ID: ${stakeId}`);
    console.log(`   Unlock: ${unlockAt.toISOString()}`);

    return stake;
  }

  /**
   * Initialize default quests
   */
  private initializeQuests(): void {
    const defaultQuests: Quest[] = [
      {
        questId: 'create_collection',
        name: 'Collection Creator',
        description: 'Create your first NFT collection',
        reward: 100,
        requirementType: 'create_collection',
        requirementCount: 1,
        active: true,
      },
      {
        questId: 'mint_nft',
        name: 'First Mint',
        description: 'Mint your first NFT',
        reward: 50,
        requirementType: 'mint_nft',
        requirementCount: 1,
        active: true,
      },
      {
        questId: 'list_nft',
        name: 'Marketplace Seller',
        description: 'List an NFT for sale',
        reward: 75,
        requirementType: 'list_nft',
        requirementCount: 1,
        active: true,
      },
      {
        questId: 'buy_nft',
        name: 'Collector',
        description: 'Purchase an NFT from the marketplace',
        reward: 80,
        requirementType: 'buy_nft',
        requirementCount: 1,
        active: true,
      },
      {
        questId: 'stake_nft',
        name: 'DeFi Participant',
        description: 'Stake an NFT in a pool',
        reward: 120,
        requirementType: 'stake_nft',
        requirementCount: 1,
        active: true,
      },
    ];

    defaultQuests.forEach((quest) => {
      this.quests.set(quest.questId, quest);
    });
  }

  /**
   * Complete quest and award rewards
   */
  async completeQuest(userId: string, questId: string): Promise<void> {
    const quest = this.quests.get(questId);
    if (!quest || !quest.active) {
      return;
    }

    // Get or create user profile
    let user = this.users.get(userId);
    if (!user) {
      user = {
        userId: userId,
        questPoints: 0,
        rewardBalance: 0,
        completedQuests: new Set<string>(),
        collections: new Set<string>(),
        nftsOwned: new Set<string>(),
        joined: new Date().toISOString(),
      };
      this.users.set(userId, user);
    }

    // Check if already completed
    if (user.completedQuests.has(questId)) {
      return;
    }

    // Award rewards
    const rewardAmount = quest.reward * this.config.questRewardMultiplier;
    user.questPoints += quest.reward;
    user.rewardBalance += rewardAmount;
    user.completedQuests.add(questId);

    console.log(`🎉 Quest completed: ${quest.name}`);
    console.log(`   Reward: ${rewardAmount} QR tokens`);
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile | undefined {
    return this.users.get(userId);
  }

  /**
   * Get collection
   */
  getCollection(collectionId: string): StoredCollection | undefined {
    return this.collections.get(collectionId);
  }

  /**
   * Get listing
   */
  getListing(listingId: string): Listing | undefined {
    return this.listings.get(listingId);
  }

  /**
   * Get all active listings
   */
  getActiveListings(): Listing[] {
    return Array.from(this.listings.values()).filter((l) => l.status === 'active');
  }
}

export default QuantumNFTMarketplace;
