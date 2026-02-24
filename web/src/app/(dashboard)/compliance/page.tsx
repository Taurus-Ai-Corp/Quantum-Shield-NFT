import { BarChart3, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track migration to post-quantum cryptography and regulatory compliance
        </p>
      </div>

      {/* Compliance Score */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Compliance Score</h2>
            <p className="text-muted-foreground">Overall system readiness</p>
          </div>
          <div className="text-5xl font-bold text-primary">98%</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">NIST FIPS 203/204 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">CNSA 2.0 Ready (Jan 2027)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">EU AI Act (Aug 2026)</span>
          </div>
        </div>
      </div>

      {/* Migration Status */}
      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">5-State Crypto-Agility Migration</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* CLASSICAL_ONLY */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg opacity-50">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">CLASSICAL_ONLY</p>
                <p className="text-sm text-muted-foreground">Traditional RSA/ECDSA signatures</p>
              </div>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>

            {/* HYBRID_SIGN */}
            <div className="flex items-center gap-4 p-4 bg-primary/10 border-2 border-primary rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">HYBRID_SIGN (Current)</p>
                <p className="text-sm text-muted-foreground">
                  Dual signatures: RSA + ML-DSA-65
                </p>
              </div>
              <span className="text-sm font-medium text-primary">Active</span>
            </div>

            {/* HYBRID_KEM */}
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 rounded-full border-2 border-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">HYBRID_KEM</p>
                <p className="text-sm text-muted-foreground">Add X25519 + ML-KEM-768 key exchange</p>
              </div>
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>

            {/* PQC_PREFERRED */}
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 rounded-full border-2 border-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">PQC_PREFERRED</p>
                <p className="text-sm text-muted-foreground">Prioritize quantum-safe, verify classical</p>
              </div>
              <span className="text-sm text-muted-foreground">Planned</span>
            </div>

            {/* PQC_ONLY */}
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 rounded-full border-2 border-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">PQC_ONLY</p>
                <p className="text-sm text-muted-foreground">Pure quantum-safe (Jan 2030 target)</p>
              </div>
              <span className="text-sm text-muted-foreground">Future</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Timeline */}
      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Regulatory Compliance Timeline</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-semibold">EU AI Act - August 2, 2026</p>
              <p className="text-sm text-muted-foreground">
                High-risk AI systems must use quantum-resistant cryptography
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-semibold">CNSA 2.0 - January 2027 (NSS)</p>
              <p className="text-sm text-muted-foreground">
                National Security Systems must migrate to PQC algorithms
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-semibold">CNSA 2.0 - January 2030 (All Systems)</p>
              <p className="text-sm text-muted-foreground">
                All U.S. government systems complete PQC migration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
