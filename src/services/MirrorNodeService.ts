/**
 * Hedera Mirror Node Service
 * Queries historical blockchain data from Hedera Mirror Nodes
 *
 * Mirror Nodes provide REST API access to:
 * - Transaction history
 * - Account balances and tokens
 * - Token information (HTS)
 * - Topic messages (HCS)
 * - Smart contract results
 *
 * @see https://docs.hedera.com/hedera/sdks-and-apis/rest-api
 */

/**
 * Mirror Node network configuration
 */
export type MirrorNodeNetwork = 'mainnet' | 'testnet' | 'previewnet';

/**
 * Mirror Node API endpoints
 */
const MIRROR_NODE_ENDPOINTS: Record<MirrorNodeNetwork, string> = {
  mainnet: 'https://mainnet-public.mirrornode.hedera.com/api/v1',
  testnet: 'https://testnet.mirrornode.hedera.com/api/v1',
  previewnet: 'https://previewnet.mirrornode.hedera.com/api/v1',
};

/**
 * Token information from Mirror Node
 */
export interface TokenInfo {
  token_id: string;
  name: string;
  symbol: string;
  decimals: string;
  total_supply: string;
  treasury_account_id: string;
  type: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';
  created_timestamp: string;
  deleted: boolean;
}

/**
 * NFT information from Mirror Node
 */
export interface NFTInfo {
  token_id: string;
  serial_number: number;
  account_id: string;
  created_timestamp: string;
  metadata: string; // Base64 encoded
  modified_timestamp: string;
  deleted: boolean;
}

/**
 * Topic message from HCS
 */
export interface TopicMessage {
  consensus_timestamp: string;
  topic_id: string;
  message: string; // Base64 encoded
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  payer_account_id?: string;
}

/**
 * Transaction record
 */
export interface Transaction {
  consensus_timestamp: string;
  transaction_id: string;
  valid_start_timestamp: string;
  charged_tx_fee: number;
  memo_base64: string;
  result: string;
  name: string;
  node: string;
  transaction_hash: string;
}

/**
 * Account balance info
 */
export interface AccountBalance {
  timestamp: string;
  balance: {
    balance: number;
    tokens: Array<{
      token_id: string;
      balance: number;
    }>;
  };
}

/**
 * Hedera Mirror Node Service
 */
export class MirrorNodeService {
  private baseUrl: string;

  constructor(network: MirrorNodeNetwork = 'testnet') {
    this.baseUrl = MIRROR_NODE_ENDPOINTS[network];

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          MIRROR NODE SERVICE INITIALIZED                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Network: ${network.padEnd(54)} ║
║  Endpoint: ${this.baseUrl.padEnd(52)} ║
║  Query Capabilities: Tokens, NFTs, Topics, Transactions      ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Make request to Mirror Node API
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mirror Node API error: ${response.status} - ${error}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Mirror Node request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: string): Promise<TokenInfo> {
    return this.request<TokenInfo>(`/tokens/${tokenId}`);
  }

  /**
   * Get NFT information by token ID and serial number
   */
  async getNFTInfo(tokenId: string, serialNumber: number): Promise<NFTInfo> {
    return this.request<NFTInfo>(`/tokens/${tokenId}/nfts/${serialNumber}`);
  }

  /**
   * Get all NFTs for a specific token
   */
  async getTokenNFTs(tokenId: string, limit = 100): Promise<NFTInfo[]> {
    interface NFTListResponse {
      nfts: NFTInfo[];
      links?: { next: string | null };
    }

    const response = await this.request<NFTListResponse>(`/tokens/${tokenId}/nfts?limit=${limit}`);

    return response.nfts;
  }

  /**
   * Get topic messages from HCS
   */
  async getTopicMessages(
    topicId: string,
    options?: {
      limit?: number;
      order?: 'asc' | 'desc';
      sequenceNumber?: number;
    }
  ): Promise<TopicMessage[]> {
    interface TopicMessagesResponse {
      messages: TopicMessage[];
      links?: { next: string | null };
    }

    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.order) params.append('order', options.order);
    if (options?.sequenceNumber) params.append('sequencenumber', options.sequenceNumber.toString());

    const response = await this.request<TopicMessagesResponse>(
      `/topics/${topicId}/messages?${params.toString()}`
    );

    return response.messages;
  }

  /**
   * Get quantum proof messages from HCS topic
   * Decodes base64 messages and returns parsed JSON
   */
  async getQuantumProofs(topicId: string, limit = 100): Promise<any[]> {
    const messages = await this.getTopicMessages(topicId, { limit, order: 'desc' });

    return messages
      .map((msg) => {
        try {
          const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
          return {
            consensusTimestamp: msg.consensus_timestamp,
            sequenceNumber: msg.sequence_number,
            data: JSON.parse(decoded),
          };
        } catch (error) {
          console.warn('Failed to decode message:', error);
          return null;
        }
      })
      .filter(Boolean);
  }

  /**
   * Get NFT metadata (decoded from base64)
   */
  async getNFTMetadata(tokenId: string, serialNumber: number): Promise<any> {
    const nft = await this.getNFTInfo(tokenId, serialNumber);

    if (!nft.metadata) {
      return null;
    }

    try {
      const decoded = Buffer.from(nft.metadata, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Failed to decode NFT metadata:', error);
      return { raw: nft.metadata };
    }
  }

  /**
   * Get transactions for an account
   */
  async getAccountTransactions(accountId: string, limit = 100): Promise<Transaction[]> {
    interface TransactionsResponse {
      transactions: Transaction[];
      links?: { next: string | null };
    }

    const response = await this.request<TransactionsResponse>(
      `/accounts/${accountId}/transactions?limit=${limit}`
    );

    return response.transactions;
  }

  /**
   * Get account balance and token balances
   */
  async getAccountBalance(accountId: string): Promise<AccountBalance> {
    interface BalanceResponse {
      timestamp: string;
      balance: number;
      tokens: Array<{ token_id: string; balance: number }>;
    }

    const response = await this.request<BalanceResponse>(`/balances?account.id=${accountId}`);

    return {
      timestamp: response.timestamp,
      balance: {
        balance: response.balance,
        tokens: response.tokens,
      },
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    interface TransactionResponse {
      transactions: Transaction[];
    }

    const response = await this.request<TransactionResponse>(`/transactions/${transactionId}`);

    if (!response.transactions || response.transactions.length === 0) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    const transaction = response.transactions[0];
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    return transaction;
  }

  /**
   * Verify shield provenance by querying HCS topic
   * Returns all quantum proofs for a specific shield ID
   */
  async verifyShieldProvenance(topicId: string, shieldId: string): Promise<any[]> {
    const proofs = await this.getQuantumProofs(topicId);

    return proofs.filter((proof: any) => proof && proof.data && proof.data.shieldId === shieldId);
  }

  /**
   * Get NFT transfer history
   */
  async getNFTTransferHistory(
    tokenId: string,
    serialNumber: number,
    limit = 100
  ): Promise<Transaction[]> {
    interface NFTTransfersResponse {
      transactions: Transaction[];
    }

    const response = await this.request<NFTTransfersResponse>(
      `/tokens/${tokenId}/nfts/${serialNumber}/transactions?limit=${limit}`
    );

    return response.transactions;
  }

  /**
   * Search topic messages by content
   * Note: This is not directly supported by Mirror Node API,
   * so we fetch messages and filter client-side
   */
  async searchTopicMessages(
    topicId: string,
    searchTerm: string,
    limit = 1000
  ): Promise<TopicMessage[]> {
    const messages = await this.getTopicMessages(topicId, { limit });

    return messages.filter((msg) => {
      try {
        const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
        return decoded.includes(searchTerm);
      } catch {
        return false;
      }
    });
  }
}

export default MirrorNodeService;
