'use client';

import Image from 'next/image';
import { Shield, Clock } from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  description: string;
  category: 'art' | 'collectible' | 'gaming' | 'music' | 'document' | 'ip' | 'identity' | 'other';
  imageUrl?: string;
  shieldStatus: 'protected' | 'pending' | 'unprotected';
  mldsaLevel: 'ML-DSA-44' | 'ML-DSA-65' | 'ML-DSA-87';
  mlkemLevel: 'ML-KEM-512' | 'ML-KEM-768' | 'ML-KEM-1024';
  createdAt: string;
  provenanceHash: string;
}

interface NFTCardProps {
  nft: NFT;
}

export function NFTCard({ nft }: NFTCardProps) {
  const statusColors = {
    protected: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unprotected: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Image */}
      {nft.imageUrl && (
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={nft.imageUrl}
            alt={nft.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-1">{nft.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {nft.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Asset ID:</span>
            <span className="font-mono">{nft.id}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Category:</span>
            <span className="capitalize">{nft.category}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Provenance:</span>
            <span className="font-mono">{truncateHash(nft.provenanceHash)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${
              statusColors[nft.shieldStatus]
            }`}
          >
            <Shield className="w-3 h-3" />
            {nft.shieldStatus}
          </div>
        </div>

        {/* Quantum Crypto Levels */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            {nft.mldsaLevel}
          </span>
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            {nft.mlkemLevel}
          </span>
        </div>

        {/* Created At */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <time dateTime={nft.createdAt}>
            {new Date(nft.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>
    </article>
  );
}

