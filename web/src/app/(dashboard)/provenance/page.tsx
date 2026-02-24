import { FileText, Search } from 'lucide-react';

export default function ProvenancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Provenance Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Verify quantum signatures and track asset provenance on Hedera HCS
        </p>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-lg p-6">
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          Search by Asset ID or Shield ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="search"
            placeholder="0.0.12345:1 or shield-abc123"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90">
            <Search className="w-4 h-4" />
            Verify
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card border rounded-lg p-12 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold mb-2">No Provenance Records Yet</h2>
        <p className="text-muted-foreground">
          Search for an asset ID to view its provenance chain
        </p>
      </div>
    </div>
  );
}
