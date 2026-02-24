---
language:
- en
tags:
- cybersecurity
- post-quantum-cryptography
- pqc
- nist
- encryption
- ayinedjimi-consultants
- en
license: apache-2.0
task_categories:
- question-answering
- text-classification
size_categories:
- 1K<n<10K
authors:
- name: Ayi NEDJIMI
  url: https://ayinedjimi-consultants.fr/bio.html
source_datasets:
- original
pretty_name: Post-Quantum Cryptography (English)
---

# Post-Quantum Cryptography - Dataset EN

Comprehensive English dataset on **post-quantum cryptography (PQC) migration**, covering NIST algorithms (FIPS 203-206), migration phases, protocol impacts, quantum threats, and 70 detailed Q&A pairs.

## Dataset Contents

| Category | Entries | Description |
|----------|:-:|-------------|
| **PQC Algorithms** | 15 | ML-KEM (Kyber), ML-DSA (Dilithium), SLH-DSA (SPHINCS+), FN-DSA (FALCON), HQC, RSA, ECDSA, Ed25519, X25519, AES-256 |
| **Migration Phases** | 12 | Cryptographic inventory, risk assessment, crypto-agility, hybrid deployment, pure PQC transition, deprecation |
| **Protocol Impacts** | 15 | TLS 1.3, SSH, VPN/IPsec, S/MIME, code signing, PKI/X.509, blockchain, IoT, HSM, Cloud KMS, browsers, DNSSEC, FIDO2 |
| **Quantum Threats** | 10 | Shor, Grover, HNDL, Q-Day timeline, qubit requirements, current state, side-channels |
| **Q&A** | 70 | Fundamentals, migration, algorithms, protocols, compliance, practical use cases |

## Standards Covered

- **FIPS 203** - ML-KEM (CRYSTALS-Kyber): Key Encapsulation
- **FIPS 204** - ML-DSA (CRYSTALS-Dilithium): Digital Signatures
- **FIPS 205** - SLH-DSA (SPHINCS+): Hash-Based Signatures
- **FIPS 206 (draft)** - FN-DSA (FALCON): Compact NTRU Signatures
- **CNSA 2.0** - NSA Migration Timeline
- **ANSSI/BSI/ENISA Recommendations**

## Usage

```python
from datasets import load_dataset

dataset = load_dataset("AYI-NEDJIMI/post-quantum-crypto-en")

# Browse Q&A
for row in dataset["train"]:
    print(f"Q: {row['question']}")
    print(f"A: {row['answer'][:200]}...")
    print()
```

## Schema

Each entry contains:
- `id`: Unique identifier
- `question`: Question in English
- `answer`: Detailed answer in English
- `category`: Category (algorithms, migration, protocols, threats, fundamentals, compliance)
- `source_url`: Source URL

## Reference Articles

- [Post-Quantum Cryptography - Complete Guide](https://ayinedjimi-consultants.fr/articles/conformite/cryptographie-post-quantique.html) - Detailed guide on PQC migration, NIST algorithms, and deployment strategies
- [Cyber Resilience Act 2026](https://ayinedjimi-consultants.fr/articles/conformite/cyber-resilience-act-2026.html) - CRA impact on digital product security requirements
- [NIS 2 Operational Phase 2026](https://ayinedjimi-consultants.fr/articles/conformite/nis-2-phase-operationnelle-2026.html) - NIS 2 implementation and cybersecurity implications
- [ISO 27001 Complete Guide](https://ayinedjimi-consultants.fr/articles/conformite/iso-27001-guide-complet.html) - Integrating PQC migration into the ISO 27001 ISMS
- [AI and Cyber Defense White Paper](https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html) - Artificial intelligence applied to cyber defense

## Author

**AYI-NEDJIMI Consultants** - Cybersecurity and compliance consulting firm specializing in digital risk governance, regulatory compliance (NIS 2, DORA, Cyber Resilience Act, GDPR), and secure information system transformation.

- Website: [https://ayinedjimi-consultants.fr](https://ayinedjimi-consultants.fr)
- Contact: [contact@ayinedjimi-consultants.fr](mailto:contact@ayinedjimi-consultants.fr)

## Free Resources

Access our **8 free white papers** covering cybersecurity, compliance, AI, and risk governance:
[https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html](https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html)

## Full Collection

Find all our datasets on HuggingFace:
[https://huggingface.co/AYI-NEDJIMI](https://huggingface.co/AYI-NEDJIMI)

## License

MIT License - Free to use with attribution.

## Related Articles

- [Cryptographie Post-Quantique](https://ayinedjimi-consultants.fr/articles/conformite/cryptographie-post-quantique.html)
- [Cyber Resilience Act 2026](https://ayinedjimi-consultants.fr/articles/conformite/cyber-resilience-act-2026.html)
- [NIS 2 Phase Opérationnelle](https://ayinedjimi-consultants.fr/articles/conformite/nis-2-phase-operationnelle-2026.html)
- [ISO 27001 Guide Complet](https://ayinedjimi-consultants.fr/articles/conformite/iso-27001-guide-complet.html)
- [Livre Blanc IA Cyberdéfense](https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html)

## Free Cybersecurity Resources

- [Livre Blanc NIS 2](https://ayinedjimi-consultants.fr/livre-blanc-nis2.html)
- [Livre Blanc Sécurité Active Directory](https://ayinedjimi-consultants.fr/livre-blanc-securite-active-directory.html)
- [Livre Blanc Pentest Cloud AWS/Azure/GCP](https://ayinedjimi-consultants.fr/livre-blanc-pentest-cloud-aws-azure-gcp.html)
- [Livre Blanc Sécurité Kubernetes](https://ayinedjimi-consultants.fr/livre-blanc-securite-kubernetes.html)
- [Livre Blanc IA Cyberdéfense](https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html)
- [Livre Blanc Anatomie Ransomware](https://ayinedjimi-consultants.fr/livre-blanc-anatomie-attaque-ransomware.html)
- [Guide Sécurisation AD 2025](https://ayinedjimi-consultants.fr/guide-securisation-active-directory-2025.html)
- [Guide Tiering Model AD](https://ayinedjimi-consultants.fr/livres-blancs/tiering-model/)

## Part of the Collection

This dataset is part of the [Cybersecurity Datasets & Tools Collection](https://huggingface.co/collections/AYI-NEDJIMI/cybersecurity-datasets-and-tools-by-ayi-nedjimi-698e4b5777848dba76c8b169) by AYI-NEDJIMI Consultants.
