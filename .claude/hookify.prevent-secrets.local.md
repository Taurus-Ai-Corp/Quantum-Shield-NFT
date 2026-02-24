---
name: prevent-secrets
enabled: true
event: file
action: block
pattern: (HEDERA_OPERATOR_KEY|PINECONE_API_KEY|ANTHROPIC_API_KEY|AWS_SECRET_ACCESS_KEY|VERCEL_TOKEN|STRIPE_SECRET_KEY|NEXTAUTH_SECRET|DATABASE_URL)\s*=\s*["'][^"']+["']
---

🚨 **SECRET DETECTED IN SOURCE CODE**

You're adding an API key or secret directly to source code.

**This action is BLOCKED because:**
- Secrets in git history can NEVER be fully removed
- Violates TAURUS AI security policy
- GitHub secret scanning will flag this
- Exposes credentials to anyone with repository access

**How to fix:**
1. Store secrets in `.env` file (already gitignored)
2. Use environment variables: `process.env.VARIABLE_NAME`
3. For production: Use Vercel environment variables or secret managers

**Example:**
```typescript
// ❌ WRONG
const apiKey = "sk-1234567890abcdef";

// ✅ CORRECT
const apiKey = process.env.ANTHROPIC_API_KEY;
```

**If you've already committed a secret:**
1. Rotate the secret immediately (generate new key)
2. Remove from commit history: `git reset --soft HEAD~1`
3. Add to .env file instead
4. Recommit without the secret

**Need help?** See: docs/security/SECRET-MANAGEMENT.md
