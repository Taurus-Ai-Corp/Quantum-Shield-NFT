import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quantum-Shield NFT - Post-Quantum Cryptography for Digital Assets',
  description: 'Protect your NFTs and digital assets with quantum-safe cryptography. ML-DSA and ML-KEM powered by Hedera blockchain.',
  keywords: ['quantum-safe', 'post-quantum cryptography', 'NFT', 'Hedera', 'ML-DSA', 'ML-KEM', 'blockchain'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
