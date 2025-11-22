/**
 * ML-DSA (Module-Lattice Digital Signature Algorithm) Implementation
 * NIST FIPS 204 Compliant
 * Quantum-resistant digital signatures for Hedera
 */

import { Dilithium } from '@stablelib/dilithium';
import { KMSClient, CreateKeyCommand, SignCommand, VerifyCommand } from '@aws-sdk/client-kms';
import crypto from 'crypto';

// ML-DSA Security Levels (NIST FIPS 204)
export const ML_DSA_LEVELS = {
  'ML-DSA-44': {
    securityLevel: 2,
    publicKeySize: 1312,
    privateKeySize: 2560, 
    signatureSize: 2420,
    algorithm: 'Dilithium2',
    awsKeySpec: 'ML_DSA_44'
  },
  'ML-DSA-65': {
    securityLevel: 3,
    publicKeySize: 1952,
    privateKeySize: 4032,
    signatureSize: 3309,
    algorithm: 'Dilithium3',
    awsKeySpec: 'ML_DSA_65'
  },
  'ML-DSA-87': {
    securityLevel: 5,
    publicKeySize: 2592,
    privateKeySize: 4864,
    signatureSize: 4595,
    algorithm: 'Dilithium5',
    awsKeySpec: 'ML_DSA_87'
  }
};

export class MLDSACrypto {
  constructor(level = 'ML-DSA-65', useAWS = false) {
    if (!ML_DSA_LEVELS[level]) {
      throw new Error(`Invalid ML-DSA level: ${level}`);
    }
    
    this.level = level;
    this.params = ML_DSA_LEVELS[level];
    this.dilithium = new Dilithium(this.params.algorithm);
    this.useAWS = useAWS;
    
    if (useAWS) {
      this.kmsClient = new KMSClient({ 
        region: process.env.AWS_REGION || 'us-east-1' 
      });
    }
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          QUANTUM-RESISTANT CRYPTO INITIALIZED                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Algorithm: ${level.padEnd(50)} ║
║  Security Level: ${this.params.securityLevel.toString().padEnd(44)} ║
║  NIST FIPS 204 Compliant                                     ║
║  AWS KMS: ${(useAWS ? 'Enabled' : 'Disabled').padEnd(51)} ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }
  
  /**
   * Generate quantum-resistant key pair
   */
  async generateKeyPair() {
    const startTime = Date.now();
    
    if (this.useAWS) {
      // Generate key pair using AWS KMS
      try {
        const command = new CreateKeyCommand({
          KeySpec: this.params.awsKeySpec,
          KeyUsage: 'SIGN_VERIFY',
          Origin: 'AWS_KMS',
          Description: `QuantumShield ${this.level} key for Hedera`
        });
        
        const response = await this.kmsClient.send(command);
        const keyId = response.KeyMetadata.KeyId;
        
        console.log(`✅ AWS KMS key created: ${keyId}`);
        
        return {
          algorithm: this.level,
          keyId: keyId,
          awsManaged: true,
          created: new Date().toISOString(),
          metadata: {
            securityLevel: this.params.securityLevel,
            quantumResistant: true,
            nistCompliant: true,
            rotationSchedule: 365 // days
          }
        };
      } catch (error) {
        console.error('AWS KMS error, falling back to local generation:', error.message);
      }
    }
    
    // Local key generation
    const seed = crypto.randomBytes(32);
    const keyPair = this.dilithium.generateKeyPair(seed);
    
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
      privateKey: {
        algorithm: this.level,
        key: keyPair.secretKey,
        format: 'raw',
        size: this.params.privateKeySize,
        encrypted: false,
        rotationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      metadata: {
        quantumResistant: true,
        nistCompliant: true,
        latticeBase: 'Module-LWE',
        hashFunction: 'SHAKE256'
      }
    };
  }
  
  /**
   * Sign data with ML-DSA
   */
  async sign(privateKeyOrId, data) {
    const startTime = Date.now();
    const dataBytes = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : data;
    
    if (this.useAWS && typeof privateKeyOrId === 'string') {
      // AWS KMS signing
      try {
        const command = new SignCommand({
          KeyId: privateKeyOrId,
          Message: dataBytes,
          SigningAlgorithm: this.params.awsKeySpec
        });
        
        const response = await this.kmsClient.send(command);
        const signingTime = Date.now() - startTime;
        
        return {
          algorithm: this.level,
          signature: response.Signature,
          signatureSize: response.Signature.length,
          dataHash: this._hashData(dataBytes),
          timestamp: new Date().toISOString(),
          signingTime: `${signingTime}ms`,
          awsSigned: true,
          metadata: {
            securityLevel: this.params.securityLevel,
            quantumResistant: true,
            nistCompliant: true
          }
        };
      } catch (error) {
        console.error('AWS KMS signing error:', error.message);
        throw error;
      }
    }
    
    // Local signing
    const signature = this.dilithium.sign(privateKeyOrId, dataBytes);
    const signingTime = Date.now() - startTime;
    
    return {
      algorithm: this.level,
      signature: signature,
      signatureSize: signature.length,
      signatureHex: Buffer.from(signature).toString('hex'),
      dataHash: this._hashData(dataBytes),
      timestamp: new Date().toISOString(),
      signingTime: `${signingTime}ms`,
      metadata: {
        securityLevel: this.params.securityLevel,
        quantumResistant: true,
        nistCompliant: true,
        latticeBase: 'Module-LWE'
      }
    };
  }
  
  /**
   * Verify ML-DSA signature
   */
  async verify(publicKeyOrId, data, signature) {
    const startTime = Date.now();
    const dataBytes = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : data;
    
    if (this.useAWS && typeof publicKeyOrId === 'string') {
      // AWS KMS verification
      try {
        const command = new VerifyCommand({
          KeyId: publicKeyOrId,
          Message: dataBytes,
          Signature: signature.signature || signature,
          SigningAlgorithm: this.params.awsKeySpec
        });
        
        const response = await this.kmsClient.send(command);
        const verificationTime = Date.now() - startTime;
        
        return {
          algorithm: this.level,
          valid: response.SignatureValid,
          verificationTime: `${verificationTime}ms`,
          timestamp: new Date().toISOString(),
          awsVerified: true
        };
      } catch (error) {
        console.error('AWS KMS verification error:', error.message);
        return {
          algorithm: this.level,
          valid: false,
          error: error.message
        };
      }
    }
    
    // Local verification
    const signatureBytes = signature.signature || signature;
    const publicKeyBytes = publicKeyOrId.key || publicKeyOrId;
    const isValid = this.dilithium.verify(publicKeyBytes, dataBytes, signatureBytes);
    const verificationTime = Date.now() - startTime;
    
    return {
      algorithm: this.level,
      valid: isValid,
      verificationTime: `${verificationTime}ms`,
      timestamp: new Date().toISOString(),
      metadata: {
        securityLevel: this.params.securityLevel,
        quantumResistant: true,
        nistCompliant: true
      }
    };
  }
  
  /**
   * Hash data for signing
   */
  _hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Export key pair to JSON
   */
  exportKeyPair(keyPair) {
    if (keyPair.awsManaged) {
      return JSON.stringify({
        algorithm: keyPair.algorithm,
        keyId: keyPair.keyId,
        awsManaged: true,
        created: keyPair.created,
        metadata: keyPair.metadata
      }, null, 2);
    }
    
    return JSON.stringify({
      algorithm: keyPair.algorithm,
      securityLevel: keyPair.securityLevel,
      created: keyPair.created,
      publicKey: {
        ...keyPair.publicKey,
        key: keyPair.publicKey.hex
      },
      privateKey: {
        ...keyPair.privateKey,
        key: Buffer.from(keyPair.privateKey.key).toString('hex')
      }
    }, null, 2);
  }
  
  /**
   * Import key pair from JSON
   */
  importKeyPair(jsonString) {
    const parsed = JSON.parse(jsonString);
    
    if (parsed.awsManaged) {
      return parsed;
    }
    
    return {
      algorithm: parsed.algorithm,
      securityLevel: parsed.securityLevel,
      created: parsed.created,
      publicKey: {
        ...parsed.publicKey,
        key: new Uint8Array(
          parsed.publicKey.key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        )
      },
      privateKey: {
        ...parsed.privateKey,
        key: new Uint8Array(
          parsed.privateKey.key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        )
      }
    };
  }
  
  /**
   * Create quantum-resistant hash
   */
  quantumHash(data) {
    // Use SHA3-256 which is quantum-resistant
    const hash = crypto.createHash('sha3-256');
    hash.update(data);
    return hash.digest('hex');
  }
}

export default MLDSACrypto;
