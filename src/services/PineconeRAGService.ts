/**
 * Pinecone RAG Service - Vector search and knowledge base for Quantum Shield NFT
 *
 * ContextOS/DataOS Structure:
 * - hedera-docs: Hedera/Hiero documentation chunks
 * - hedera-code-examples: Code snippets and patterns
 * - hedera-api-reference: API documentation and types
 *
 * @compliance RAG-enhanced developer assistance, compliance guidance, research integration
 */

import { Pinecone, type Index, type RecordMetadataValue } from '@pinecone-database/pinecone';

/**
 * Pinecone index names (ContextOS/DataOS namespaces)
 */
export const PINECONE_INDEXES = {
  HEDERA_DOCS: 'hedera-docs',
  CODE_EXAMPLES: 'hedera-code-examples',
  API_REFERENCE: 'hedera-api-reference',
} as const;

/**
 * Document chunk metadata
 */
export interface DocumentMetadata {
  source: string;
  category: 'hts' | 'hcs' | 'hscs' | 'sdk' | 'general' | 'compliance' | 'research';
  title: string;
  url: string;
  version: string;
  text: string;
  indexed_at: string;
  [key: string]: RecordMetadataValue;
}

/**
 * Search result with score
 */
export interface SearchResult {
  id: string;
  score: number;
  metadata: DocumentMetadata;
}

/**
 * RAG query result
 */
export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  context: string;
  confidence: number;
}

/**
 * Pinecone RAG Service
 */
export class PineconeRAGService {
  private client: Pinecone;
  private indexes: Map<string, Index>;
  private embeddingModel: 'openai' | 'anthropic' | 'local';

  constructor(config?: {
    apiKey?: string;
    environment?: string;
    embeddingModel?: 'openai' | 'anthropic' | 'local';
  }) {
    const apiKey = config?.apiKey || process.env['PINECONE_API_KEY'];

    if (!apiKey) {
      throw new Error(
        'Pinecone API key not configured. Set PINECONE_API_KEY environment variable.'
      );
    }

    this.client = new Pinecone({
      apiKey,
    });

    this.indexes = new Map();
    this.embeddingModel = config?.embeddingModel || 'openai';

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            PINECONE RAG SERVICE INITIALIZED                  ║
╠═══════════════════════════════════════════════════════════════╣
║  ContextOS/DataOS: 3 Knowledge Indexes                       ║
║  - hedera-docs (Documentation)                               ║
║  - hedera-code-examples (Code Patterns)                      ║
║  - hedera-api-reference (API Docs)                           ║
║  Embedding Model: ${this.embeddingModel.padEnd(46)} ║
║  Vector Dimension: 1536 (OpenAI ada-002)                     ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Initialize ContextOS/DataOS - Create all required indexes
   */
  async initializeContextOS(): Promise<void> {
    console.log('\n🚀 Initializing ContextOS/DataOS...');

    const indexNames = Object.values(PINECONE_INDEXES);

    for (const indexName of indexNames) {
      await this.createIndexIfNotExists(indexName);
    }

    console.log('✅ ContextOS/DataOS initialized successfully');
  }

  /**
   * Create index if it doesn't exist
   */
  private async createIndexIfNotExists(indexName: string): Promise<void> {
    try {
      const existingIndexes = await this.client.listIndexes();
      const exists = existingIndexes.indexes?.some((idx) => idx.name === indexName);

      if (exists) {
        console.log(`✓ Index already exists: ${indexName}`);
        const index = this.client.Index(indexName);
        this.indexes.set(indexName, index);
        return;
      }

      console.log(`📦 Creating index: ${indexName}...`);

      await this.client.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI ada-002 embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });

      // Wait for index to be ready
      await this.waitForIndexReady(indexName);

      const index = this.client.Index(indexName);
      this.indexes.set(indexName, index);

      console.log(`✅ Index created: ${indexName}`);
    } catch (error) {
      console.error(`Failed to create index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Wait for index to be ready
   */
  private async waitForIndexReady(indexName: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const description = await this.client.describeIndex(indexName);
        if (description.status?.ready) {
          return;
        }
      } catch {
        // Index not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    }

    throw new Error(`Index ${indexName} not ready after ${maxAttempts} attempts`);
  }

  /**
   * Get or create index
   */
  private getIndex(indexName: string): Index {
    let index = this.indexes.get(indexName);

    if (!index) {
      index = this.client.Index(indexName);
      this.indexes.set(indexName, index);
    }

    return index;
  }

  /**
   * Generate embedding for text
   * Note: In production, use actual embedding service (OpenAI, Anthropic, etc.)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Placeholder: In production, call OpenAI API or use Anthropic embeddings
    // For now, return a dummy 1536-dimensional vector
    console.warn(
      '⚠️  Using placeholder embeddings. Configure OpenAI/Anthropic API for production.'
    );

    // Generate deterministic but unique embedding based on text hash
    const hash = this.simpleHash(text);
    const embedding = new Array(1536).fill(0).map((_, i) => {
      return Math.sin(hash + i) * 0.1;
    });

    return embedding;
  }

  /**
   * Simple hash function for placeholder embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Index a document chunk
   */
  async indexDocument(
    indexName: string,
    id: string,
    text: string,
    metadata: Omit<DocumentMetadata, 'indexed_at'>
  ): Promise<void> {
    const index = this.getIndex(indexName);

    const embedding = await this.generateEmbedding(text);

    await index.upsert({
      records: [
        {
          id,
          values: embedding,
          metadata: {
            ...metadata,
            text,
            indexed_at: new Date().toISOString(),
          },
        },
      ],
    });

    console.log(`📝 Indexed document: ${id} in ${indexName}`);
  }

  /**
   * Batch index documents
   */
  async batchIndexDocuments(
    indexName: string,
    documents: Array<{
      id: string;
      text: string;
      metadata: Omit<DocumentMetadata, 'indexed_at'>;
    }>
  ): Promise<void> {
    console.log(`\n📦 Batch indexing ${documents.length} documents to ${indexName}...`);

    const index = this.getIndex(indexName);
    const batchSize = 100; // Pinecone recommends max 100 vectors per batch

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      const vectors = await Promise.all(
        batch.map(async (doc) => ({
          id: doc.id,
          values: await this.generateEmbedding(doc.text),
          metadata: {
            ...doc.metadata,
            text: doc.text,
            indexed_at: new Date().toISOString(),
          },
        }))
      );

      await index.upsert({ records: vectors });

      console.log(
        `✓ Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`
      );
    }

    console.log(`✅ Batch indexing complete: ${documents.length} documents`);
  }

  /**
   * Search for similar documents
   */
  async search(
    indexName: string,
    query: string,
    options?: {
      topK?: number;
      filter?: Record<string, unknown>;
    }
  ): Promise<SearchResult[]> {
    const index = this.getIndex(indexName);

    const queryEmbedding = await this.generateEmbedding(query);

    const response = await index.query({
      vector: queryEmbedding,
      topK: options?.topK || 5,
      includeMetadata: true,
      filter: options?.filter,
    });

    return (
      response.matches?.map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as DocumentMetadata,
      })) || []
    );
  }

  /**
   * RAG query - Search and generate answer with context
   */
  async ragQuery(
    query: string,
    options?: {
      indexes?: string[];
      topK?: number;
      filter?: Record<string, unknown>;
    }
  ): Promise<RAGResponse> {
    console.log(`\n🔍 RAG Query: "${query}"`);

    const indexesToSearch = options?.indexes || Object.values(PINECONE_INDEXES);
    const topK = options?.topK || 5;

    // Search across all specified indexes
    const searchPromises = indexesToSearch.map((indexName) =>
      this.search(indexName, query, { topK, filter: options?.filter })
    );

    const results = await Promise.all(searchPromises);
    const allResults = results
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // Build context from top results
    const context = allResults.map((result) => result.metadata.text).join('\n\n');

    // Calculate average confidence
    const avgScore = allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length;

    console.log(
      `✅ Found ${allResults.length} relevant documents (avg score: ${avgScore.toFixed(3)})`
    );

    return {
      answer: '', // To be filled by LLM in production
      sources: allResults,
      context,
      confidence: avgScore,
    };
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: string): Promise<{
    vectorCount: number;
    dimension: number;
    indexFullness: number;
  }> {
    const index = this.getIndex(indexName);
    const stats = await index.describeIndexStats();

    return {
      vectorCount: stats.totalRecordCount || 0,
      dimension: stats.dimension || 1536,
      indexFullness: stats.indexFullness || 0,
    };
  }

  /**
   * Delete documents by ID
   */
  async deleteDocuments(indexName: string, ids: string[]): Promise<void> {
    const index = this.getIndex(indexName);
    await index.deleteMany(ids);

    console.log(`🗑️  Deleted ${ids.length} documents from ${indexName}`);
  }

  /**
   * Clear entire index
   */
  async clearIndex(indexName: string): Promise<void> {
    const index = this.getIndex(indexName);
    await index.deleteAll();

    console.log(`🗑️  Cleared all documents from ${indexName}`);
  }

  /**
   * List all indexes
   */
  async listIndexes(): Promise<string[]> {
    const response = await this.client.listIndexes();
    return response.indexes?.map((idx) => idx.name) || [];
  }
}

export default PineconeRAGService;
