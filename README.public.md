# Quantum-Shield-NFT SDK

> Quantum-safe NFT protection for Hedera blockchain using post-quantum cryptography

[![License](https://img.shields.io/badge/license-FSL--1.1--MIT-blue)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@quantum-shield/sdk)](https://www.npmjs.com/package/@quantum-shield/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Hedera](https://img.shields.io/badge/Hedera-HTS%2FHCS-purple)](https://hedera.com)
[![NIST PQC](https://img.shields.io/badge/NIST-FIPS%20203%2F204-green)](https://csrc.nist.gov/projects/post-quantum-cryptography)

## Features

- ⚛️ **Quantum-Safe Cryptography** - ML-DSA-65 (FIPS 204) + ML-KEM-768 (FIPS 203) for future-proof security
- 🔗 **Hedera Blockchain** - HTS/HCS integration for immutable provenance and consensus
- 🛡️ **5-State Crypto-Agility** - Seamless migration path from classical to quantum-safe algorithms
- 📜 **Tamper-Proof Provenance** - Complete asset history recorded on-chain
- 🌐 **Regulatory Compliance** - EU AI Act (Aug 2026), CNSA 2.0 (Jan 2027), G7 PQC Roadmap ready
- 🔐 **Zero-Knowledge Proofs** - Privacy-preserving verification without revealing sensitive data
- ⚡ **High Performance** - Optimized for production use with minimal overhead
- 📦 **TypeScript First** - Fully typed SDK with comprehensive IntelliSense support

## Why Quantum-Safe NFTs?

Quantum computers pose an existential threat to classical cryptography (RSA, ECDSA, Ed25519). Once large-scale quantum computers are available (estimated 2030-2035), they can:

- Break digital signatures using Shor's algorithm
- Decrypt archived data retroactively ("harvest now, decrypt later" attacks)
- Forge asset ownership proofs
- Compromise provenance integrity

**Quantum-Shield-NFT** protects your NFTs today with algorithms designed to resist quantum attacks tomorrow.

## Installation

```bash
npm install @quantum-shield/sdk
# or
yarn add @quantum-shield/sdk
# or
pnpm add @quantum-shield/sdk
```

## Quick Start

```typescript
import { QuantumShieldClient } from '@quantum-shield/sdk';

// Initialize client
const client = new QuantumShieldClient({
  network: 'testnet', // or 'mainnet'
  operatorId: process.env.HEDERA_OPERATOR_ID!,
  operatorKey: process.env.HEDERA_OPERATOR_KEY!,
});

// Shield an NFT with quantum-safe cryptography
const result = await client.shieldAsset({
  assetId: '0.0.12345:1', // Hedera Token ID
  metadata: {
    name: 'CryptoPunk #001',
    category: 'art',
    description: 'Rare CryptoPunk from 2017',
    image: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
  },
});

console.log('✅ Asset shielded!');
console.log('Shield ID:', result.shieldId);
console.log('Quantum Signature:', result.signature);
console.log('Provenance Topic:', result.provenanceTopicId);

// Verify integrity
const verification = await client.verifyIntegrity(result.shieldId);
console.log('Integrity valid:', verification.isValid);

// Get provenance history
const events = await client.getProvenance(result.shieldId);
events.forEach(event => {
  console.log(`${event.timestamp}: ${event.type} by ${event.actor}`);
});
```

## Core Concepts

### Quantum-Safe Digital Signatures

**ML-DSA-65** (Module-Lattice Digital Signature Algorithm, NIST FIPS 204) provides:
- 128-bit quantum security
- Fast signature generation (~500μs)
- Fast verification (~200μs)
- Compact signatures (~2,400 bytes)

### Hedera Blockchain Integration

**Hedera Token Service (HTS):**
- Native NFT support (no smart contracts required)
- Low fees (~$0.001 per transaction)
- 3-5 second finality

**Hedera Consensus Service (HCS):**
- Immutable provenance recording
- Verifiable timestamp ordering
- Decentralized consensus without mining

### 5-State Crypto-Agility Model

Seamless migration path for post-quantum transition:

1. **CLASSICAL_ONLY** - Traditional ECDSA/Ed25519 (current standard)
2. **HYBRID_PREPARE** - Dual keys generated (classical + quantum-safe)
3. **HYBRID_SIGN** - Both signatures created (recommended for transition)
4. **HYBRID_VERIFY** - Accept both signature types (backwards compatible)
5. **QUANTUM_ONLY** - Pure ML-DSA-65 (quantum-safe future)

```typescript
// Migrate shields to quantum-only state
const status = await client.migrateToState('QUANTUM_ONLY');
console.log('Migration progress:', status.progress, '%');
```

## Use Cases

### 1. Intellectual Property Protection

```typescript
const patent = await client.shieldAsset({
  assetId: '0.0.67890:1',
  metadata: {
    name: 'Patent #US123456',
    category: 'ip',
    description: 'Machine learning optimization method',
    attributes: {
      filingDate: '2024-01-15',
      inventors: 'Alice, Bob',
      claims: '25',
    },
  },
});
```

### 2. Luxury Goods Authentication

```typescript
const watch = await client.shieldAsset({
  assetId: '0.0.11111:1',
  metadata: {
    name: 'Rolex Submariner #89371',
    category: 'collectible',
    description: '1960s vintage Rolex in mint condition',
    attributes: {
      serialNumber: '89371',
      model: 'Submariner 5513',
      year: '1965',
      certification: 'CertID-12345',
    },
  },
});
```

### 3. Legal Document Notarization

```typescript
const contract = await client.shieldAsset({
  assetId: '0.0.22222:1',
  metadata: {
    name: 'Real Estate Purchase Agreement',
    category: 'document',
    description: 'Property sale contract for 123 Main St',
    attributes: {
      parcelId: 'PAR-2024-00123',
      buyer: 'Alice Smith',
      seller: 'Bob Jones',
      amount: '500000',
    },
  },
});
```

### 4. Supply Chain Provenance

```typescript
// Record origin
const origin = await client.shieldAsset({
  assetId: '0.0.33333:1',
  metadata: {
    name: 'Organic Coffee Beans - Batch #2024-001',
    category: 'other',
    description: 'Ethiopian Yirgacheffe from Kochere farm',
    attributes: {
      origin: 'Ethiopia',
      farm: 'Kochere Co-op',
      harvestDate: '2024-01-10',
      weight: '1000kg',
    },
  },
});

// Transfer ownership through supply chain
await client.transferOwnership(origin.shieldId, '0.0.44444'); // Importer
await client.transferOwnership(origin.shieldId, '0.0.55555'); // Roaster
await client.transferOwnership(origin.shieldId, '0.0.66666'); // Retailer

// View complete provenance
const provenance = await client.getProvenance(origin.shieldId);
// Returns: SHIELD_CREATED → OWNERSHIP_TRANSFERRED (x3)
```

## API Reference

### `QuantumShieldClient`

#### Constructor

```typescript
new QuantumShieldClient(options: ShieldOptions)
```

**Options:**
- `network`: `'testnet' | 'mainnet' | 'previewnet'` (default: `'testnet'`)
- `operatorId`: Hedera account ID (format: `"0.0.xxxxx"`)
- `operatorKey`: Hedera private key (hex or DER format)
- `cryptoState`: `CryptoState` (default: `'HYBRID_SIGN'`)
- `debug`: `boolean` (default: `false`)

#### Methods

**`shieldAsset(params: ShieldAssetParams): Promise<ShieldResult>`**
- Shield an asset with quantum-safe cryptography

**`verifyIntegrity(shieldId: string): Promise<VerificationResult>`**
- Verify shield integrity and signature validity

**`getProvenance(shieldId: string): Promise<ProvenanceEvent[]>`**
- Get complete provenance history from HCS

**`getMigrationStatus(): Promise<MigrationStatus>`**
- Get current crypto-agility migration status

**`migrateToState(targetState: CryptoState): Promise<MigrationStatus>`**
- Migrate shields to new cryptographic state

**`transferOwnership(shieldId: string, newOwner: string): Promise<ProvenanceEvent>`**
- Transfer asset ownership (records to HCS)

**`updateMetadata(shieldId: string, metadata: Partial<AssetMetadata>): Promise<ShieldResult>`**
- Update asset metadata (regenerates signature)

**`getShield(shieldId: string): Promise<ShieldResult>`**
- Get shield details by ID

**`listShields(options?: { limit?: number; offset?: number }): Promise<ShieldResult[]>`**
- List all shields for operator account

### Types

Full TypeScript type definitions are available in the SDK. Use IntelliSense for inline documentation.

```typescript
import type {
  ShieldOptions,
  ShieldResult,
  VerificationResult,
  ProvenanceEvent,
  AssetMetadata,
  CryptoState,
  // ... and more
} from '@quantum-shield/sdk';
```

## Documentation

- [Getting Started Guide](https://docs.taurusai.io/quantum-shield/getting-started)
- [API Reference](https://docs.taurusai.io/quantum-shield/api)
- [Examples](https://github.com/Taurus-Ai-Corp/quantum-shield-sdk/tree/main/examples)
- [Migration Guide](https://docs.taurusai.io/quantum-shield/migration)
- [FAQ](https://docs.taurusai.io/quantum-shield/faq)

## Examples

Comprehensive examples are available in the [examples/](https://github.com/Taurus-Ai-Corp/quantum-shield-sdk/tree/main/examples) directory:

- **Basic Shield** - Simple NFT shielding example
- **Provenance Tracking** - Complete supply chain example
- **Ownership Transfer** - Multi-party asset transfer
- **Crypto-Agility Migration** - State migration example
- **React Integration** - Next.js app with Quantum-Shield
- **Node.js Backend** - Express API with shield endpoints

## Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher (peer dependency)
- Hedera testnet/mainnet account with HBAR balance

## Security

### Reporting Vulnerabilities

Please report security vulnerabilities to:
- **Email:** admin@taurusai.io
- **GitHub:** [Private Security Advisory](https://github.com/Taurus-Ai-Corp/quantum-shield-sdk/security/advisories/new)

See [SECURITY.md](SECURITY.md) for our security policy.

### Cryptographic Algorithms

- **ML-DSA-65** (NIST FIPS 204) - Digital signatures
- **ML-KEM-768** (NIST FIPS 203) - Key encapsulation
- **SHA3-256** - Cryptographic hashing

All algorithms are implemented using [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) by Paul Miller.

## License

This software is licensed under the **Functional Source License, Version 1.1, MIT Future License (FSL-1.1-MIT)**.

### FSL 1.1 Terms (Years 0-2)

For the first 2 years from the release date (2026-03-01 to 2028-02-28):

✅ **Permitted Use:**
- Internal use within organizations
- Non-commercial use
- Academic research and education
- Evaluation and testing

❌ **Prohibited Use:**
- Production use by competitors in NFT/quantum security space
- Offering as-a-service competing with Quantum-Shield-NFT

### MIT License (After Year 2)

Starting **2028-03-01**, this software automatically converts to the **MIT License**:

✅ **Full Open-Source Freedom:**
- Commercial use unrestricted
- Modification and redistribution
- Private use
- Sublicensing

See [LICENSE](LICENSE) for full terms.

## Compliance

### Regulatory Standards

- **EU AI Act** (August 2026) - High-risk AI system compliance
- **CNSA 2.0** (January 2027) - NSA Commercial National Security Algorithm Suite 2.0
- **G7 PQC Roadmap** - Coordinated post-quantum transition
- **NIST FIPS 203/204** - Standardized quantum-safe algorithms

### Export Control

This software is subject to U.S. export control laws (ECCN 5D002, TSU License Exception). See [EXPORT-CONTROL.md](EXPORT-CONTROL.md) for details.

**Restricted Destinations:**
- Cuba, Iran, North Korea, Syria, Russia, Belarus
- Individuals/entities on SDN List, Entity List, Denied Persons List

**Prohibited Use Cases:**
- Weapons systems
- Intelligence gathering (offensive)
- Nuclear applications

## Roadmap

### Q1 2026 ✅
- [x] Core SDK with ML-DSA-65 + ML-KEM-768
- [x] Hedera HTS/HCS integration
- [x] 5-state crypto-agility model
- [x] npm package publication

### Q2 2026 🚧
- [ ] React/Next.js UI components
- [ ] GraphQL API for provenance queries
- [ ] Dashboard for shield management
- [ ] Multi-sig support

### Q3-Q4 2026 📅
- [ ] Ethereum/Polygon bridge
- [ ] Mobile SDK (React Native)
- [ ] Advanced analytics dashboard
- [ ] Enterprise SLA and support

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Before contributing:**
1. Read the [Code of Conduct](CODE_OF_CONDUCT.md)
2. Sign the [Contributor License Agreement](CLA.md)
3. Check [open issues](https://github.com/Taurus-Ai-Corp/quantum-shield-sdk/issues)

## Support

- 📧 **Email:** admin@taurusai.io
- 💬 **Discord:** [TAURUS AI Community](https://discord.gg/taurusai)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Taurus-Ai-Corp/quantum-shield-sdk/issues)
- 📚 **Docs:** [docs.taurusai.io](https://docs.taurusai.io/quantum-shield)
- 🐦 **Twitter:** [@TaurusAI_Corp](https://twitter.com/TaurusAI_Corp)

## Acknowledgments

Built with:
- [Hedera Hashgraph SDK](https://github.com/hashgraph/hedera-sdk-js) by Hedera Hashgraph, LLC
- [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) by Paul Miller
- [TypeScript](https://www.typescriptlang.org/) by Microsoft

## Citation

If you use Quantum-Shield-NFT in academic research, please cite:

```bibtex
@software{quantum_shield_nft_2026,
  title = {Quantum-Shield-NFT: Post-Quantum NFT Protection SDK},
  author = {TAURUS AI CORP},
  year = {2026},
  url = {https://github.com/Taurus-Ai-Corp/quantum-shield-sdk},
  license = {FSL-1.1-MIT}
}
```

---

**Made with ⚛️ by [TAURUS AI CORP](https://taurusai.io)**
