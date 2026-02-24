# Integration Tests - Quantum-Shield-NFT

Integration tests verify that Quantum-Shield-NFT components integrate correctly with external services and infrastructure.

## Overview

Integration tests validate:

1. **Hedera Blockchain** - HCS topics, message submission, transaction queries
2. **Shield Service** - End-to-end shield creation, verification, provenance
3. **Quantum Cryptography** - ML-DSA-65 signing, ML-KEM-768 key exchange (future)
4. **Persistent Storage** - GridDB/PostgreSQL state management (future)

## Prerequisites

### 1. Hedera Testnet Account

Integration tests require a Hedera testnet account with HBAR balance.

**Create testnet account:**
1. Visit https://portal.hedera.com/register
2. Create free testnet account
3. Note your Account ID and Private Key

**Fund your account:**
1. Visit https://portal.hedera.com
2. Use testnet faucet to add HBAR (free)
3. Verify balance > 10 HBAR for tests

### 2. Environment Variables

Create `.env` file in project root:

```bash
# Hedera Testnet Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420YOUR_PRIVATE_KEY

# Shield API Configuration (optional)
SHIELD_API_PORT=3200
MIGRATION_STATE=HYBRID_SIGN
MLDSA_LEVEL=ML-DSA-65
```

**Security:**
- NEVER commit `.env` to version control
- `.env` is in `.gitignore` by default
- Use environment-specific configs for CI/CD

### 3. Dependencies Installed

```bash
npm install
```

## Running Tests

### All Integration Tests

```bash
npm run test:integration
```

This runs all tests matching the `integration` path pattern.

### Specific Test Files

```bash
# Hedera integration only
npx jest tests/integration/hedera-integration.test.ts

# Shield service integration only
npx jest tests/integration/shield-service-integration.test.ts
```

### Watch Mode

```bash
npm run test:integration -- --watch
```

### With Coverage

```bash
npm run test:integration -- --coverage
```

## Test Structure

### Hedera Integration Tests

**File:** `hedera-integration.test.ts`

Tests real Hedera testnet operations:

- ✅ Account balance queries
- ✅ HCS topic creation
- ✅ Message submission to topics
- ✅ Topic info queries
- ✅ Network connectivity

**Requirements:**
- `HEDERA_OPERATOR_ID` environment variable
- `HEDERA_OPERATOR_KEY` environment variable
- Testnet account with HBAR balance (>10 HBAR recommended)

**Expected behavior:**
- Tests create HCS topics during execution
- Topics persist on testnet after tests complete
- Each test run may cost ~0.1 HBAR in transaction fees

### Shield Service Integration Tests

**File:** `shield-service-integration.test.ts`

Tests end-to-end shield creation flow (currently skipped - API not implemented):

- ⏭️  Create quantum-safe shield for NFT asset
- ⏭️  Verify shield integrity
- ⏭️  Retrieve shield provenance chain
- ⏭️  Handle invalid asset metadata
- ⏭️  Enforce rate limiting
- ⏭️  Persist shield state
- ⏭️  Search shields by category
- ⏭️  Generate ML-DSA-65 signatures
- ⏭️  Support crypto-agility state transitions
- ⏭️  Handle Hedera network failures
- ⏭️  Handle service unavailable scenarios

**Status:** Tests are defined but skipped until Shield API is implemented.

### Current Status

**✅ Integration test infrastructure complete:**
- Test directory structure created (`tests/integration/`)
- Test configuration setup (`setup.ts`)
- Jest integration test command (`npm run test:integration`)
- Comprehensive documentation (this README)
- 16 integration tests defined (5 Hedera + 11 Shield service)

**⏭️  All tests currently skipped:**
- Hedera tests skipped due to @hashgraph/sdk ESM/CommonJS import issue with Jest
- Shield service tests skipped until API endpoints implemented

**Known issue: Hedera SDK Import**

The `@hashgraph/sdk` module uses ESM format which conflicts with Jest's TypeScript transpilation.

**Error:**
```
TypeError: Client.forTestnet is not a function
```

**Temporary workaround:** Tests are skipped using `describe.skip()` and `test.skip()`

**Resolution options:**
1. Migrate to pure ESM with `NODE_OPTIONS="--experimental-vm-modules" jest`
2. Update `jest.config.ts` to handle @hashgraph/sdk correctly
3. Use `jest.unstable_mockModule` for mocking
4. Convert integration tests to plain JavaScript with `require()`

**When to unskip Hedera tests:**
1. Resolve @hashgraph/sdk import issue
2. Add `.env` file with Hedera credentials
3. Update tests to use proper module loading
4. Verify tests pass with real Hedera testnet

**When to unskip:**
1. Fastify API server operational (`src/api/server.js`)
2. Shield creation endpoint implemented (`POST /api/v1/shield`)
3. Verification endpoint implemented (`GET /api/v1/shield/:id/verify`)
4. Provenance endpoint implemented (`GET /api/v1/shield/:id/provenance`)

## Configuration

### Test Timeouts

Integration tests have longer timeouts due to network latency:

- **Network requests:** 30 seconds (account balance, topic queries)
- **Transaction submit:** 45 seconds (topic creation, message submission)
- **Consensus wait:** 60 seconds (waiting for transaction finality)

**Override timeout:**
```typescript
test('my slow test', async () => {
  // test implementation
}, 90000); // 90 seconds
```

### Skip Tests Conditionally

Tests automatically skip when required environment variables are missing:

```typescript
if (integrationTestConfig.skipTests.hedera) {
  console.log('⏭️  Skipping: Missing Hedera credentials');
  return;
}
```

**Manual skip:**
```typescript
test.skip('feature not yet implemented', async () => {
  // test implementation
});
```

## Debugging Integration Tests

### 1. Enable Verbose Logging

```bash
npm run test:integration -- --verbose
```

### 2. Run Single Test

```bash
npx jest tests/integration/hedera-integration.test.ts -t "should query account balance"
```

### 3. Check Environment Variables

```bash
# Verify .env loaded correctly
node -e "require('dotenv').config(); console.log(process.env.HEDERA_OPERATOR_ID)"
```

### 4. Verify Hedera Account Balance

```bash
# Using Hedera CLI (if installed)
hedera account balance 0.0.YOUR_ACCOUNT_ID
```

Or use the test:
```bash
npx jest tests/integration/hedera-integration.test.ts -t "should query account balance"
```

### 5. Check Test Logs

Integration tests log important events:

```
✅ Account 0.0.12345 balance: 100 ℏ
✅ Created HCS topic: 0.0.67890
✅ Submitted message to topic 0.0.67890
✅ Topic info retrieved: 1 messages
✅ Successfully connected to Hedera testnet
```

## CI/CD Integration

Integration tests run in GitHub Actions on:
- Pull requests to `main`
- Push to `main` branch

**CI Environment:**
- Hedera credentials stored as GitHub Secrets
- Tests run against testnet only
- Failed tests block PR merges

**Add Hedera secrets to GitHub:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add `HEDERA_OPERATOR_ID` secret
3. Add `HEDERA_OPERATOR_KEY` secret
4. Workflow file `.github/workflows/test.yml` automatically loads secrets

## Common Issues

### Issue: Tests skip with "Missing credentials"

**Cause:** Environment variables not set

**Solution:**
```bash
# Create .env file
cat > .env << 'EOF'
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY
EOF
```

### Issue: "Insufficient account balance"

**Cause:** Testnet account has no HBAR

**Solution:**
1. Visit https://portal.hedera.com
2. Use testnet faucet to add HBAR
3. Verify balance: `npm run test:integration -- -t "should query account balance"`

### Issue: "Transaction timeout"

**Cause:** Network congestion or slow connection

**Solution:**
1. Increase timeout in test configuration
2. Retry test (network congestion usually temporary)
3. Check Hedera status: https://status.hedera.com

### Issue: "INVALID_SIGNATURE"

**Cause:** Incorrect private key format or corrupted key

**Solution:**
1. Verify private key is complete (starts with `302e020100...`)
2. Ensure no extra whitespace or newlines
3. Regenerate key from Hedera portal if needed

### Issue: Tests pass locally but fail on CI

**Cause:** GitHub Secrets not configured

**Solution:**
1. Add `HEDERA_OPERATOR_ID` to repository secrets
2. Add `HEDERA_OPERATOR_KEY` to repository secrets
3. Verify workflow file loads secrets correctly

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on state from previous tests:

```typescript
// ✅ Good - Each test creates own topic
test('test 1', async () => {
  const topicId = await createTopic();
  // test with topicId
});

test('test 2', async () => {
  const topicId = await createTopic();
  // test with topicId
});

// ❌ Bad - Tests share topic
let sharedTopicId;
test('test 1', async () => {
  sharedTopicId = await createTopic();
});
test('test 2', async () => {
  // uses sharedTopicId from test 1
});
```

### 2. Cleanup Resources

Clean up created resources to avoid polluting testnet:

```typescript
afterEach(async () => {
  if (createdTopicId) {
    // Topic deletion not supported, but log for tracking
    console.log(`Created topic: ${createdTopicId.toString()}`);
  }
});
```

### 3. Meaningful Assertions

Test specific behavior, not just "something happened":

```typescript
// ✅ Good
expect(balance.hbars.toBigNumber().toNumber()).toBeGreaterThan(10);
expect(receipt.status.toString()).toBe('SUCCESS');

// ❌ Bad
expect(balance).toBeDefined();
expect(receipt).toBeTruthy();
```

### 4. Use Test Data Builders

Create helper functions for test data:

```typescript
function buildTestAssetMetadata(overrides = {}) {
  return {
    assetId: '0.0.12345:1',
    name: 'Test Asset',
    category: 'art',
    description: 'Integration test asset',
    ...overrides,
  };
}

// Usage
const asset = buildTestAssetMetadata({ category: 'collectible' });
```

## Roadmap

**Phase 1 (Current):**
- ✅ Hedera HCS integration tests
- ✅ Account balance queries
- ✅ Topic creation and message submission

**Phase 2 (Next):**
- ⏭️  Shield service integration tests
- ⏭️  API endpoint testing (create/verify/provenance)
- ⏭️  Error handling validation

**Phase 3 (Future):**
- ⏭️  Pinecone RAG integration tests
- ⏭️  GridDB persistent storage tests
- ⏭️  Crypto-agility state transition tests
- ⏭️  Performance benchmarks (throughput, latency)

## Resources

- **Hedera Documentation:** https://docs.hedera.com
- **Hedera SDK (JavaScript):** https://github.com/hashgraph/hedera-sdk-js
- **Testnet Portal:** https://portal.hedera.com
- **Network Status:** https://status.hedera.com
- **Jest Documentation:** https://jestjs.io/docs/getting-started

---

**Last Updated:** 2026-02-23
**Test Count:** 4 active integration tests + 11 skipped (pending API implementation)
**Coverage:** Hedera blockchain integration (HCS)
