#!/usr/bin/env tsx
/**
 * Index Compliance Documents to Pinecone
 *
 * Indexes EU AI Act, CNSA 2.0, NIST FIPS 203/204 documentation
 * into Pinecone `hedera-docs` index for RAG queries.
 *
 * Usage: npx tsx scripts/index-compliance-docs.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { PineconeRAGService, type DocumentMetadata, PINECONE_INDEXES } from '../src/services/PineconeRAGService.js';

interface ComplianceDocument {
  filePath: string;
  title: string;
  category: 'compliance';
  jurisdiction: string;
  version: string;
}

const COMPLIANCE_DOCS: ComplianceDocument[] = [
  {
    filePath: 'docs/compliance/eu-ai-act.md',
    title: 'EU AI Act - Quantum-Safe NFT Compliance',
    category: 'compliance',
    jurisdiction: 'EU',
    version: '2024'
  },
  {
    filePath: 'docs/compliance/cnsa-2.0.md',
    title: 'CNSA 2.0 - Commercial National Security Algorithm Suite',
    category: 'compliance',
    jurisdiction: 'US',
    version: '2.0'
  },
  {
    filePath: 'docs/compliance/nist-fips-203.md',
    title: 'NIST FIPS 203 - ML-KEM Standard',
    category: 'compliance',
    jurisdiction: 'NIST',
    version: 'FIPS 203'
  },
  {
    filePath: 'docs/compliance/nist-fips-204.md',
    title: 'NIST FIPS 204 - ML-DSA Standard',
    category: 'compliance',
    jurisdiction: 'NIST',
    version: 'FIPS 204'
  }
];

/**
 * Simple text chunking with overlap
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 100) {
      chunks.push(chunk.trim());
    }
  }

  return chunks;
}

/**
 * Extract metadata from markdown content
 */
function extractMetadata(content: string, doc: ComplianceDocument): {
  url: string;
  sections: string[];
} {
  const sections: string[] = [];

  const headerRegex = /^#{2,3}\s+(.+)$/gm;
  let match;

  while ((match = headerRegex.exec(content)) !== null) {
    sections.push(match[1].trim());
  }

  const url = `https://docs.taurusai.io/compliance/${path.basename(doc.filePath, '.md')}`;

  return { url, sections };
}

async function main() {
  console.log('\\n🚀 Starting Compliance Document Indexing...\\n');

  const pinecone = new PineconeRAGService();

  await pinecone.initializeContextOS();

  console.log('\\n📚 Processing compliance documents...\\n');

  let totalChunks = 0;

  for (const doc of COMPLIANCE_DOCS) {
    console.log(`\\n📄 Processing: ${doc.title}`);

    try {
      const content = await fs.readFile(doc.filePath, 'utf-8');
      const { url } = extractMetadata(content, doc);
      const chunks = chunkText(content, 512, 50);

      console.log(`   Chunks: ${chunks.length}`);

      const documents = chunks.map((chunk, index) => {
        const chunkId = `${path.basename(doc.filePath, '.md')}-chunk-${index}`;

        const metadata: Omit<DocumentMetadata, 'indexed_at'> = {
          source: doc.filePath,
          category: doc.category,
          title: `${doc.title} (Part ${index + 1}/${chunks.length})`,
          url: `${url}#section-${index}`,
          version: doc.version,
          text: chunk
        };

        return { id: chunkId, text: chunk, metadata };
      });

      await pinecone.batchIndexDocuments(PINECONE_INDEXES.HEDERA_DOCS, documents);

      totalChunks += chunks.length;

      console.log(`   ✅ Indexed ${chunks.length} chunks`);

    } catch (error) {
      console.error(`   ❌ Error:`, error);
      throw error;
    }
  }

  console.log(`\\n✅ Complete! Total chunks: ${totalChunks}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\\n❌ Failed:', error);
    process.exit(1);
  });
}

export { main as indexComplianceDocs };
