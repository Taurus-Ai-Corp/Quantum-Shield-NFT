/**
 * QuantumCryptoManager - Unified quantum-resistant cryptography manager
 * Combines ML-DSA signatures and ML-KEM key encapsulation
 * Production-ready for Hedera integration
 */

import { MLDSACrypto } from './MLDSACrypto.js';
import { MLKEMCrypto } from './MLKEMCrypto.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class QuantumCryptoManager {
  constructor(config = {}) {
    this.config = {
      mldsaLevel: config.mldsaLevel || 'ML-DSA-65',
      mlkemLevel: config.mlkemLevel || 'ML-KEM-768',
      useAWS: config.useAWS || false,
      keyStorePath: config.keyStorePath || './quantum-keys',
      rotationDays: config.rotationDays || 365
    };
    
    // Initialize cryptography modules
    this.mldsa = new MLDSACrypto(this.config.mldsaLevel, this.config.useAWS);
    this.mlkem = new MLKEMCrypto(this.config.mlkemLevel);
    
    // Key storage
    this.keyStore = new Map();
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         QUANTUM CRYPTO MANAGER INITIALIZED                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Signatures: ${this.config.mldsaLevel.padEnd(48)} ║
║  Key Exchange: ${this.config.mlkemLevel.padEnd(46)} ║
║  AWS Integration: ${(this.config.useAWS ? 'Yes' : 'No').padEnd(43)} ║
║  Key Rotation: ${(this.config.rotationDays + ' days').padEnd(46)} ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }
  
  /**
   * Initialize key store directory
   */
  async initializeKeyStore() {
    try {
      await fs.mkdir(this.config.keyStorePath, { recursive: true });
      console.log(`✅ Key store initialized at: ${this.config.keyStorePath}`);
    } catch (error) {
      console.error('Failed to initialize key store:', error);
    }
  }
  
  /**
   * Generate complete quantum-resistant identity
   */
  async generateQuantumIdentity(identityName) {
    console.log(`\n🔐 Generating quantum identity: ${identityName}`);
    
    // Generate ML-DSA signing keys
    const signingKeys = await this.mldsa.generateKeyPair();
    
    // Generate ML-KEM key exchange keys
    const kemKeys = this.mlkem.generateKeyPair();
    
    // Generate unique identity ID
    const identityId = crypto.randomUUID();
    
    const identity = {
      id: identityId,
      name: identityName,
      created: new Date().toISOString(),
      signingKeys: signingKeys,
      kemKeys: kemKeys,
      metadata: {
        quantumResistant: true,
        nistCompliant: true,
        rotationSchedule: this.config.rotationDays
      }
    };
    
    // Store in memory
    this.keyStore.set(identityId, identity);
    
    // Persist to disk
    await this.saveIdentity(identity);
    
    console.log(`✅ Quantum identity generated: ${identityId}`);
    
    return {
      identityId: identityId,
      name: identityName,
      publicKeys: {
        signing: signingKeys.publicKey || { keyId: signingKeys.keyId },
        kem: kemKeys.publicKey
      }
    };
  }
  
  /**
   * Sign data with quantum-resistant signature
   */
  async signData(identityId, data) {
    const identity = this.keyStore.get(identityId);
    if (!identity) {
      throw new Error(`Identity not found: ${identityId}`);
    }
    
    const privateKey = identity.signingKeys.privateKey?.key || identity.signingKeys.keyId;
    const signature = await this.mldsa.sign(privateKey, data);
    
    return {
      identityId: identityId,
      signature: signature,
      publicKey: identity.signingKeys.publicKey || { keyId: identity.signingKeys.keyId }
    };
  }
  
  /**
   * Verify quantum-resistant signature
   */
  async verifySignature(publicKey, data, signature) {
    return await this.mldsa.verify(publicKey, data, signature);
  }
  
  /**
   * Create quantum-secure encrypted channel
   */
  async createSecureChannel(senderIdentityId, recipientPublicKey) {
    const sender = this.keyStore.get(senderIdentityId);
    if (!sender) {
      throw new Error(`Sender identity not found: ${senderIdentityId}`);
    }
    
    // Encapsulate shared secret
    const encapsulation = this.mlkem.encapsulate(recipientPublicKey);
    
    // Sign the encapsulation for authenticity
    const signatureData = await this.signData(
      senderIdentityId,
      encapsulation.ciphertextHex
    );
    
    return {
      channelId: crypto.randomUUID(),
      sender: senderIdentityId,
      encapsulation: encapsulation,
      signature: signatureData.signature,
      senderPublicKey: sender.signingKeys.publicKey || { keyId: sender.signingKeys.keyId },
      created: new Date().toISOString()
    };
  }
  
  /**
   * Accept secure channel and derive shared key
   */
  async acceptSecureChannel(recipientIdentityId, channelData) {
    const recipient = this.keyStore.get(recipientIdentityId);
    if (!recipient) {
      throw new Error(`Recipient identity not found: ${recipientIdentityId}`);
    }
    
    // Verify sender's signature
    const isValid = await this.verifySignature(
      channelData.senderPublicKey,
      channelData.encapsulation.ciphertextHex,
      channelData.signature
    );
    
    if (!isValid.valid) {
      throw new Error('Invalid channel signature - potential tampering detected');
    }
    
    // Decapsulate to get shared secret
    const decapsulation = this.mlkem.decapsulate(
      recipient.kemKeys.secretKey,
      Buffer.from(channelData.encapsulation.ciphertextHex, 'hex')
    );
    
    // Derive symmetric key
    const symmetricKey = this.mlkem.deriveSymmetricKey(decapsulation);
    
    return {
      channelId: channelData.channelId,
      sharedKey: symmetricKey,
      verified: true,
      established: new Date().toISOString()
    };
  }
  
  /**
   * Quantum-secure hybrid encryption
   */
  async quantumEncrypt(recipientPublicKey, data, senderIdentityId = null) {
    // Hybrid encrypt with ML-KEM
    const encrypted = await this.mlkem.hybridEncrypt(recipientPublicKey, data);
    
    // Optionally sign the encrypted package
    if (senderIdentityId) {
      const signature = await this.signData(
        senderIdentityId,
        JSON.stringify(encrypted)
      );
      
      encrypted.signature = signature;
      encrypted.authenticated = true;
    }
    
    return encrypted;
  }
  
  /**
   * Quantum-secure hybrid decryption
   */
  async quantumDecrypt(recipientIdentityId, encryptedPackage) {
    const recipient = this.keyStore.get(recipientIdentityId);
    if (!recipient) {
      throw new Error(`Recipient identity not found: ${recipientIdentityId}`);
    }
    
    // Verify signature if present
    if (encryptedPackage.authenticated && encryptedPackage.signature) {
      const packageCopy = { ...encryptedPackage };
      delete packageCopy.signature;
      delete packageCopy.authenticated;
      
      const isValid = await this.verifySignature(
        encryptedPackage.signature.publicKey,
        JSON.stringify(packageCopy),
        encryptedPackage.signature.signature
      );
      
      if (!isValid.valid) {
        throw new Error('Invalid encryption signature - potential tampering');
      }
    }
    
    // Decrypt
    return await this.mlkem.hybridDecrypt(
      recipient.kemKeys.secretKey,
      encryptedPackage
    );
  }
  
  /**
   * Generate quantum random data
   */
  async generateQuantumRandom(bytes = 32) {
    // In production, this would interface with quantum RNG hardware
    // For now, use crypto-secure random with quantum post-processing
    const classicalRandom = crypto.randomBytes(bytes);
    
    // Apply quantum-inspired post-processing
    const quantumSeed = this.mldsa.quantumHash(classicalRandom);
    const processedRandom = crypto.createHash('sha3-256')
      .update(quantumSeed)
      .digest();
    
    return {
      random: processedRandom,
      randomHex: processedRandom.toString('hex'),
      bytes: processedRandom.length,
      quantum: 'simulated',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Save identity to disk
   */
  async saveIdentity(identity) {
    try {
      const filename = path.join(
        this.config.keyStorePath, 
        `${identity.id}.json`
      );
      
      // Only save non-sensitive data for AWS-managed keys
      const toSave = {
        id: identity.id,
        name: identity.name,
        created: identity.created,
        metadata: identity.metadata
      };
      
      if (!identity.signingKeys.awsManaged) {
        toSave.signingKeys = identity.signingKeys;
      } else {
        toSave.signingKeys = {
          algorithm: identity.signingKeys.algorithm,
          keyId: identity.signingKeys.keyId,
          awsManaged: true
        };
      }
      
      toSave.kemKeys = identity.kemKeys;
      
      await fs.writeFile(
        filename,
        JSON.stringify(toSave, null, 2)
      );
      
      console.log(`💾 Identity saved: ${filename}`);
    } catch (error) {
      console.error('Failed to save identity:', error);
    }
  }
  
  /**
   * Load identity from disk
   */
  async loadIdentity(identityId) {
    try {
      const filename = path.join(
        this.config.keyStorePath,
        `${identityId}.json`
      );
      
      const data = await fs.readFile(filename, 'utf8');
      const identity = JSON.parse(data);
      
      // Restore key formats
      if (!identity.signingKeys.awsManaged && identity.signingKeys.publicKey) {
        identity.signingKeys = this.mldsa.importKeyPair(
          JSON.stringify(identity.signingKeys)
        );
      }
      
      if (identity.kemKeys.publicKey) {
        identity.kemKeys.publicKey = this.mlkem.importPublicKey({
          algorithm: identity.kemKeys.algorithm,
          publicKey: identity.kemKeys.publicKey.hex,
          created: identity.kemKeys.created,
          metadata: identity.kemKeys.metadata
        });
        
        // Restore secret key
        if (identity.kemKeys.secretKey) {
          identity.kemKeys.secretKey.key = new Uint8Array(
            identity.kemKeys.secretKey.key.match(/.{1,2}/g)
              .map(byte => parseInt(byte, 16))
          );
        }
      }
      
      this.keyStore.set(identityId, identity);
      console.log(`📂 Identity loaded: ${identityId}`);
      
      return identity;
    } catch (error) {
      console.error('Failed to load identity:', error);
      return null;
    }
  }
  
  /**
   * Check if keys need rotation
   */
  needsRotation(identity) {
    const created = new Date(identity.created);
    const now = new Date();
    const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);
    
    return daysSinceCreation >= this.config.rotationDays;
  }
  
  /**
   * Get identity status
   */
  getIdentityStatus(identityId) {
    const identity = this.keyStore.get(identityId);
    if (!identity) {
      return null;
    }
    
    return {
      id: identity.id,
      name: identity.name,
      created: identity.created,
      needsRotation: this.needsRotation(identity),
      algorithms: {
        signing: identity.signingKeys.algorithm,
        kem: identity.kemKeys.algorithm
      },
      awsManaged: identity.signingKeys.awsManaged || false
    };
  }
}

export default QuantumCryptoManager;
