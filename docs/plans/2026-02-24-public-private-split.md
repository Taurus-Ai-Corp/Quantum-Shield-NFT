# Public/Private Repository Split

**Date:** 2026-02-24
**Phase:** 2 of 6 (Enterprise Repository Setup)
**Status:** Planning

---

## Overview

Create a public-facing SDK repository while maintaining proprietary code in the private repository. This enables open-source contributions, showcases capabilities, and attracts developers while protecting 25 patent-pending claims.

**Private Repo (Current):**
- Quantum-crypto implementations (ML-DSA/ML-KEM)
- NFT marketplace proprietary logic
- AI agent orchestration
- Smart contract code
- Internal development tools

**Public Repo (New):**
- Compiled SDK (npm package)
- API documentation
- Example applications
- Getting started guides
- Public demos

---

## Architecture

### Repository Structure

```
quantum-shield-nft (Private - Current)
├── src/
│   ├── quantum-crypto/          # PRIVATE: Patent-pending PQC
│   ├── nft-marketplace/         # PRIVATE: Proprietary marketplace
│   ├── ai-agents/               # PRIVATE: Agent orchestration
│   ├── contracts/               # PRIVATE: Smart contracts
│   ├── api/                     # PUBLIC: API definitions only
│   └── sdk/                     # NEW: Public SDK layer
├── examples/                    # PUBLIC: Example applications
├── docs/                        # PUBLIC: Documentation
└── dist/                        # COMPILED: Build output for public

quantum-shield-sdk (Public - New)
├── dist/                        # Compiled SDK from private repo
├── examples/                    # Synced from private repo
├── docs/                        # Synced from private repo
├── README.md                    # Public-facing documentation
└── package.json                 # Public npm package config
```

### Public SDK Layer

Create abstraction layer that exposes functionality without revealing proprietary algorithms:

```typescript
// src/sdk/index.ts (NEW)
export { QuantumShieldClient } from './client';
export { ShieldAPI } from './api';
export type { ShieldOptions, ShieldResult, ProvenanceEvent } from './types';

// Exports compiled functionality, not source code
```

### GitHub Actions Sync Workflow

Automated synchronization from private → public:

```yaml
# .github/workflows/sync-public.yml
name: Sync Public Repository

on:
  push:
    branches: [main]
    paths:
      - 'dist/**'
      - 'examples/**'
      - 'docs/public/**'
      - 'README.md'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Build SDK
        run: npm run build:sdk

      - name: Sync to public repo
        run: |
          git clone https://github.com/Taurus-Ai-Corp/quantum-shield-sdk.git public
          cp -r dist/* public/dist/
          cp -r examples/* public/examples/
          cp -r docs/public/* public/docs/
          cp README.public.md public/README.md
          cd public
          git add .
          git commit -m "Sync from private repo"
          git push
```

---

## Implementation Steps

### Step 1: Create Public SDK Layer

**Files to Create:**

1. `src/sdk/index.ts` - Public SDK entry point
2. `src/sdk/client.ts` - QuantumShieldClient class
3. `src/sdk/api.ts` - ShieldAPI interface
4. `src/sdk/types.ts` - Public type definitions

**Key Principles:**
- Expose only high-level APIs (no implementation details)
- All methods return compiled code from dist/
- Type definitions safe for public consumption
- No references to proprietary algorithms

**Example SDK Client:**

```typescript
// src/sdk/client.ts
import { ShieldAPI } from './api';
import { ShieldOptions, ShieldResult } from './types';

/**
 * Quantum-Shield-NFT SDK Client
 *
 * Public interface for quantum-safe NFT protection using Hedera blockchain.
 *
 * @example
 * ```typescript
 * const client = new QuantumShieldClient({
 *   network: 'testnet',
 *   operatorId: '0.0.12345',
 *   operatorKey: '302e...'
 * });
 *
 * const result = await client.shieldAsset({
 *   assetId: '0.0.67890:1',
 *   metadata: { name: 'Patent #001', category: 'ip' }
 * });
 * ```
 */
export class QuantumShieldClient implements ShieldAPI {
  private config: ShieldOptions;
  private compiled: any; // Points to dist/ compiled code

  constructor(options: ShieldOptions) {
    this.config = options;
    // Load compiled implementation from dist/
    this.compiled = require('../../../dist/shield-service.js');
  }

  async shieldAsset(params: ShieldAssetParams): Promise<ShieldResult> {
    // Delegates to compiled code (no proprietary source visible)
    return this.compiled.shieldAsset(params);
  }

  async verifyIntegrity(shieldId: string): Promise<VerificationResult> {
    return this.compiled.verifyIntegrity(shieldId);
  }

  async getProvenance(shieldId: string): Promise<ProvenanceEvent[]> {
    return this.compiled.getProvenance(shieldId);
  }
}
```

### Step 2: Create Public Package Configuration

**File:** `package.public.json`

```json
{
  "name": "@quantum-shield/sdk",
  "version": "2.0.0",
  "description": "Quantum-safe NFT protection SDK for Hedera blockchain",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "license": "FSL-1.1-MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Taurus-Ai-Corp/quantum-shield-sdk.git"
  },
  "homepage": "https://taurusai.io",
  "keywords": [
    "quantum-safe",
    "post-quantum",
    "nft",
    "hedera",
    "blockchain",
    "ml-dsa",
    "ml-kem"
  ],
  "dependencies": {
    "@hashgraph/sdk": "^2.50.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "next": "^15.0.0"
  }
}
```

### Step 3: Create Public Documentation

**Files to Create:**

1. `README.public.md` - Public-facing README
2. `docs/public/GETTING_STARTED.md` - Installation guide
3. `docs/public/API.md` - API reference
4. `docs/public/EXAMPLES.md` - Usage examples
5. `docs/public/CONTRIBUTING.md` - Contribution guidelines (for public repo)

**README.public.md Structure:**

```markdown
# Quantum-Shield-NFT SDK

> Quantum-safe NFT protection for Hedera blockchain

[![License](https://img.shields.io/badge/license-FSL--1.1--MIT-blue)](LICENSE)
[![npm](https://img.shields.io/npm/v/@quantum-shield/sdk)](https://www.npmjs.com/package/@quantum-shield/sdk)

## Features

- ⚛️ **Quantum-Safe Cryptography** - ML-DSA-65 + ML-KEM-768 (NIST FIPS 203/204)
- 🔗 **Hedera Blockchain** - HTS/HCS integration for immutable provenance
- 🛡️ **5-State Crypto-Agility** - Seamless migration path to quantum-safe algorithms
- 📜 **Tamper-Proof Provenance** - Complete asset history on-chain
- 🌐 **Regulatory Compliance** - EU AI Act, CNSA 2.0, G7 PQC Roadmap

## Installation

\`\`\`bash
npm install @quantum-shield/sdk
# or
yarn add @quantum-shield/sdk
\`\`\`

## Quick Start

\`\`\`typescript
import { QuantumShieldClient } from '@quantum-shield/sdk';

const client = new QuantumShieldClient({
  network: 'testnet',
  operatorId: process.env.HEDERA_OPERATOR_ID!,
  operatorKey: process.env.HEDERA_OPERATOR_KEY!
});

// Shield an asset
const result = await client.shieldAsset({
  assetId: '0.0.12345:1',
  metadata: {
    name: 'Patent #001',
    category: 'ip',
    description: 'Machine learning patent'
  }
});

console.log('Shield ID:', result.shieldId);
console.log('Quantum Signature:', result.signature);
\`\`\`

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [API Reference](docs/API.md)
- [Examples](docs/EXAMPLES.md)
- [Contributing](CONTRIBUTING.md)

## License

[FSL 1.1 (Functional Source License)](LICENSE)

Converts to MIT License 2 years after release date.

## Support

- 📧 Email: admin@taurusai.io
- 🐛 Issues: [GitHub Issues](https://github.com/Taurus-Ai-Corp/quantum-shield-sdk/issues)
- 💬 Discord: [TAURUS AI Community](https://discord.gg/taurusai)
```

### Step 4: Create GitHub Actions Workflow

**File:** `.github/workflows/sync-public.yml`

```yaml
name: Sync Public Repository

on:
  workflow_dispatch: # Manual trigger for now
  push:
    branches: [main]
    paths:
      - 'dist/**'
      - 'examples/**'
      - 'docs/public/**'
      - 'README.public.md'

jobs:
  build-sdk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout private repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build SDK for public distribution
        run: npm run build:sdk

      - name: Generate type definitions
        run: npm run build:types

      - name: Upload SDK artifact
        uses: actions/upload-artifact@v4
        with:
          name: sdk-dist
          path: dist/

  sync-public:
    needs: build-sdk
    runs-on: ubuntu-latest
    steps:
      - name: Download SDK artifact
        uses: actions/download-artifact@v4
        with:
          name: sdk-dist
          path: dist/

      - name: Checkout public repo
        uses: actions/checkout@v4
        with:
          repository: Taurus-Ai-Corp/quantum-shield-sdk
          token: ${{ secrets.PUBLIC_REPO_PAT }}
          path: public

      - name: Sync files
        run: |
          # Copy compiled SDK
          cp -r dist/* public/dist/

          # Copy public documentation
          cp -r docs/public/* public/docs/

          # Copy examples
          cp -r examples/* public/examples/

          # Copy public-facing README
          cp README.public.md public/README.md

          # Copy public package.json
          cp package.public.json public/package.json

      - name: Commit and push
        working-directory: public
        run: |
          git config user.name "TAURUS AI Bot"
          git config user.email "bot@taurusai.io"
          git add .
          git diff --quiet && git diff --staged --quiet || git commit -m "Sync from private repo ($(date -u +"%Y-%m-%d %H:%M:%S UTC"))"
          git push
```

### Step 5: Set Up Public Repository

**GitHub Actions:**

1. Create new repository: `Taurus-Ai-Corp/quantum-shield-sdk`
2. Set repository visibility: Public
3. Configure repository settings:
   - Enable Issues
   - Enable Discussions
   - Enable GitHub Pages (for documentation)
   - Disable Wiki (use discussions instead)
4. Add repository secrets:
   - `PUBLIC_REPO_PAT` - Personal Access Token for sync

**Repository Protection:**

```bash
# Configure branch protection for public repo
gh repo create Taurus-Ai-Corp/quantum-shield-sdk --public --description "Quantum-safe NFT protection SDK"

gh api repos/Taurus-Ai-Corp/quantum-shield-sdk/branches/main/protection \
  -X PUT \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=ci \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -f enforce_admins=true
```

### Step 6: Configure npm Publishing

**File:** `.github/workflows/publish-npm.yml`

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: Taurus-Ai-Corp/quantum-shield-sdk

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Security Considerations

### Code Review Before Sync

**CRITICAL:** All code synced to public repo must be reviewed to ensure no proprietary code leaks.

**Review Checklist:**

- [ ] No proprietary algorithm implementations in dist/
- [ ] No internal comments or TODOs in compiled code
- [ ] No API keys, secrets, or credentials in examples
- [ ] No references to internal systems or infrastructure
- [ ] No patent-pending methods exposed in type definitions
- [ ] All third-party licenses properly attributed

### Automated Security Scanning

Add pre-sync security scanning:

```yaml
# .github/workflows/sync-public.yml
- name: Scan for secrets
  run: |
    npm install -g detect-secrets
    detect-secrets scan --baseline .secrets.baseline dist/

- name: Verify no proprietary patterns
  run: |
    # Check for patent-pending code markers
    if grep -r "PATENT PENDING" dist/; then
      echo "ERROR: Proprietary code detected in dist/"
      exit 1
    fi
```

---

## License Considerations

### FSL 1.1 → MIT Conversion

**Timeline:**
- Release Date: 2026-03-01 (target)
- MIT Conversion: 2028-03-01 (2 years from release)
- Patent Filing: Within 12 months of release

**Public Package License Notice:**

```markdown
# License

This software is licensed under the Functional Source License, Version 1.1,
MIT Future License (FSL-1.1-MIT).

## Functional Source License (Years 0-2)

For the first 2 years from the release date (2026-03-01 to 2028-02-28):
- ✅ Permitted: Use, modification, distribution
- ❌ Prohibited: Production use by competitors in NFT/quantum security space
- See LICENSE file for full terms

## MIT License (After Year 2)

Starting 2028-03-01, this software automatically converts to MIT License.
- ✅ Full open-source freedom
- ✅ Commercial use unrestricted
- ✅ Modification and redistribution
```

---

## Testing Strategy

### Before Public Release

1. **Compile SDK:**
   ```bash
   npm run build:sdk
   npm run build:types
   ```

2. **Test SDK in isolation:**
   ```bash
   cd /tmp/test-sdk
   npm init -y
   npm install /path/to/quantum-shield-nft/dist
   node test-sdk.js
   ```

3. **Verify no proprietary code leaks:**
   ```bash
   # Check compiled output
   cat dist/index.js | grep -E "(quantum-crypto|proprietary|PATENT)"

   # Should return nothing (all private code should be compiled away)
   ```

4. **Example application test:**
   ```bash
   cd examples/basic-shield
   npm install
   npm test
   npm start
   ```

---

## Rollout Plan

### Phase 2a: Internal Testing (Week 1)

- [ ] Create SDK layer in private repo
- [ ] Build and test SDK locally
- [ ] Verify no proprietary code in dist/
- [ ] Test example applications

### Phase 2b: Public Repository Setup (Week 2)

- [ ] Create public GitHub repository
- [ ] Configure GitHub Actions sync workflow
- [ ] Set up branch protection and security scanning
- [ ] Initial sync (manual trigger)

### Phase 2c: npm Package Publishing (Week 3)

- [ ] Register npm package `@quantum-shield/sdk`
- [ ] Configure npm publishing workflow
- [ ] Publish v2.0.0-beta.1 (beta test with partners)
- [ ] Gather feedback and iterate

### Phase 2d: Public Launch (Week 4)

- [ ] Publish v2.0.0 to npm
- [ ] Announce on social media (Twitter, LinkedIn, Product Hunt)
- [ ] Submit to Hedera ecosystem showcase
- [ ] Enable GitHub Discussions for community

---

## Success Metrics

**Week 4 Goals:**

- [ ] Public repository live and syncing automatically
- [ ] SDK published to npm
- [ ] Example applications working in public repo
- [ ] Documentation complete and accessible
- [ ] Zero proprietary code leaks detected
- [ ] Community engagement (10+ stars, 5+ discussions)

**Month 3 Goals:**

- [ ] 100+ npm downloads
- [ ] 5+ community contributions (issues/PRs)
- [ ] 3+ example applications in public repo
- [ ] Featured in Hedera ecosystem newsletter

---

## Related Documentation

- [SECURITY.md](../security/SECURITY.md) - Security policy
- [EXPORT-CONTROL.md](../compliance/EXPORT-CONTROL.md) - Export restrictions
- [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md) - License attributions
- [VULNERABILITY-ASSESSMENT.md](../security/VULNERABILITY-ASSESSMENT.md) - Dependency audit

---

**Next Phase:** Phase 3 - Example Application Development
**Estimated Time:** 4 weeks
