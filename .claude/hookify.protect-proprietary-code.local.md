---
name: protect-proprietary-code
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: (src/quantum-crypto|src/nft-marketplace|src/ai-agents|contracts)/
  - field: new_text
    operator: not_contains
    pattern: "PATENT PENDING"
---

⚠️ **EDITING PATENT-PENDING CODE**

You're modifying code that contains 25 patent-pending claims.

**Files affected:**
- `src/quantum-crypto/` - ML-DSA/ML-KEM implementations
- `src/nft-marketplace/` - Quantum NFT marketplace logic
- `src/ai-agents/` - AI agent orchestration
- `contracts/` - Smart contract code

**Important reminders:**
1. **Private Repository:** This code must remain in the PRIVATE repository
2. **Patent Notice:** Ensure file headers include "PATENT PENDING" notice
3. **Public Repository:** Only compiled SDK/demos go to public repo
4. **Documentation:** Update patent claims list if adding novel methods

**Patent-pending file header:**
```typescript
/**
 * Quantum-Shield-NFT - Proprietary Code
 * 
 * PATENT PENDING - Do not distribute
 * Copyright (c) 2025-2026 TAURUS AI CORP - FZCO
 * 
 * This file contains proprietary code subject to patent applications.
 * Not licensed for public use until patents are granted.
 */
```

**Questions?** Contact: legal@taurusai.io
