import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { CookieConsent } from '@/components/cookie-consent';
import { SITE_URL } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Quantum-Shield NFT - Post-Quantum Cryptography for Digital Assets',
    template: '%s | Quantum-Shield NFT',
  },
  description: 'Protect your NFTs and digital assets with quantum-safe cryptography. ML-DSA and ML-KEM powered by Hedera blockchain.',
  keywords: ['quantum-safe', 'post-quantum cryptography', 'NFT', 'Hedera', 'ML-DSA', 'ML-KEM', 'blockchain'],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Quantum-Shield NFT - Post-Quantum Cryptography for Digital Assets',
    description: 'Protect your NFTs and digital assets with NIST-approved ML-DSA & ML-KEM quantum-safe cryptography on Hedera blockchain.',
    url: SITE_URL,
    siteName: 'Quantum-Shield NFT',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum-Shield NFT',
    description: 'Post-quantum cryptographic protection for NFTs and digital assets. NIST FIPS 203/204 compliant.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <CookieConsent />
      </body>
    </html>
  );
}
