import Link from 'next/link';
import { PolicyLayout } from '@/components/policy-layout';

export const metadata = {
  title: 'Privacy Policy - Quantum-Shield NFT',
  description: 'Privacy policy for the Quantum-Shield NFT platform by TAURUS AI Corp.',
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      lastUpdated="March 1, 2026"
      relatedLink={{ href: '/terms', label: 'Terms of Service' }}
    >
      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">1. Who We Are</h2>
        <p className="text-muted-foreground leading-relaxed">
          Quantum-Shield NFT is operated by TAURUS AI Corp (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
          registered in Ontario, Canada, with a subsidiary TAURUS AI CORP - FZCO
          (IFZA #66075, Dubai, UAE). Contact: admin@taurusai.io.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">2. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          We collect the following categories of information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong>Wallet Information:</strong> Your Hedera wallet address (public key)
            when you connect via HashConnect. We do not store private keys.
          </li>
          <li>
            <strong>Transaction Data:</strong> Asset IDs, cryptographic signatures (ML-DSA-65),
            and provenance records published to Hedera Consensus Service (HCS).
            These are immutable on-chain records.
          </li>
          <li>
            <strong>Usage Data:</strong> Pages visited, features used, API requests,
            and error logs for service improvement.
          </li>
          <li>
            <strong>Account Data:</strong> Email address and authentication credentials
            if you create an account.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Providing quantum-safe NFT protection and cryptographic signing services</li>
          <li>Recording provenance and ownership transfers on Hedera blockchain</li>
          <li>Processing crypto-agility migrations between classical and post-quantum algorithms</li>
          <li>Improving platform reliability, performance, and security</li>
          <li>Communicating service updates and security advisories</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">4. Post-Quantum Cryptography Processing</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our platform processes your digital assets using NIST-approved post-quantum
          cryptographic algorithms (ML-DSA-65 per FIPS 204, ML-KEM-768 per FIPS 203).
          Cryptographic operations are performed server-side. Generated signatures and
          key encapsulations are stored as part of your asset&apos;s provenance record on
          Hedera HCS.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">5. Blockchain Data</h2>
        <p className="text-muted-foreground leading-relaxed">
          Data published to Hedera Consensus Service is immutable and cannot be deleted.
          This includes cryptographic signatures, migration events, and ownership records.
          By using the Shield service, you acknowledge that on-chain data is permanent and
          publicly verifiable.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">6. Data Sharing</h2>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell your personal information. We may share data with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong>Hedera Network:</strong> Transaction data submitted to the public ledger
          </li>
          <li>
            <strong>Infrastructure Providers:</strong> Vercel (hosting), Pinecone (AI knowledge base)
            — under data processing agreements
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by applicable law, regulation,
            or legal process
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">7. Data Retention</h2>
        <p className="text-muted-foreground leading-relaxed">
          Off-chain account data is retained while your account is active and for 90 days
          after deletion. On-chain blockchain data (Hedera HCS) is retained permanently
          as part of the distributed ledger.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">8. Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Depending on your jurisdiction (GDPR, PIPEDA, DPDP Act), you may have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of off-chain data (on-chain data is immutable)</li>
          <li>Object to or restrict processing</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-3">
          To exercise these rights, contact admin@taurusai.io.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">9. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use essential cookies for authentication session management. We do not use
          third-party advertising or tracking cookies. Analytics cookies may be used with
          your consent.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">10. Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement quantum-safe cryptographic controls including ML-DSA-65 signatures,
          ML-KEM-768 key exchange, HSTS enforcement, Content Security Policy, and rate
          limiting. See our{' '}
          <Link href="https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/security" className="text-primary hover:underline">
            Security Policy
          </Link>{' '}
          for vulnerability reporting.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">11. Changes</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this policy to reflect changes in our practices or applicable law.
          Material changes will be communicated via the platform or email.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">12. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          TAURUS AI Corp — admin@taurusai.io
          <br />
          Ontario, Canada | Dubai, UAE (IFZA #66075)
        </p>
      </section>
    </PolicyLayout>
  );
}
