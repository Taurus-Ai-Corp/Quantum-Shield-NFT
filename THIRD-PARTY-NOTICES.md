# Third-Party Notices

This file contains attribution notices for third-party software components used in Quantum-Shield-NFT.

---

## Overview

Quantum-Shield-NFT depends on various open-source libraries. This document provides attribution and license information for all third-party dependencies.

**Project License:** FSL 1.1 (Functional Source License)
- Converts to MIT License after 2 years from release date
- See LICENSE file for full terms

---

## Production Dependencies

### Core Backend

#### @fastify/cors
- **Copyright:** Fastify Team
- **License:** MIT
- **Purpose:** CORS middleware for Fastify
- **Source:** https://github.com/fastify/fastify-cors

#### @fastify/rate-limit
- **Copyright:** Fastify Team
- **License:** MIT
- **Purpose:** Rate limiting for API endpoints
- **Source:** https://github.com/fastify/fastify-rate-limit

#### fastify
- **Copyright:** Matteo Collina, Tomas Della Vedova, Fastify Team
- **License:** MIT
- **Purpose:** High-performance web framework
- **Source:** https://github.com/fastify/fastify

### Blockchain Integration

#### @hashgraph/sdk
- **Copyright:** Hedera Hashgraph, LLC
- **License:** Apache-2.0
- **Purpose:** Hedera Hashgraph SDK (HTS, HCS, HSCS)
- **Source:** https://github.com/hashgraph/hedera-sdk-js
- **Version:** 2.50.0

**Apache-2.0 Notice:**
```
Copyright 2020-2024 Hedera Hashgraph, LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### Post-Quantum Cryptography

#### @noble/post-quantum
- **Copyright:** Paul Miller (paulmillr.com)
- **License:** MIT
- **Purpose:** ML-DSA-65, ML-KEM-768 implementations (NIST FIPS 203/204)
- **Source:** https://github.com/paulmillr/noble-post-quantum
- **Version:** 0.5.2

#### @noble/curves
- **Copyright:** Paul Miller (paulmillr.com)
- **License:** MIT
- **Purpose:** Elliptic curve cryptography (Ed25519, secp256k1)
- **Source:** https://github.com/paulmillr/noble-curves

### Vector Database

#### @pinecone-database/pinecone
- **Copyright:** Pinecone Systems, Inc.
- **License:** Apache-2.0
- **Purpose:** Vector database client for semantic search
- **Source:** https://github.com/pinecone-io/pinecone-ts-client

### Utilities

#### dotenv
- **Copyright:** Scott Motte
- **License:** BSD-2-Clause
- **Purpose:** Environment variable loading
- **Source:** https://github.com/motdotla/dotenv

#### uuid
- **Copyright:** Robert Kieffer
- **License:** MIT
- **Purpose:** RFC4122 UUID generation
- **Source:** https://github.com/uuidjs/uuid

#### zod
- **Copyright:** Colin McDonnell
- **License:** MIT
- **Purpose:** TypeScript-first schema validation
- **Source:** https://github.com/colinhacks/zod

---

## Frontend Dependencies

### Framework

#### next
- **Copyright:** Vercel, Inc.
- **License:** MIT
- **Purpose:** React framework for production
- **Source:** https://github.com/vercel/next.js
- **Version:** 15.2.9

#### react
- **Copyright:** Meta Platforms, Inc.
- **License:** MIT
- **Purpose:** JavaScript library for building user interfaces
- **Source:** https://github.com/facebook/react
- **Version:** 19.0.0

#### react-dom
- **Copyright:** Meta Platforms, Inc.
- **License:** MIT
- **Purpose:** React DOM renderer
- **Source:** https://github.com/facebook/react
- **Version:** 19.0.0

### UI Components

#### @radix-ui/react-dialog
- **Copyright:** Modulz
- **License:** MIT
- **Purpose:** Accessible dialog components
- **Source:** https://github.com/radix-ui/primitives

#### @radix-ui/react-dropdown-menu
- **Copyright:** Modulz
- **License:** MIT
- **Purpose:** Accessible dropdown menu components
- **Source:** https://github.com/radix-ui/primitives

#### lucide-react
- **Copyright:** Lucide Contributors
- **License:** ISC
- **Purpose:** Icon library
- **Source:** https://github.com/lucide-icons/lucide

### Styling

#### tailwindcss
- **Copyright:** Tailwind Labs, Inc.
- **License:** MIT
- **Purpose:** Utility-first CSS framework
- **Source:** https://github.com/tailwindlabs/tailwindcss

#### class-variance-authority
- **Copyright:** Joe Bell
- **License:** Apache-2.0
- **Purpose:** CSS class variance utilities
- **Source:** https://github.com/joe-bell/cva

#### clsx
- **Copyright:** Luke Edwards
- **License:** MIT
- **Purpose:** Conditional className construction
- **Source:** https://github.com/lukeed/clsx

#### tailwind-merge
- **Copyright:** Dany Castillo
- **License:** MIT
- **Purpose:** Merge Tailwind CSS classes
- **Source:** https://github.com/dcastil/tailwind-merge

### Authentication

#### next-auth
- **Copyright:** NextAuth.js Contributors
- **License:** ISC
- **Purpose:** Authentication for Next.js
- **Source:** https://github.com/nextauthjs/next-auth
- **Version:** 5.0.0-beta.30

---

## Development Dependencies

### Testing

#### jest
- **Copyright:** Meta Platforms, Inc.
- **License:** MIT
- **Purpose:** JavaScript testing framework
- **Source:** https://github.com/jestjs/jest

#### @testing-library/react
- **Copyright:** Testing Library Team
- **License:** MIT
- **Purpose:** React component testing utilities
- **Source:** https://github.com/testing-library/react-testing-library

#### @playwright/test
- **Copyright:** Microsoft Corporation
- **License:** Apache-2.0
- **Purpose:** End-to-end testing framework
- **Source:** https://github.com/microsoft/playwright

### TypeScript

#### typescript
- **Copyright:** Microsoft Corporation
- **License:** Apache-2.0
- **Purpose:** TypeScript language compiler
- **Source:** https://github.com/microsoft/TypeScript
- **Version:** 5.8.0

#### @types/node
- **Copyright:** DefinitelyTyped Contributors
- **License:** MIT
- **Purpose:** TypeScript definitions for Node.js
- **Source:** https://github.com/DefinitelyTyped/DefinitelyTyped

### Linting & Formatting

#### eslint
- **Copyright:** OpenJS Foundation
- **License:** MIT
- **Purpose:** JavaScript linter
- **Source:** https://github.com/eslint/eslint

#### @typescript-eslint/eslint-plugin
- **Copyright:** TypeScript ESLint Team
- **License:** MIT
- **Purpose:** TypeScript linting rules
- **Source:** https://github.com/typescript-eslint/typescript-eslint

#### prettier
- **Copyright:** Prettier Contributors
- **License:** MIT
- **Purpose:** Code formatter
- **Source:** https://github.com/prettier/prettier

---

## Notable Transitive Dependencies

### Cryptography (via @hashgraph/sdk)

#### elliptic
- **Copyright:** Fedor Indutny
- **License:** MIT
- **Purpose:** Elliptic curve cryptography
- **Source:** https://github.com/indutny/elliptic

#### bn.js
- **Copyright:** Fedor Indutny
- **License:** MIT
- **Purpose:** Big number library
- **Source:** https://github.com/indutny/bn.js

#### @ethersproject/*
- **Copyright:** Richard Moore
- **License:** MIT
- **Purpose:** Ethereum utilities (used by Hedera SDK)
- **Source:** https://github.com/ethers-io/ethers.js

---

## License Texts

### MIT License

```
MIT License

Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Apache License 2.0

```
Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Full license text available at:
https://www.apache.org/licenses/LICENSE-2.0.txt
```

### ISC License

```
ISC License

Copyright (c) <year>, <copyright holder>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

### BSD-2-Clause License

```
BSD 2-Clause License

Copyright (c) <year>, <copyright holder>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

---

## Generating This File

To regenerate this file with current dependencies:

```bash
# List all dependencies
npm list --all --json > dependencies.json

# For production only
npm list --prod --json > prod-dependencies.json

# Check licenses
npx license-checker --summary
```

---

## Compliance

### License Compatibility

All dependencies are compatible with FSL 1.1 (which converts to MIT):
- ✅ MIT → Compatible
- ✅ Apache-2.0 → Compatible (preserves Apache components)
- ✅ ISC → Compatible (similar to MIT)
- ✅ BSD-2-Clause → Compatible

No GPL, LGPL, or other copyleft licenses are used in production dependencies.

### Export Control

The cryptographic dependencies are subject to U.S. export control laws (ECCN 5D002). See EXPORT-CONTROL.md for compliance details.

---

## Contact

For license questions or compliance concerns:

**Email:** legal@taurusai.io (or admin@taurusai.io)
**Company:** TAURUS AI CORP - FZCO
**Website:** https://taurusai.io

---

## Acknowledgments

We are grateful to the open-source community and all contributors to the dependencies used in this project. Special thanks to:

- **Hedera Hashgraph Team** for the excellent SDK
- **Paul Miller (paulmillr)** for @noble/post-quantum and quantum-safe crypto implementations
- **Vercel & Next.js Team** for the amazing framework
- **Meta & React Team** for React 19
- **Fastify Team** for the high-performance backend framework
- **All open-source contributors** who make projects like this possible

---

**Last Updated:** 2026-02-24
**Version:** 2.0.0
**Full Dependency List:** See package.json and package-lock.json
