import { Globe, TrendingUp, Shield } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">NFT Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Browse, buy, and sell quantum-protected NFTs
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-card border rounded-lg p-12 text-center">
        <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">Marketplace Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We're building a Web3 marketplace with OpenSea/Rarible-inspired UX
          and quantum-safe transaction signing.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">ML-DSA Signatures</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Hedera HTS Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
