# Security Policy

## Reporting a Vulnerability

TAURUS AI CORP takes the security of Quantum-Shield-NFT seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Preferred Method:** GitHub Security Advisory (Private)
1. Go to https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/security/advisories/new
2. Describe the vulnerability with as much detail as possible
3. Include steps to reproduce the issue
4. If available, provide a proof-of-concept or suggested fix

**Alternative Method:** Email
- Send details to: admin@taurusai.io
- Use PGP encryption if possible (key available on request)
- Subject line: `[SECURITY] Quantum-Shield-NFT - [Brief Description]`

### What to Include in Your Report

Please provide:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested mitigation (if you have one)
- Your name/handle (for credit, if desired)

**Please DO NOT:**
- Publicly disclose the vulnerability before we've had a chance to address it
- Test the vulnerability on production systems without explicit permission
- Attempt to exploit the vulnerability beyond verification

---

## Response Timeline

We follow these response SLAs based on vulnerability severity:

| Severity | Response Time | Patching Target |
|----------|---------------|-----------------|
| **Critical** (CVSS 9.0-10.0) | 24 hours | 7 days |
| **High** (CVSS 7.0-8.9) | 7 days | 30 days |
| **Medium** (CVSS 4.0-6.9) | 14 days | 60 days |
| **Low** (CVSS 0.1-3.9) | 30 days | 90 days |

**CVSS Calculator:** https://www.first.org/cvss/calculator/3.1

---

## Severity Assessment

We use CVSS 3.1 to assess vulnerability severity:

### Critical (9.0-10.0)
- Remote code execution (RCE)
- Authentication bypass affecting all users
- Complete data exfiltration
- Cryptographic key compromise

### High (7.0-8.9)
- Privilege escalation
- SQL injection
- Cross-site scripting (XSS) in critical flows
- Denial of service (DoS) affecting availability

### Medium (4.0-6.9)
- Information disclosure (non-critical data)
- Cross-site request forgery (CSRF)
- XSS in non-critical areas
- Business logic flaws

### Low (0.1-3.9)
- Minor information leaks
- Configuration issues
- Non-exploitable bugs
- Cosmetic issues with security implications

---

## Security Scope

### In Scope

The following components are within the security scope:

✅ **Quantum Cryptography Layer**
- ML-DSA-65 signature generation/verification
- ML-KEM-768 key encapsulation
- Crypto-agility state machine
- Key management and storage

✅ **Hedera Blockchain Integration**
- HTS (Hedera Token Service) operations
- HCS (Hedera Consensus Service) messaging
- Wallet connection and authentication
- Transaction signing and submission

✅ **API Server**
- Authentication/authorization
- Input validation
- Rate limiting
- Error handling

✅ **NFT Protection Services**
- Asset shielding logic
- Metadata validation
- Signature verification
- Provenance tracking

✅ **Frontend (Next.js)**
- Wallet integration
- User authentication
- Client-side validation
- XSS/CSRF protection

### Out of Scope

The following are explicitly out of scope:

❌ **Third-party dependencies** (report to the respective projects)
❌ **Hedera network itself** (report to Hedera/Swirlds)
❌ **Social engineering attacks**
❌ **Physical security**
❌ **Denial of service via blockchain spam** (protocol-level issue)
❌ **Issues in forked or modified versions** (not maintained by us)

---

## Post-Quantum Cryptography Considerations

Quantum-Shield-NFT implements NIST-standardized post-quantum algorithms. When reporting vulnerabilities:

### Quantum-Specific Vulnerabilities

Consider reporting issues related to:
- ✅ Side-channel attacks against ML-DSA/ML-KEM implementations
- ✅ Key generation weaknesses
- ✅ Nonce reuse vulnerabilities
- ✅ Hybrid signature mode bypasses
- ✅ Crypto-agility state machine flaws

### Classical Cryptography Vulnerabilities

During the migration period (HYBRID_SIGN state), we still use Ed25519:
- ✅ Ed25519 key management issues
- ✅ Signature verification bypasses
- ✅ Random number generation weaknesses

---

## Vulnerability Disclosure Policy

### Coordinated Disclosure

We follow coordinated disclosure principles:

1. **Report Received** → Acknowledge within 48 hours
2. **Triage** → Severity assessment within 7 days
3. **Validation** → Reproduce and confirm (varies by severity)
4. **Fix Development** → Internal patch development
5. **Security Advisory** → Draft GitHub Security Advisory (private)
6. **Release** → Coordinated public disclosure with patch
7. **Credit** → Public acknowledgment of reporter (if desired)

### Public Disclosure Timeline

- **Before fix:** No public disclosure (except with explicit agreement)
- **After fix:** We will publicly disclose within 30 days of patch release
- **Credit:** We will credit reporters unless they request anonymity

### Embargoed Disclosure

For critical vulnerabilities, we may request an embargo period:
- **Standard embargo:** 30 days from initial report
- **Extended embargo:** 60 days (with justification)

During embargo:
- No public disclosure by reporter or TAURUS AI
- Limited sharing with trusted partners (if necessary)
- Coordinated release with patch availability

---

## Security Updates

### How to Stay Informed

Subscribe to security updates:
- **GitHub Watch:** Enable "Security alerts only" for this repository
- **Security Advisories:** https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/security/advisories
- **Email:** Join security-announce@ mailing list (available on request)

### Patch Release Process

Security patches are released as:
1. **Patch version bump:** e.g., 2.0.0 → 2.0.1 (for low/medium severity)
2. **Minor version bump:** e.g., 2.0.0 → 2.1.0 (for high severity)
3. **Major version bump:** e.g., 2.0.0 → 3.0.0 (for critical + breaking changes)

All security patches include:
- GitHub Security Advisory with CVSS score
- Detailed changelog entry
- Migration guide (if breaking changes)
- Backports to previous major versions (when feasible)

---

## Security Best Practices

For users deploying Quantum-Shield-NFT:

### Production Deployment

✅ **Environment Variables:** Never commit secrets to git
✅ **HTTPS Only:** Enforce TLS 1.3 for all connections
✅ **Rate Limiting:** Implement API rate limiting
✅ **Input Validation:** Validate all user inputs
✅ **Security Headers:** Configure CSP, HSTS, X-Frame-Options
✅ **Monitoring:** Set up error tracking (Sentry, etc.)
✅ **Backups:** Regular backups of critical data
✅ **Updates:** Keep dependencies up to date (Dependabot)

### Hedera Wallet Security

✅ **Private Keys:** Store Hedera operator keys securely (encrypted at rest)
✅ **Testnet First:** Test all operations on testnet before mainnet
✅ **Gas Limits:** Set maximum HBAR spending limits
✅ **Transaction Review:** Implement transaction review before submission
✅ **Multi-Signature:** Use multi-sig accounts for high-value operations

### Post-Quantum Key Management

✅ **Key Generation:** Use cryptographically secure random number generators
✅ **Key Storage:** Encrypt ML-DSA/ML-KEM keys at rest
✅ **Key Rotation:** Rotate keys periodically (annually recommended)
✅ **Crypto-Agility:** Plan migration path to future algorithms
✅ **Audit Logging:** Log all cryptographic operations

---

## Known Security Considerations

### Current Limitations

These are known limitations, not vulnerabilities:

⚠️ **Dependency Vulnerabilities:** 38 npm audit findings (mostly dev dependencies)
- See: docs/security/VULNERABILITY-ASSESSMENT.md
- Risk level: Moderate (acceptable for current phase)
- Mitigation: Dev dependencies isolated from production

⚠️ **Ed25519 in Hybrid Mode:** Classical signature still present in HYBRID_SIGN state
- Mitigation: Users can upgrade to ML-DSA_ONLY state
- Timeline: Full migration recommended by Q2 2026

⚠️ **Hedera SDK Dependencies:** bn.js, elliptic (moderate severity)
- Mitigation: Input validation before SDK calls
- Timeline: Awaiting Hedera SDK v3 update (Q1 2026)

---

## Security Research

We welcome security research on Quantum-Shield-NFT:

### Safe Harbor

We provide safe harbor for security researchers who:
- ✅ Act in good faith to identify and report vulnerabilities
- ✅ Make reasonable efforts to avoid data destruction, privacy violations, or service disruption
- ✅ Give us reasonable time to fix the issue before public disclosure
- ✅ Do not exploit the vulnerability beyond verification

In return, we will:
- ✅ Not pursue legal action for good faith security research
- ✅ Work with you to understand and validate the issue
- ✅ Credit you publicly (unless you prefer anonymity)
- ✅ Consider bug bounties for high-impact vulnerabilities (case-by-case basis)

### Bug Bounty (Informal)

While we don't have a formal bug bounty program, we may provide rewards for high-quality vulnerability reports:
- **Critical (CVSS 9.0-10.0):** Case-by-case consideration
- **High (CVSS 7.0-8.9):** Possible acknowledgment + gift
- **Medium/Low:** Public credit

Rewards are discretionary and depend on:
- Vulnerability severity and impact
- Quality of the report
- Novelty of the finding
- Our budget constraints (we're a startup!)

---

## Contact Information

**Security Team:** admin@taurusai.io
**GitHub Security Advisories:** https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/security/advisories
**Company Website:** https://taurusai.io
**Product Website:** https://shield.q-grid.ca

---

## Acknowledgments

We thank the following security researchers for their responsible disclosure:

*(No vulnerabilities reported yet - you could be first!)*

---

**Last Updated:** 2026-02-24
**Version:** 2.0.0
**Security Contact:** admin@taurusai.io
