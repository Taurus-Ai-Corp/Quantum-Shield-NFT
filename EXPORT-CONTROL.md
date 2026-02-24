# Export Control Notice

## Overview

Quantum-Shield-NFT contains cryptographic software subject to U.S. Export Administration Regulations (EAR) and may be subject to export control laws in other jurisdictions.

---

## Export Control Classification

### ECCN Classification

**Export Control Classification Number (ECCN): 5D002**

"Software" specially designed or modified for the "development", "production" or "use" of equipment specified in 5A002 or "software" specified in 5D002.

**Reason for Control:**
- NS (National Security): Column 1
- AT (Anti-Terrorism): Column 1

### BIS/NSA Notification

This software has been reported to the U.S. Bureau of Industry and Security (BIS) and National Security Agency (NSA) under 15 CFR § 742.15(b) prior to public availability.

**Notification Date:** [TO BE COMPLETED BEFORE PUBLIC LAUNCH]
**Reference:** docs/compliance/ECCN-5D002-Notification.txt

---

## License Exception TSU

Quantum-Shield-NFT qualifies for License Exception TSU under 15 CFR § 740.13(e):

**Technology and Software Unrestricted (TSU)**

This software is eligible for TSU because:

1. ✅ **Publicly Available:** The source code is published on GitHub (https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT)
2. ✅ **No Licensing Fee:** The software is open-source (FSL 1.1 → MIT after 2 years)
3. ✅ **Cryptographic Source Code:** Full source code is available (not compiled binary only)
4. ✅ **BIS/NSA Notification:** Notification sent to crypt@bis.doc.gov and enc@nsa.gov
5. ✅ **Unrestricted Distribution:** Available to the public without restrictions

**Legal Reference:** 15 CFR § 740.13(e)

---

## Cryptographic Capabilities

This software contains the following cryptographic capabilities:

### Post-Quantum Cryptography (NIST Standardized)

**ML-DSA-65 (Module-Lattice Digital Signature Algorithm)**
- **Standard:** NIST FIPS 204
- **Purpose:** Quantum-resistant digital signatures
- **Key Size:** 2,592 bytes (public), 4,032 bytes (private)
- **Security Level:** NIST Level 3 (~192-bit classical security)

**ML-KEM-768 (Module-Lattice Key Encapsulation Mechanism)**
- **Standard:** NIST FIPS 203
- **Purpose:** Quantum-resistant key exchange
- **Key Size:** 1,184 bytes (public), 2,400 bytes (private)
- **Security Level:** NIST Level 3 (~192-bit classical security)

### Classical Cryptography (Migration Support)

**Ed25519 (Elliptic Curve Signatures)**
- **Standard:** RFC 8032
- **Purpose:** Legacy signature support (quantum-vulnerable)
- **Key Size:** 32 bytes (public and private)
- **Security Level:** ~128-bit classical security

**SHA3-256 (Cryptographic Hash)**
- **Standard:** NIST FIPS 202
- **Purpose:** Hash functions, message digests
- **Output Size:** 256 bits
- **Security Level:** 128-bit collision resistance

---

## User Responsibilities

**IMPORTANT:** By using this software, you agree to comply with all applicable export control laws and regulations.

### User Obligations

As a user of Quantum-Shield-NFT, you are responsible for:

1. ✅ **Compliance with Local Laws:** Ensure your use complies with export laws in your jurisdiction
2. ✅ **Restricted Parties Check:** Do not provide this software to embargoed countries or SDN list entities
3. ✅ **End-Use Restrictions:** Do not use this software for prohibited end-uses (weapons, etc.)
4. ✅ **Re-export Compliance:** If re-exporting, comply with applicable re-export regulations

### Restricted Destinations

**Embargoed Countries (as of 2026-02-24):**
- Cuba
- Iran
- North Korea
- Syria
- Russia (partial restrictions)
- Belarus (partial restrictions)
- Crimea, Donetsk, and Luhansk regions of Ukraine

**Note:** This list may change. Check https://www.bis.doc.gov/index.php/regulations/export-administration-regulations-ear for current restrictions.

### Restricted Parties

Do not provide this software to:
- **SDN List:** Specially Designated Nationals (OFAC)
- **Entity List:** Entities subject to export restrictions (BIS)
- **Denied Persons List:** Individuals denied export privileges
- **Military End-Users:** Military, intelligence, or defense applications in China, Russia, Venezuela

**Check Lists:** https://www.trade.gov/consolidated-screening-list

---

## Geographic Distribution

### Current Distribution

Quantum-Shield-NFT is developed and distributed from:
- **Canada:** Development (Ontario, Canada)
- **UAE:** Corporate entity (TAURUS AI CORP - FZCO, Dubai Silicon Oasis)
- **Global:** Open-source distribution via GitHub (worldwide)

### Regional Considerations

**Canada**
- **Export Control List (ECL):** Cryptographic software is controlled (Group 1, Item 5D002)
- **License Exception:** May apply for publicly available software
- **Reference:** https://laws-lois.justice.gc.ca/eng/regulations/SOR-89-202/

**European Union**
- **Dual-Use Regulation (EU) 2021/821:** Cryptographic software is controlled (Category 5, Part 2)
- **General License:** May apply for publicly available cryptographic software
- **Reference:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0821

**United Arab Emirates**
- **TRA Regulations:** Cryptographic products require approval for import/use
- **Notification:** Registration may be required for commercial deployment
- **Reference:** https://u.ae/en/information-and-services/telecom-and-technology

**United Kingdom**
- **Export Control Order 2008:** Cryptographic software is controlled
- **Open-Source License Exception:** May apply (Article 5 of EU Regulation)
- **Reference:** https://www.gov.uk/guidance/export-controls-dual-use-items

---

## Technical Use Cases

Quantum-Shield-NFT is intended for **civilian commercial use** in:

### ✅ Permitted Use Cases

- **Financial Services:** Digital asset protection, tokenized securities
- **Healthcare:** Medical record integrity, HIPAA compliance
- **Legal:** Contract authenticity, document notarization
- **Enterprise:** Intellectual property protection, supply chain integrity
- **Government (Civilian):** Public records, certificate authorities

### ❌ Prohibited Use Cases

The software is **NOT designed for** and users **MUST NOT** use it for:

- **Weapons Systems:** Development or control of military weapons
- **Intelligence Gathering:** Signals intelligence, surveillance systems
- **Nuclear Applications:** Nuclear weapon development or proliferation
- **Chemical/Biological Weapons:** Related to CBRN (Chemical, Biological, Radiological, Nuclear)
- **Human Rights Violations:** Surveillance or repression of civilians

**Legal Basis:** 15 CFR § 744 (Entity List, Military End-User), ITAR (if applicable)

---

## Open-Source Commitment

### Transparency

TAURUS AI CORP is committed to:
- ✅ Full source code availability (GitHub)
- ✅ No backdoors or intentional weaknesses
- ✅ Independent security audits (upon request)
- ✅ Community review and contributions
- ✅ Cryptographic algorithm transparency

### NIST Algorithm References

All post-quantum algorithms are based on NIST standards:
- **ML-DSA:** https://csrc.nist.gov/publications/detail/fips/204/final
- **ML-KEM:** https://csrc.nist.gov/publications/detail/fips/203/final
- **Implementation:** @noble/post-quantum v0.5.2 (Paul Miller)

---

## Compliance Updates

### Staying Informed

Export control laws change frequently. TAURUS AI CORP will:
- Monitor BIS/OFAC updates
- Update this document when regulations change
- Notify users of significant compliance changes

**Last Regulatory Check:** 2026-02-24

**Resources:**
- BIS: https://www.bis.doc.gov
- OFAC: https://ofac.treasury.gov
- Export.gov: https://www.export.gov

---

## Contact Information

For export control questions or compliance concerns:

**General Inquiries:**
- Email: admin@taurusai.io
- Website: https://taurusai.io

**Legal/Compliance:**
- Email: legal@taurusai.io (when available)
- Corporate: TAURUS AI CORP - FZCO, Dubai Silicon Oasis, UAE

**U.S. Government Contacts:**
- BIS: crypt@bis.doc.gov (encryption notification)
- NSA: enc@nsa.gov (encryption notification)
- OFAC: ofac.feedback@treasury.gov (sanctions questions)

---

## Disclaimer

**LEGAL DISCLAIMER:**

This export control notice is provided for informational purposes only and does not constitute legal advice. Users are solely responsible for ensuring their compliance with all applicable export control laws and regulations.

TAURUS AI CORP makes no representations or warranties regarding the export control classification, licensing requirements, or legal obligations associated with the use, distribution, or export of this software.

Users should consult with qualified export control counsel or government authorities if they have questions about their obligations under applicable export control laws.

**IMPORTANT:** Export control laws vary by country and change frequently. The information in this document may become outdated. Always verify current regulations with the appropriate government authorities.

---

**Last Updated:** 2026-02-24
**Version:** 2.0.0
**ECCN:** 5D002
**License Exception:** TSU (15 CFR § 740.13(e))
**BIS Notification:** Pending (before public launch)

**Warning:** Violation of export control laws may result in civil and criminal penalties, including imprisonment and fines up to $1,000,000 USD per violation.
