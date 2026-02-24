/**
 * HIP-412 Validator Tests
 * Verifies NFT metadata validation against HIP-412 standard
 */

import { HIP412Validator, type HIP412Metadata } from '../src/validators/HIP412Validator.js';

describe('HIP412Validator', () => {
  describe('Valid Metadata', () => {
    test('should validate minimal required fields', () => {
      const metadata: HIP412Metadata = {
        name: 'Quantum Shield NFT #1',
        description: 'Protected by ML-DSA-65',
        image: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate full metadata with all fields', () => {
      const metadata: HIP412Metadata = {
        name: 'Quantum Shield NFT #1',
        description: 'Protected by ML-DSA-65 quantum signatures',
        image: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        type: 'nft',
        format: 'image/png',
        properties: {
          quantumProtected: true,
          algorithm: 'ML-DSA-65',
          shieldId: '123e4567-e89b-12d3-a456-426614174000'
        },
        attributes: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Power', value: 100, display_type: 'number', max_value: 100 }
        ],
        files: [
          {
            uri: 'ipfs://QmHash123',
            type: 'image/png',
            is_default_file: true
          }
        ],
        creator: '0.0.123456',
        checksum: {
          algorithm: 'SHA-256',
          hash: 'abc123...'
        }
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata).toBeDefined();
    });
  });

  describe('Invalid Metadata', () => {
    test('should reject missing required name field', () => {
      const metadata = {
        description: 'Test',
        image: 'ipfs://QmHash',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('name');
    });

    test('should reject invalid image URL', () => {
      const metadata = {
        name: 'Test NFT',
        image: 'not-a-valid-url',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('image'))).toBe(true);
    });

    test('should reject name exceeding 100 characters', () => {
      const metadata = {
        name: 'a'.repeat(101),
        image: 'ipfs://QmHash',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('name'))).toBe(true);
    });
  });

  describe('IPFS Integration', () => {
    test('should recognize valid IPFS CID v0', () => {
      const metadata: HIP412Metadata = {
        name: 'Test',
        image: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(true);
      expect(result.warnings).not.toContain('Consider using IPFS');
    });

    test('should warn about non-IPFS URLs', () => {
      const metadata: HIP412Metadata = {
        name: 'Test',
        image: 'https://example.com/image.png',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('IPFS'))).toBe(true);
    });
  });

  describe('Hedera Metadata Size', () => {
    test('should warn when metadata exceeds 100 bytes', () => {
      const metadata: HIP412Metadata = {
        name: 'Quantum Shield NFT with very long name and lots of metadata',
        description: 'This is a very long description that will definitely exceed the 100-byte limit for Hedera HTS metadata field, so it should generate a warning to use IPFS instead',
        image: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        type: 'nft'
      };

      const result = HIP412Validator.validate(metadata);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('bytes exceeds Hedera HTS limit'))).toBe(true);
    });
  });

  describe('Quantum Shield Extended Validation', () => {
    test('should validate quantum-specific properties', () => {
      const metadata: HIP412Metadata = {
        name: 'Quantum Protected Asset',
        image: 'ipfs://QmHash',
        type: 'nft',
        properties: {
          quantumSignature: 'abc123...',
          mldsaPublicKey: 'def456...',
          shieldId: '123e4567-e89b-12d3-a456-426614174000'
        }
      };

      const result = HIP412Validator.validateQuantumShieldMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.warnings).not.toContain('missing quantum signature properties');
    });

    test('should warn when quantum properties are missing', () => {
      const metadata: HIP412Metadata = {
        name: 'Regular NFT',
        image: 'ipfs://QmHash',
        type: 'nft'
      };

      const result = HIP412Validator.validateQuantumShieldMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('quantum'))).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    test('should generate IPFS-ready JSON', () => {
      const metadata: HIP412Metadata = {
        name: 'Test',
        image: 'ipfs://QmHash',
        type: 'nft'
      };

      const json = HIP412Validator.generateIPFSMetadata(metadata);

      expect(json).toBeDefined();
      expect(JSON.parse(json)).toEqual(metadata);
    });

    test('should create Hedera metadata reference', () => {
      const ipfsCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
      const reference = HIP412Validator.createHederaMetadataReference(ipfsCID);

      expect(reference).toBeInstanceOf(Buffer);
      expect(reference.length).toBeLessThanOrEqual(100);

      const parsed = JSON.parse(reference.toString('utf-8'));
      expect(parsed.ipfs).toBe(ipfsCID);
      expect(parsed.v).toBe('2.0.0');
    });

    test('should prepare metadata for minting', () => {
      const metadata: HIP412Metadata = {
        name: 'Quantum NFT',
        image: 'ipfs://QmHash',
        type: 'nft'
      };

      const prepared = HIP412Validator.prepareForMinting(metadata);

      expect(prepared.fullMetadata).toBeDefined();
      expect(prepared.ipfsJSON).toBeDefined();
      expect(prepared.validationResult.valid).toBe(true);
    });
  });
});
