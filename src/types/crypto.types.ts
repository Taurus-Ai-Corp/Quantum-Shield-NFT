/**
 * Cryptography type definitions
 * Shared types for quantum-safe cryptographic operations
 */

/**
 * Hexadecimal string representation
 * Used for keys, signatures, and hashes
 */
export type Hex = string;

/**
 * Binary data type
 */
export type Bytes = Uint8Array;

/**
 * ML-DSA security levels (FIPS 204)
 */
export type MLDSALevel = 'ML-DSA-44' | 'ML-DSA-65' | 'ML-DSA-87';

/**
 * ML-KEM security levels (FIPS 203)
 */
export type MLKEMLevel = 'ML-KEM-512' | 'ML-KEM-768' | 'ML-KEM-1024';

/**
 * Hash algorithm types
 */
export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA3-256' | 'SHA3-512';
