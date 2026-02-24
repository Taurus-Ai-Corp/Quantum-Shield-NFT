import Link from 'next/link';
import { Shield, Lock, Zap, FileCheck, Globe, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
            <Shield className="w-4 h-4" />
            Quantum-Safe Protection
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Protect Your Digital Assets
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Against Quantum Threats
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Quantum-Shield NFT provides post-quantum cryptography (ML-DSA, ML-KEM)
            powered by Hedera blockchain to secure your NFTs and digital assets
            against future quantum computer attacks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/shield"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Shield Your Assets
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 border border-input rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Quantum-Shield NFT?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Industry-leading quantum-safe protection with 5-state crypto-agility
            and seamless Hedera blockchain integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Quantum-Safe */}
          <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">NIST-Approved PQC</h3>
            <p className="text-muted-foreground">
              ML-DSA-65 signatures and ML-KEM-768 key exchange approved by NIST.
              Compliant with CNSA 2.0 (Jan 2027) and EU AI Act (Aug 2026).
            </p>
          </div>

          {/* Feature 2: Crypto-Agility */}
          <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">5-State Crypto-Agility</h3>
            <p className="text-muted-foreground">
              Seamlessly migrate from classical to quantum-safe cryptography with
              hybrid mode fallback. Zero downtime, zero trust issues.
            </p>
          </div>

          {/* Feature 3: Provenance Tracking */}
          <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Immutable Provenance</h3>
            <p className="text-muted-foreground">
              Track every signature, migration event, and ownership transfer
              on Hedera HCS. Cryptographic proof of authenticity.
            </p>
          </div>

          {/* Feature 4: Hedera Integration */}
          <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hedera Blockchain</h3>
            <p className="text-muted-foreground">
              Enterprise-grade blockchain with sub-second finality, fixed fees
              ($0.0001/transaction), and carbon-negative consensus.
            </p>
          </div>

          {/* Feature 5: RAG Intelligence */}
          <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Guidance</h3>
            <p className="text-muted-foreground">
              Pinecone RAG with compliance docs, research papers, and Stack Exchange
              developer knowledge. Instant answers to quantum crypto questions.
            </p>
          </div>

          {/* Feature 6: Web3 Marketplace */}
          <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Marketplace Ready</h3>
            <p className="text-muted-foreground">
              OpenSea/Rarible-inspired UX patterns with quantum-safe signing.
              List, buy, sell, and stake quantum-protected NFTs.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Assets?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join enterprises protecting $17M+ in digital assets with quantum-safe cryptography
          </p>
          <Link
            href="/dashboard/shield"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Quantum-Shield NFT. NIST FIPS 203/204 Compliant.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <Link href="/compliance" className="text-muted-foreground hover:text-foreground">
                Compliance
              </Link>
              <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
