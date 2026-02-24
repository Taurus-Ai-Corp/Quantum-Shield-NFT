import { HashConnect, HashConnectTypes } from '@hashgraph/hashconnect';

export interface WalletConnectionState {
  isConnected: boolean;
  accountId: string | null;
  network: 'testnet' | 'mainnet';
}

export class HederaWalletService {
  private hashconnect: HashConnect;
  private appMetadata: HashConnectTypes.AppMetadata;
  private state: WalletConnectionState;
  private topic: string | null = null;

  constructor() {
    this.hashconnect = new HashConnect();
    this.appMetadata = {
      name: 'Quantum-Shield NFT',
      description: 'Protect your digital assets with quantum-safe cryptography',
      icon: 'https://quantum-shield-nft.vercel.app/logo.png',
      url: typeof window !== 'undefined' ? window.location.origin : '',
    };
    this.state = {
      isConnected: false,
      accountId: null,
      network: 'testnet',
    };
  }

  async connect(): Promise<WalletConnectionState> {
    try {
      // Initialize HashConnect
      const initData = await this.hashconnect.init(this.appMetadata, 'testnet', false);
      this.topic = initData.topic;

      // Set up pairing event listener
      this.hashconnect.pairingEvent.on((pairingData) => {
        console.log('Pairing event:', pairingData);
        if (pairingData.accountIds && pairingData.accountIds.length > 0) {
          this.state = {
            isConnected: true,
            accountId: pairingData.accountIds[0],
            network: pairingData.network as 'testnet' | 'mainnet',
          };
        }
      });

      // Open pairing modal (will open HashPack, Blade, etc.)
      await this.hashconnect.connectToLocalWallet();

      return this.state;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error('Wallet connection failed');
    }
  }

  async disconnect(): Promise<void> {
    if (this.topic) {
      await this.hashconnect.disconnect(this.topic);
      this.state = {
        isConnected: false,
        accountId: null,
        network: 'testnet',
      };
    }
  }

  getState(): WalletConnectionState {
    return this.state;
  }

  getTopic(): string | null {
    return this.topic;
  }

  getHashConnect(): HashConnect {
    return this.hashconnect;
  }
}

// Singleton instance
let walletService: HederaWalletService | null = null;

export function getWalletService(): HederaWalletService {
  if (!walletService) {
    walletService = new HederaWalletService();
  }
  return walletService;
}
