import Link from 'next/link';
import { Shield, Home, FileText, Globe, BarChart3, Settings } from 'lucide-react';
import { WalletConnect } from '@/components/wallet/WalletConnect';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Shield Asset', href: '/dashboard/shield', icon: Shield },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: Globe },
  { name: 'Provenance', href: '/dashboard/provenance', icon: FileText },
  { name: 'Compliance', href: '/dashboard/compliance', icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="w-6 h-6 text-primary" />
            <span>Quantum-Shield NFT</span>
          </Link>

          <nav className="ml-auto flex items-center gap-4">
            <WalletConnect />
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9">
              <Settings className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
