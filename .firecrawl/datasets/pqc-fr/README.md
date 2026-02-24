---
language:
- fr
tags:
- cybersecurity
- post-quantum-cryptography
- pqc
- nist
- encryption
- ayinedjimi-consultants
- fr
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
pretty_name: Post-Quantum Cryptography (Français)
---

# Cryptographie Post-Quantique - Dataset FR

Dataset francophone complet sur la **migration vers la cryptographie post-quantique (PQC)**, couvrant les algorithmes NIST (FIPS 203-206), les phases de migration, les impacts sur les protocoles, les menaces quantiques, et 70 questions-reponses detaillees.

## Contenu du dataset

| Categorie | Nombre d'entrees | Description |
|-----------|:-:|-------------|
| **Algorithmes PQC** | 15 | ML-KEM (Kyber), ML-DSA (Dilithium), SLH-DSA (SPHINCS+), FN-DSA (FALCON), HQC, RSA, ECDSA, Ed25519, X25519, AES-256 |
| **Phases de migration** | 12 | Inventaire cryptographique, evaluation des risques, crypto-agilite, deploiement hybride, transition PQC pure, deprecation |
| **Impacts protocoles** | 15 | TLS 1.3, SSH, VPN/IPsec, S/MIME, signature de code, PKI/X.509, blockchain, IoT, HSM, Cloud KMS, navigateurs, DNSSEC, FIDO2 |
| **Menaces quantiques** | 10 | Shor, Grover, HNDL, chronologie Q-Day, exigences en qubits, etat actuel, canaux auxiliaires |
| **Questions-Reponses** | 70 | Fondamentaux, migration, algorithmes, protocoles, conformite, cas d'usage pratiques |

## Standards couverts

- **FIPS 203** - ML-KEM (CRYSTALS-Kyber) : Encapsulation de cles
- **FIPS 204** - ML-DSA (CRYSTALS-Dilithium) : Signatures numeriques
- **FIPS 205** - SLH-DSA (SPHINCS+) : Signatures basees sur le hachage
- **FIPS 206 (draft)** - FN-DSA (FALCON) : Signatures compactes NTRU
- **CNSA 2.0** - Calendrier de migration NSA
- **Recommandations ANSSI/BSI/ENISA**

## Utilisation

```python
from datasets import load_dataset

dataset = load_dataset("AYI-NEDJIMI/post-quantum-crypto-fr")

# Parcourir les Q&A
for row in dataset["train"]:
    print(f"Q: {row['question']}")
    print(f"R: {row['answer'][:200]}...")
    print()
```

## Schema

Chaque entree contient :
- `id` : Identifiant unique
- `question` : Question en francais
- `answer` : Reponse detaillee en francais
- `category` : Categorie (algorithmes, migration, protocoles, menaces, fondamentaux, conformite)
- `source_url` : URL source

## Articles de reference

- [Cryptographie Post-Quantique - Guide Complet](https://ayinedjimi-consultants.fr/articles/conformite/cryptographie-post-quantique.html) - Guide detaille sur la migration PQC, les algorithmes NIST, et les strategies de deploiement
- [Cyber Resilience Act 2026](https://ayinedjimi-consultants.fr/articles/conformite/cyber-resilience-act-2026.html) - Impact du CRA sur les exigences de securite des produits numeriques
- [NIS 2 Phase Operationnelle 2026](https://ayinedjimi-consultants.fr/articles/conformite/nis-2-phase-operationnelle-2026.html) - Mise en oeuvre de NIS 2 et implications pour la cybersecurite
- [ISO 27001 Guide Complet](https://ayinedjimi-consultants.fr/articles/conformite/iso-27001-guide-complet.html) - Integration de la migration PQC dans le SMSI ISO 27001
- [Livre Blanc IA et Cyberdefense](https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html) - Intelligence artificielle appliquee a la cyberdefense

## Auteur

**AYI-NEDJIMI Consultants** - Cabinet de conseil en cybersecurite et conformite, specialise dans la gouvernance des risques numeriques, la conformite reglementaire (NIS 2, DORA, Cyber Resilience Act, RGPD), et la transformation securisee des systemes d'information.

- Site web : [https://ayinedjimi-consultants.fr](https://ayinedjimi-consultants.fr)
- Contact : [contact@ayinedjimi-consultants.fr](mailto:contact@ayinedjimi-consultants.fr)

## Ressources gratuites

Accedez a nos **8 livres blancs gratuits** couvrant la cybersecurite, la conformite, l'IA et la gouvernance des risques :
[https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html](https://ayinedjimi-consultants.fr/livre-blanc-ia-cyberdefense.html)

## Collection complete

Retrouvez tous nos datasets sur HuggingFace :
[https://huggingface.co/AYI-NEDJIMI](https://huggingface.co/AYI-NEDJIMI)

## Licence

MIT License - Libre d'utilisation avec attribution.

## Author

**Ayi NEDJIMI** - Cybersecurity Consultant & Trainer | AI Expert

- [Professional Bio](https://ayinedjimi-consultants.fr/bio.html)
- [All Articles](https://ayinedjimi-consultants.fr/articles.html)
- [Free Guides & Whitepapers](https://ayinedjimi-consultants.fr/guides-gratuits.html)
- [Training Programs](https://ayinedjimi-consultants.fr/formations.html)

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
