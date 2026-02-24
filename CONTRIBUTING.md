# Contributing to Quantum-Shield-NFT

Thank you for your interest in contributing to Quantum-Shield-NFT! This document provides guidelines for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review](#code-review)
- [Testing](#testing)
- [Documentation](#documentation)
- [Security](#security)

---

## Code of Conduct

This project adheres to a Code of Conduct (see CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Contributor License Agreement (CLA)

**IMPORTANT:** To contribute to Quantum-Shield-NFT, you must sign a Contributor License Agreement (CLA).

### Why CLA?

The CLA ensures:
- **Legal Clarity:** Clear ownership and licensing of contributions
- **Patent Protection:** Contributors grant patent licenses for their contributions
- **Multi-Tier Licensing:** Supports FSL 1.1 (time-delayed open-source) model
- **Commercial Use:** Allows TAURUS AI to offer commercial licenses

### How to Sign CLA

**Step 1: Read the CLA**
- Individual CLA: docs/legal/ICLA.md
- Corporate CLA: docs/legal/CCLA.md

**Step 2: Sign Electronically**
- Email: cla@taurusai.io with:
  - Full name
  - Email address (matching GitHub email)
  - GitHub username
  - Statement: "I agree to the Quantum-Shield-NFT Individual CLA"

**Step 3: Wait for Confirmation**
- You'll receive email confirmation within 48 hours

---

## Getting Started

### Prerequisites

- **Node.js:** v20.x or higher
- **npm:** v10.x or higher  
- **Git:** v2.40 or higher
- **Hedera Account:** Testnet account (for blockchain testing)

### Development Setup

```bash
# Clone repository
git clone https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT.git
cd Quantum-Shield-NFT

# Install dependencies
npm install
cd web && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Hedera testnet credentials

# Verify setup
npm run typecheck  # No errors
npm run lint       # No errors
npm test          # All tests pass
```

---

## Code Style

### TypeScript Standards

- **Strict mode:** Enabled (no `any` types)
- **Naming:** camelCase (variables/functions), PascalCase (types/classes)
- **Imports:** Named exports preferred
- **Functions:** Explicit return types

### Import Order

```typescript
// 1. React imports
import { useState } from 'react';

// 2. External libraries
import { Shield } from 'lucide-react';

// 3. Internal @/ imports
import { Button } from '@/components/ui/button';

// 4. Relative imports
import { helper } from './helper';

// 5. Types
import type { NFTData } from '@/types';
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Add/modify tests
- `chore`: Maintenance

**Examples:**
```
feat(quantum-crypto): add ML-DSA-87 support

fix(hedera): handle network timeout in HCS submission

docs(api): add shield verification endpoint reference
```

---

## Pull Request Process

### Before Creating PR

✅ **Quality Checks:**
```bash
npm run typecheck  # TypeScript compiles
npm run lint       # No linting errors
npm test           # All tests pass
```

✅ **Testing:**
- Add unit tests for new functions
- Add integration tests for features
- Coverage >80% (backend) / >75% (frontend)

✅ **Documentation:**
- Update README.md if needed
- Add inline comments
- Update API docs

### Creating PR

**Use this template:**

```markdown
## Summary
Brief description of changes.

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing done

## Checklist
- [ ] TypeScript compiles
- [ ] Linter passes
- [ ] Tests pass
- [ ] CLA signed
- [ ] Documentation updated

Closes #123
```

---

## Testing

### Test Types

```
tests/
├── unit/          # Unit tests (isolated)
├── integration/   # Integration tests
├── e2e/          # End-to-end (Playwright)
└── fixtures/     # Test data
```

### Running Tests

```bash
npm run test:all         # All tests
npm test                 # Unit tests
npm run test:integration # Integration
npm run test:e2e        # E2E
npm run test:coverage   # With coverage
```

### Coverage Requirements

- Backend: 80% minimum
- Frontend: 75% minimum
- Critical code (crypto, security): 100%

---

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security issues.

**Report via:**
1. GitHub Security Advisory: https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/security/advisories/new
2. Email: admin@taurusai.io

See SECURITY.md for full details.

### Security Guidelines

✅ **DO:**
- Validate all user inputs
- Use parameterized queries
- Store secrets in environment variables
- Use HTTPS for network requests
- Implement rate limiting

❌ **DON'T:**
- Commit secrets to git
- Use unsafe string interpolation for queries
- Disable security features (CSP, CORS)
- Trust client-side validation only

---

## Documentation

### Inline Documentation

```typescript
/**
 * Creates a quantum-safe shield for NFT asset.
 *
 * @param metadata - NFT metadata
 * @param options - Shield options
 * @returns Shield object with signature
 * @throws {ValidationError} If metadata invalid
 */
export async function createShield(
  metadata: NFTMetadata,
  options?: ShieldOptions
): Promise<Shield> {
  // Implementation
}
```

---

## Questions?

**Contact:**
- GitHub Discussions: https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/discussions
- Email: admin@taurusai.io

---

## License

By contributing, you agree contributions will be licensed under FSL 1.1 (Functional Source License). See LICENSE for details.

---

**Last Updated:** 2026-02-24
**Version:** 2.0.0
