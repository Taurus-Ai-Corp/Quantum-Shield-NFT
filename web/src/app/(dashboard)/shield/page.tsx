'use client';

import { useState } from 'react';
import { Shield, Upload, CheckCircle } from 'lucide-react';

export default function ShieldPage() {
  const [assetId, setAssetId] = useState('');
  const [category, setCategory] = useState('art');
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    creator: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement shield creation via API
    console.log('Shield asset:', { assetId, category, metadata });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Shield Asset</h1>
        <p className="text-muted-foreground mt-2">
          Protect your digital asset with quantum-safe ML-DSA signatures
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shield Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-6">
            {/* Asset ID */}
            <div>
              <label htmlFor="assetId" className="block text-sm font-medium mb-2">
                Asset ID / Token ID
              </label>
              <input
                type="text"
                id="assetId"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="0.0.12345:1 or hedera://0.0.12345/nft/1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hedera token ID (HTS format) or IPFS CID
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Asset Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="art">Digital Art</option>
                <option value="collectible">Collectible</option>
                <option value="music">Music</option>
                <option value="video">Video</option>
                <option value="gaming">Gaming Item</option>
                <option value="document">Document</option>
                <option value="ip">Intellectual Property</option>
                <option value="realestate">Real Estate</option>
              </select>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="font-semibold">Asset Metadata</h3>

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={metadata.name}
                  onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                  placeholder="Quantum-Protected Asset #1"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  placeholder="Describe your asset..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="creator" className="block text-sm font-medium mb-2">
                  Creator / Owner
                </label>
                <input
                  type="text"
                  id="creator"
                  value={metadata.creator}
                  onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                  placeholder="0.0.xxxxx (Hedera Account ID)"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Shield className="w-5 h-5" />
              Create Quantum Shield
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Process Steps */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Shield Process</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Generate ML-DSA Keypair</p>
                  <p className="text-xs text-muted-foreground">NIST FIPS 204 (ML-DSA-65)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Sign Asset Metadata</p>
                  <p className="text-xs text-muted-foreground">Quantum-safe signature (3309 bytes)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Store on IPFS</p>
                  <p className="text-xs text-muted-foreground">Decentralized metadata storage</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Anchor to Hedera HCS</p>
                  <p className="text-xs text-muted-foreground">Immutable provenance record</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Shield Created</p>
                  <p className="text-xs text-muted-foreground">Asset is quantum-protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Security Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm:</span>
                <span className="font-medium">ML-DSA-65</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security Level:</span>
                <span className="font-medium">NIST Level 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signature Size:</span>
                <span className="font-medium">3,309 bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blockchain:</span>
                <span className="font-medium">Hedera HCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-medium">~$0.0001</span>
              </div>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-primary" />
            <p className="font-semibold mb-1">NIST FIPS 204 Compliant</p>
            <p className="text-xs text-muted-foreground">
              Approved for CNSA 2.0 (Jan 2027)
              <br />
              EU AI Act Ready (Aug 2026)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
