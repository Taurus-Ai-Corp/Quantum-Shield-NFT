import { Shield, TrendingUp, FileCheck, Zap } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your quantum-protected assets and system status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Protected Assets</p>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            NFTs with quantum-safe signatures
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Migration Status</p>
              <p className="text-2xl font-bold mt-2">HYBRID_SIGN</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            5-state crypto-agility engine
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Provenance Events</p>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Tracked on Hedera HCS
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
              <p className="text-2xl font-bold mt-2">98%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            CNSA 2.0 + EU AI Act ready
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet. Shield your first asset to get started.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
          <Shield className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Shield New Asset</h3>
          <p className="text-sm text-muted-foreground">
            Protect your NFT with ML-DSA signatures
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
          <FileCheck className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Verify Provenance</h3>
          <p className="text-sm text-muted-foreground">
            Check signature validity and chain
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
          <TrendingUp className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">View Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Track migration to PQC_PREFERRED
          </p>
        </div>
      </div>
    </div>
  );
}
