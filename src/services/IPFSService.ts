/**
 * IPFS Service - Decentralized storage for NFT metadata
 *
 * Supports multiple IPFS providers:
 * - Pinata (recommended for production)
 * - IPFS HTTP Client (self-hosted node)
 * - NFT.Storage (free tier available)
 *
 * @compliance HIP-412 requirement for permanent metadata storage
 */

import type { HIP412Metadata } from '../validators/HIP412Validator.js';

/**
 * IPFS upload result
 */
export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
  provider: 'pinata' | 'nft-storage' | 'ipfs-http';
  timestamp: string;
}

/**
 * IPFS service configuration
 */
export interface IPFSServiceConfig {
  provider?: 'pinata' | 'nft-storage' | 'ipfs-http';
  pinataApiKey?: string;
  pinataSecretKey?: string;
  nftStorageApiKey?: string;
  ipfsHost?: string;
  ipfsPort?: number;
}

/**
 * IPFS Service for NFT metadata storage
 */
export class IPFSService {
  private config: Required<IPFSServiceConfig>;
  private uploadHistory: Map<string, IPFSUploadResult>;

  constructor(config: IPFSServiceConfig = {}) {
    this.config = {
      provider: config.provider || 'pinata',
      pinataApiKey: config.pinataApiKey || process.env['PINATA_API_KEY'] || '',
      pinataSecretKey: config.pinataSecretKey || process.env['PINATA_SECRET_KEY'] || '',
      nftStorageApiKey: config.nftStorageApiKey || process.env['NFT_STORAGE_API_KEY'] || '',
      ipfsHost: config.ipfsHost || 'localhost',
      ipfsPort: config.ipfsPort || 5001,
    };

    this.uploadHistory = new Map();

    this.validateConfiguration();

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                IPFS SERVICE INITIALIZED                       ║
╠═══════════════════════════════════════════════════════════════╣
║  Provider: ${this.config.provider.padEnd(53)} ║
║  HIP-412 Compliant Storage                                   ║
║  Permanent Decentralized Metadata                            ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Validate configuration based on provider
   */
  private validateConfiguration(): void {
    if (this.config.provider === 'pinata') {
      if (!this.config.pinataApiKey || !this.config.pinataSecretKey) {
        console.warn(
          '⚠️  Pinata API keys not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY environment variables.'
        );
      }
    } else if (this.config.provider === 'nft-storage') {
      if (!this.config.nftStorageApiKey) {
        console.warn(
          '⚠️  NFT.Storage API key not configured. Set NFT_STORAGE_API_KEY environment variable.'
        );
      }
    }
  }

  /**
   * Upload HIP-412 metadata to IPFS
   */
  async uploadMetadata(
    metadata: HIP412Metadata,
    options?: {
      name?: string;
      pinToIPFS?: boolean;
    }
  ): Promise<IPFSUploadResult> {
    console.log(`\n📤 Uploading metadata to IPFS (${this.config.provider})...`);

    const metadataJSON = JSON.stringify(metadata, null, 2);
    const buffer = Buffer.from(metadataJSON, 'utf-8');

    let result: IPFSUploadResult;

    switch (this.config.provider) {
      case 'pinata':
        result = await this.uploadToPinata(buffer, options);
        break;
      case 'nft-storage':
        result = await this.uploadToNFTStorage(buffer, options);
        break;
      case 'ipfs-http':
        result = await this.uploadToIPFSHttp(buffer, options);
        break;
      default:
        throw new Error(`Unsupported IPFS provider: ${this.config.provider}`);
    }

    // Store in history
    this.uploadHistory.set(result.cid, result);

    console.log(`✅ Metadata uploaded: ${result.cid}`);

    return result;
  }

  /**
   * Upload to Pinata (recommended for production)
   */
  private async uploadToPinata(
    buffer: Buffer,
    options?: { name?: string; pinToIPFS?: boolean }
  ): Promise<IPFSUploadResult> {
    if (!this.config.pinataApiKey || !this.config.pinataSecretKey) {
      throw new Error('Pinata API keys not configured');
    }

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/json' });
    formData.append('file', blob, options?.name || 'metadata.json');

    // Add pinata metadata
    const metadata = JSON.stringify({
      name: options?.name || 'Quantum Shield NFT Metadata',
      keyvalues: {
        type: 'hip-412-metadata',
        quantum: 'true',
      },
    });
    formData.append('pinataMetadata', metadata);

    // Add pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: this.config.pinataApiKey,
        pinata_secret_api_key: this.config.pinataSecretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const data = (await response.json()) as {
      IpfsHash: string;
      PinSize: number;
      Timestamp: string;
    };

    return {
      cid: data.IpfsHash,
      url: `ipfs://${data.IpfsHash}`,
      size: data.PinSize,
      provider: 'pinata',
      timestamp: data.Timestamp || new Date().toISOString(),
    };
  }

  /**
   * Upload to NFT.Storage (free tier available)
   */
  private async uploadToNFTStorage(
    buffer: Buffer,
    options?: { name?: string }
  ): Promise<IPFSUploadResult> {
    if (!this.config.nftStorageApiKey) {
      throw new Error('NFT.Storage API key not configured');
    }

    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/json' });
    const file = new File([blob], options?.name || 'metadata.json', {
      type: 'application/json',
    });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.nftStorageApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NFT.Storage upload failed: ${error}`);
    }

    const data = (await response.json()) as {
      ok: boolean;
      value: { cid: string; size: number; created: string };
    };

    if (!data.ok) {
      throw new Error('NFT.Storage upload failed');
    }

    return {
      cid: data.value.cid,
      url: `ipfs://${data.value.cid}`,
      size: data.value.size,
      provider: 'nft-storage',
      timestamp: data.value.created,
    };
  }

  /**
   * Upload to IPFS HTTP API (self-hosted node)
   */
  private async uploadToIPFSHttp(
    buffer: Buffer,
    _options?: { name?: string }
  ): Promise<IPFSUploadResult> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/json' });
    formData.append('file', blob);

    const url = `http://${this.config.ipfsHost}:${this.config.ipfsPort}/api/v0/add?cid-version=1`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`IPFS HTTP upload failed: ${error}`);
    }

    const data = (await response.json()) as { Hash: string; Size: string };

    return {
      cid: data.Hash,
      url: `ipfs://${data.Hash}`,
      size: parseInt(data.Size, 10),
      provider: 'ipfs-http',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieve metadata from IPFS by CID
   */
  async retrieveMetadata(cid: string): Promise<HIP412Metadata> {
    console.log(`\n📥 Retrieving metadata from IPFS: ${cid}...`);

    // Try multiple IPFS gateways for reliability
    const gateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
    ];

    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway, {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
          const metadata = (await response.json()) as HIP412Metadata;
          console.log(`✅ Metadata retrieved from: ${gateway}`);
          return metadata;
        }
      } catch (error) {
        console.warn(`Failed to retrieve from ${gateway}:`, (error as Error).message);
        continue;
      }
    }

    throw new Error(`Failed to retrieve metadata from IPFS: ${cid}`);
  }

  /**
   * Pin existing CID (makes it permanent)
   */
  async pinCID(cid: string): Promise<void> {
    if (this.config.provider !== 'pinata') {
      console.warn('Pinning only supported with Pinata provider');
      return;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: this.config.pinataApiKey,
        pinata_secret_api_key: this.config.pinataSecretKey,
      },
      body: JSON.stringify({
        hashToPin: cid,
        pinataMetadata: {
          name: `Quantum Shield - ${cid}`,
          keyvalues: {
            quantum: 'true',
            pinned: new Date().toISOString(),
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata pinning failed: ${error}`);
    }

    console.log(`📌 Pinned to Pinata: ${cid}`);
  }

  /**
   * Get upload history
   */
  getUploadHistory(): IPFSUploadResult[] {
    return Array.from(this.uploadHistory.values());
  }

  /**
   * Get upload by CID
   */
  getUpload(cid: string): IPFSUploadResult | undefined {
    return this.uploadHistory.get(cid);
  }
}

export default IPFSService;
