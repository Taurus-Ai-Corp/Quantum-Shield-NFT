/**
 * Unit tests for NFTShieldService
 */

import { NFTShieldService } from '../../src/services/NFTShieldService';

describe('NFTShieldService', () => {
  let service: NFTShieldService;

  beforeEach(() => {
    service = new NFTShieldService({
      hederaOperatorId: '0.0.12345',
      hederaOperatorKey: 'test-key',
      hederaNetwork: 'testnet',
      mldsaLevel: 'ML-DSA-65',
      mlkemLevel: 'ML-KEM-768',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Shield Creation', () => {
    it('should initialize service with correct configuration', () => {
      expect(service).toBeDefined();
      expect(service['config'].mldsaLevel).toBe('ML-DSA-65');
      expect(service['config'].mlkemLevel).toBe('ML-KEM-768');
    });

    it('should generate unique shield IDs', async () => {
      const mockAsset = {
        assetId: '0.0.12345:1',
        category: 'art' as const,
        metadata: {
          name: 'Test NFT',
          description: 'Test Description',
          creator: 'Test Creator',
        },
      };

      // Mock the internal methods
      jest.spyOn(service as any, 'generateQuantumSignature').mockResolvedValue({
        signature: new Uint8Array(32),
        publicKey: new Uint8Array(32),
      });
      
      jest.spyOn(service as any, 'anchorToHedera').mockResolvedValue({
        topicId: '0.0.99999',
        sequenceNumber: 1,
        consensusTimestamp: '1234567890.123456789',
      });

      const shield1 = await service.createShield(mockAsset);
      const shield2 = await service.createShield(mockAsset);

      expect(shield1.shieldId).toBeDefined();
      expect(shield2.shieldId).toBeDefined();
      expect(shield1.shieldId).not.toBe(shield2.shieldId);
    });

    it('should validate asset metadata before shielding', async () => {
      const invalidAsset = {
        assetId: '',  // Invalid: empty asset ID
        category: 'art' as const,
        metadata: {
          name: '',  // Invalid: empty name
          description: 'Test',
          creator: 'Test',
        },
      };

      await expect(service.createShield(invalidAsset))
        .rejects
        .toThrow(/invalid|required|validation/i);
    });

    it('should handle quantum signature generation errors', async () => {
      const mockAsset = {
        assetId: '0.0.12345:1',
        category: 'art' as const,
        metadata: {
          name: 'Test NFT',
          description: 'Test Description',
          creator: 'Test Creator',
        },
      };

      jest.spyOn(service as any, 'generateQuantumSignature')
        .mockRejectedValue(new Error('Signature generation failed'));

      await expect(service.createShield(mockAsset))
        .rejects
        .toThrow('Signature generation failed');
    });
  });

  describe('Shield Verification', () => {
    it('should verify valid shield signatures', async () => {
      const mockShield = {
        shieldId: 'test-shield-123',
        assetId: '0.0.12345:1',
        signature: new Uint8Array(32),
        publicKey: new Uint8Array(32),
        topicId: '0.0.99999',
        sequenceNumber: 1,
      };

      jest.spyOn(service as any, 'verifyQuantumSignature')
        .mockResolvedValue({ valid: true, verificationTime: '<1ms' });

      const result = await service.verifyShield(mockShield.shieldId);
      
      expect(result.valid).toBe(true);
      expect(result.verificationTime).toBeDefined();
    });

    it('should reject invalid shield signatures', async () => {
      const mockShield = {
        shieldId: 'test-shield-123',
        assetId: '0.0.12345:1',
        signature: new Uint8Array(32),
        publicKey: new Uint8Array(32),
        topicId: '0.0.99999',
        sequenceNumber: 1,
      };

      jest.spyOn(service as any, 'verifyQuantumSignature')
        .mockResolvedValue({ valid: false, verificationTime: '<1ms', error: 'Invalid signature' });

      const result = await service.verifyShield(mockShield.shieldId);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing shield gracefully', async () => {
      const nonExistentShieldId = 'non-existent-shield';

      await expect(service.verifyShield(nonExistentShieldId))
        .rejects
        .toThrow(/not found|does not exist/i);
    });
  });

  describe('Provenance Tracking', () => {
    it('should track shield creation events', async () => {
      const mockAsset = {
        assetId: '0.0.12345:1',
        category: 'art' as const,
        metadata: {
          name: 'Test NFT',
          description: 'Test',
          creator: 'Test',
        },
      };

      jest.spyOn(service as any, 'generateQuantumSignature').mockResolvedValue({
        signature: new Uint8Array(32),
        publicKey: new Uint8Array(32),
      });
      
      jest.spyOn(service as any, 'anchorToHedera').mockResolvedValue({
        topicId: '0.0.99999',
        sequenceNumber: 1,
        consensusTimestamp: '1234567890.123456789',
      });

      const shield = await service.createShield(mockAsset);
      const provenance = await service.getProvenance(shield.shieldId);

      expect(provenance.events).toHaveLength(1);
      expect(provenance.events[0].eventType).toBe('SHIELD_CREATED');
    });

    it('should return chronological provenance chain', async () => {
      const mockShieldId = 'test-shield-123';

      jest.spyOn(service as any, 'fetchProvenanceFromHedera')
        .mockResolvedValue({
          events: [
            { eventType: 'SHIELD_CREATED', timestamp: '1000' },
            { eventType: 'OWNERSHIP_TRANSFER', timestamp: '2000' },
            { eventType: 'VERIFICATION', timestamp: '3000' },
          ],
        });

      const provenance = await service.getProvenance(mockShieldId);

      expect(provenance.events).toHaveLength(3);
      // Events should be in chronological order
      expect(provenance.events[0].timestamp).toBe('1000');
      expect(provenance.events[1].timestamp).toBe('2000');
      expect(provenance.events[2].timestamp).toBe('3000');
    });
  });

  describe('Performance', () => {
    it('should complete shield creation in under 100ms', async () => {
      const mockAsset = {
        assetId: '0.0.12345:1',
        category: 'art' as const,
        metadata: {
          name: 'Test NFT',
          description: 'Test',
          creator: 'Test',
        },
      };

      jest.spyOn(service as any, 'generateQuantumSignature').mockResolvedValue({
        signature: new Uint8Array(32),
        publicKey: new Uint8Array(32),
      });
      
      jest.spyOn(service as any, 'anchorToHedera').mockResolvedValue({
        topicId: '0.0.99999',
        sequenceNumber: 1,
        consensusTimestamp: '1234567890.123456789',
      });

      const startTime = Date.now();
      await service.createShield(mockAsset);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

