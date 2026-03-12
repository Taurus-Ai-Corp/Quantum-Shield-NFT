import Link from 'next/link';
import { Shield } from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  relatedLink: { href: string; label: string };
}

export function PolicyLayout({ title, lastUpdated, children, relatedLink }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="w-6 h-6 text-primary" />
            <span>Quantum-Shield NFT</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {lastUpdated}
        </p>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          {children}
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Quantum-Shield NFT. NIST FIPS 203/204 Compliant.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href={relatedLink.href} className="text-muted-foreground hover:text-foreground">
              {relatedLink.label}
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
