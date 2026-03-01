import Link from 'next/link';
import { PolicyLayout } from '@/components/policy-layout';

export const metadata = {
  title: 'Terms of Service - Quantum-Shield NFT',
  description: 'Terms of service for the Quantum-Shield NFT platform by TAURUS AI Corp.',
};

export default function TermsOfServicePage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      lastUpdated="March 1, 2026"
      relatedLink={{ href: '/privacy', label: 'Privacy Policy' }}
    >
      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using Quantum-Shield NFT (&quot;the Service&quot;), operated by
          TAURUS AI Corp (&quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">2. Description of Service</h2>
        <p className="text-muted-foreground leading-relaxed">
          Quantum-Shield NFT provides post-quantum cryptographic protection for digital
          assets and NFTs. The Service includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>ML-DSA-65 quantum-safe digital signatures (NIST FIPS 204)</li>
          <li>ML-KEM-768 key encapsulation (NIST FIPS 203)</li>
          <li>5-state crypto-agility migration management</li>
          <li>Hedera blockchain provenance recording (HCS/HTS)</li>
          <li>AI-powered compliance guidance via Pinecone RAG</li>
          <li>NFT marketplace with quantum-safe signing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">3. Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          You must be at least 18 years old and have the legal capacity to enter into
          these terms. If you are using the Service on behalf of an organization, you
          represent that you have authority to bind that organization.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">4. Account and Wallet</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            You are responsible for safeguarding your Hedera wallet credentials and
            account access.
          </li>
          <li>
            We do not have access to your private keys and cannot recover lost wallets.
          </li>
          <li>
            You are responsible for all activity that occurs under your account or wallet.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">5. Blockchain Transactions</h2>
        <p className="text-muted-foreground leading-relaxed">
          Transactions submitted to the Hedera network are irreversible. Once a
          cryptographic signature, provenance record, or migration event is published
          to Hedera Consensus Service, it cannot be modified or deleted. You acknowledge
          and accept this immutability. Standard Hedera network fees apply to all
          on-chain operations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">6. Cryptographic Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our quantum-safe cryptographic implementations follow NIST standards (FIPS 203,
          FIPS 204). However, cryptography is an evolving field. We do not guarantee that
          any algorithm will remain secure indefinitely. Our crypto-agility framework is
          designed to facilitate migration to newer algorithms as standards evolve.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">7. Acceptable Use</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to circumvent security controls or rate limits</li>
          <li>Reverse-engineer cryptographic implementations</li>
          <li>Submit malicious payloads or attempt injection attacks</li>
          <li>Use the Service to shield assets involved in fraud or money laundering</li>
          <li>Exceed API rate limits (100 requests/minute) through automated means</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">8. Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Service, including its cryptographic implementations, UI, documentation,
          and branding, is owned by TAURUS AI Corp and licensed under FSL-1.1-Apache-2.0.
          You retain ownership of your digital assets and NFTs. We claim no rights over
          content you protect using the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">9. Export Controls</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Service incorporates cryptographic technology that may be subject to export
          control regulations. You agree to comply with all applicable export control laws
          including those of Canada, the United States, and the UAE. See our{' '}
          <Link href="https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/blob/main/EXPORT-CONTROL.md" className="text-primary hover:underline">
            Export Control Policy
          </Link>{' '}
          for details.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">10. Disclaimers</h2>
        <p className="text-muted-foreground leading-relaxed">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
          IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
          OR THAT ANY CRYPTOGRAPHIC ALGORITHM WILL REMAIN SECURE AGAINST ALL FUTURE
          ATTACK VECTORS, INCLUDING QUANTUM COMPUTING ADVANCES BEYOND CURRENT THREAT
          MODELS.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">11. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, TAURUS AI CORP SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
          LOSS OF DIGITAL ASSETS, CRYPTOCURRENCY, OR NFT VALUE, REGARDLESS OF THE CAUSE
          OF ACTION.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">12. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These terms are governed by the laws of the Province of Ontario, Canada.
          Disputes shall be resolved in the courts of Ontario, Canada.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">13. Changes</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may modify these terms at any time. Continued use of the Service after
          changes constitutes acceptance. Material changes will be communicated via the
          platform or email with 30 days notice.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-8 mb-3">14. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          TAURUS AI Corp — admin@taurusai.io
          <br />
          Ontario, Canada | Dubai, UAE (IFZA #66075)
        </p>
      </section>
    </PolicyLayout>
  );
}
