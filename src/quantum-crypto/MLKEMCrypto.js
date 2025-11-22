/**
 * ML-KEM (Module-Lattice Key Encapsulation Mechanism) Implementation
 * NIST FIPS 203 Compliant
 * Quantum-resistant key exchange for Hedera
 */

import { Kyber } from '@stablelib/kyber';
import crypto from 'crypto';

// ML-KEM Security Levels (NIST FIPS 203)
export const ML_KEM_LEVELS = {
  'ML-KEM-512': {
    securityLevel: 1,
    publicKeySize: 800,
    privateKeySize: 1632,
    ciphertextSize: 768,
    sharedSecretSize: 32,
    algorithm: 'Kyber512'
  },
  'ML-KEM-768': {
    securityLevel: 3,
    publicKeySize: 1184,
    privateKeySize: 2400,
    ciphertextSize: 1088,
    sharedSecretSize: 32,
    algorithm: 'Kyber768'
  },
  'ML-KEM-1024': {
    securityLevel: 5,
    publicKeySize: 1568,
    privateKeySize: 3168,
    ciphertextSize: 1568,
    sharedSecretSize: 32,
    algorithm: 'Kyber1024'
  }
};

export class MLKEMCrypto {
  constructor(level = 'ML-KEM-768') {
    if (!ML_KEM_LEVELS[level]) {
      throw new Error(`Invalid ML-KEM level: ${level}`);
    }
    
    this.level = level;
    this.params = ML_KEM_LEVELS[level];
    this.kyber = new Kyber(this.params.algorithm);
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          ML-KEM KEY ENCAPSULATION INITIALIZED                ║
╠═══════════════════════════════════════════════════════════════╣
║  Algorithm: ${level.padEnd(50)} ║
║  Security Level: ${this.params.securityLevel.toString().padEnd(44)} ║
║  NIST FIPS 203 Compliant                                     ║
║  Shared Secret: ${this.params.sharedSecretSize.toString().padEnd(45)} bytes ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }
  
  /**
   * Generate ML-KEM key pair
   */
  generateKeyPair() {
    const startTime = Date.now();
    const seed = crypto.randomBytes(32);
    const keyPair = this.kyber.generateKeyPair(seed);
    const generationTime = Date.now() - startTime;
    
    return {
      algorithm: this.level,
      securityLevel: this.params.securityLevel,
      created: new Date().toISOString(),
      generationTime: `${generationTime}ms`,
      publicKey: {
        algorithm: this.level,
        key: keyPair.publicKey,
        format: 'raw',
        size: this.params.publicKeySize,
        hex: Buffer.from(keyPair.publicKey).toString('hex')
      },
      secretKey: {
        algorithm: this.level,
        key: keyPair.secretKey,
        format: 'raw',
        size: this.params.privateKeySize,
        encrypted: false
      },
      metadata: {
        quantumResistant: true,
        nistCompliant: true,
        latticeBase: 'Module-LWE',
        keyExchangeProtocol: 'CCA-secure KEM'
      }
    };
  }
  
  /**
   * Encapsulate shared secret
   */
  encapsulate(publicKey) {
    const startTime = Date.now();
    const publicKeyBytes = publicKey.key || publicKey;
    
    // Generate random seed for encapsulation
    const seed = crypto.randomBytes(32);
    const result = this.kyber.encapsulate(publicKeyBytes, seed);
    
    const encapsulationTime = Date.now() - startTime;
    
    return {
      algorithm: this.level,
      ciphertext: result.ciphertext,
      ciphertextHex: Buffer.from(result.ciphertext).toString('hex'),
      ciphertextSize: result.ciphertext.length,
      sharedSecret: result.sharedSecret,
      sharedSecretHex: Buffer.from(result.sharedSecret).toString('hex'),
      sharedSecretSize: result.sharedSecret.length,
      timestamp: new Date().toISOString(),
      encapsulationTime: `${encapsulationTime}ms`,
      metadata: {
        securityLevel: this.params.securityLevel,
        quantumResistant: true,
        ephemeral: true
      }
    };
  }
  
  /**
   * Decapsulate shared secret
   */
  decapsulate(secretKey, ciphertext) {
    const startTime = Date.now();
    const secretKeyBytes = secretKey.key || secretKey;
    const ciphertextBytes = ciphertext.ciphertext || ciphertext;
    
    const sharedSecret = this.kyber.decapsulate(secretKeyBytes, ciphertextBytes);
    const decapsulationTime = Date.now() - startTime;
    
    return {
      algorithm: this.level,
      sharedSecret: sharedSecret,
      sharedSecretHex: Buffer.from(sharedSecret).toString('hex'),
      sharedSecretSize: sharedSecret.length,
      timestamp: new Date().toISOString(),
      decapsulationTime: `${decapsulationTime}ms`,
      metadata: {
        securityLevel: this.params.securityLevel,
        quantumResistant: true
      }
    };
  }
  
  /**
   * Derive symmetric key from shared secret
   */
  deriveSymmetricKey(sharedSecret, info = 'QuantumShield-Hedera-v1') {
    const sharedSecretBytes = sharedSecret.sharedSecret || sharedSecret;
    
    // Use HKDF (HMAC-based Key Derivation Function) for key derivation
    const salt = crypto.randomBytes(32);
    const ikm = Buffer.from(sharedSecretBytes);
    const infoBuffer = Buffer.from(info);
    
    // Extract phase
    const prk = crypto.createHmac('sha256', salt).update(ikm).digest();
    
    // Expand phase
    const okm = crypto.createHmac('sha256', prk).update(infoBuffer).digest();
    
    return {
      symmetricKey: okm,
      symmetricKeyHex: okm.toString('hex'),
      keySize: okm.length,
      derivationMethod: 'HKDF-SHA256',
      salt: salt.toString('hex'),
      info: info,
      metadata: {
        quantumResistant: true,
        purpose: 'AES-256 encryption key'
      }
    };
  }
  
  /**
   * Create hybrid encryption scheme (ML-KEM + AES)
   */
  async hybridEncrypt(publicKey, data) {
    const startTime = Date.now();
    
    // Encapsulate to get shared secret
    const encapsulation = this.encapsulate(publicKey);
    
    // Derive AES key from shared secret
    const derivedKey = this.deriveSymmetricKey(encapsulation);
    
    // Encrypt data with AES-256-GCM
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm', 
      derivedKey.symmetricKey, 
      iv
    );
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    const encryptionTime = Date.now() - startTime;
    
    return {
      algorithm: 'ML-KEM-AES-Hybrid',
      mlkemLevel: this.level,
      ciphertext: encapsulation.ciphertextHex,
      encryptedData: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      salt: derivedKey.salt,
      timestamp: new Date().toISOString(),
      encryptionTime: `${encryptionTime}ms`,
      metadata: {
        quantumResistant: true,
        hybridScheme: true,
        authenticated: true
      }
    };
  }
  
  /**
   * Decrypt hybrid encryption
   */
  async hybridDecrypt(secretKey, encryptedPackage) {
    const startTime = Date.now();
    
    // Decapsulate to get shared secret
    const ciphertext = Buffer.from(encryptedPackage.ciphertext, 'hex');
    const decapsulation = this.decapsulate(secretKey, ciphertext);
    
    // Derive AES key from shared secret
    const derivedKey = this.deriveSymmetricKey(
      decapsulation, 
      'QuantumShield-Hedera-v1'
    );
    
    // Reconstruct the key with the original salt
    const salt = Buffer.from(encryptedPackage.salt, 'hex');
    const prk = crypto.createHmac('sha256', salt)
      .update(Buffer.from(decapsulation.sharedSecret))
      .digest();
    const symmetricKey = crypto.createHmac('sha256', prk)
      .update(Buffer.from('QuantumShield-Hedera-v1'))
      .digest();
    
    // Decrypt data with AES-256-GCM
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      symmetricKey,
      Buffer.from(encryptedPackage.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedPackage.authTag, 'hex'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPackage.encryptedData, 'hex')),
      decipher.final()
    ]);
    
    const decryptionTime = Date.now() - startTime;
    
    return {
      algorithm: 'ML-KEM-AES-Hybrid',
      decryptedData: decrypted.toString('utf8'),
      decryptionTime: `${decryptionTime}ms`,
      timestamp: new Date().toISOString(),
      verified: true
    };
  }
  
  /**
   * Export ML-KEM public key for sharing
   */
  exportPublicKey(keyPair) {
    return {
      algorithm: this.level,
      publicKey: keyPair.publicKey.hex,
      created: keyPair.created,
      metadata: keyPair.metadata
    };
  }
  
  /**
   * Import ML-KEM public key
   */
  importPublicKey(exportedKey) {
    return {
      algorithm: exportedKey.algorithm,
      key: new Uint8Array(
        exportedKey.publicKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      ),
      created: exportedKey.created,
      metadata: exportedKey.metadata
    };
  }
}

export default MLKEMCrypto;
