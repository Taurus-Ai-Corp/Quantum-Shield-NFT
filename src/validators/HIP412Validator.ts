/**
 * HIP-412 NFT Metadata Standard Validator
 * https://hips.hedera.com/hip/hip-412
 *
 * Validates NFT metadata against HIP-412 v2.0.0 specification
 * Ensures compliance with Hedera Token Service metadata requirements
 *
 * @compliance HIP-412 v2.0.0, Hedera HTS metadata limits (100 bytes)
 */

import { z } from 'zod';

/**
 * HIP-412 Attribute Schema
 */
export const HIP412AttributeSchema = z.object({
  trait_type: z.string().min(1).max(100),
  value: z.union([z.string(), z.number(), z.boolean()]),
  display_type: z.enum(['number', 'boost_number', 'boost_percentage', 'date']).optional(),
  max_value: z.number().optional(),
});

/**
 * HIP-412 File Schema
 */
export const HIP412FileSchema = z.object({
  uri: z.string().url(),
  type: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  is_default_file: z.boolean().optional(),
});

/**
 * HIP-412 Localization Schema
 */
export const HIP412LocalizationSchema = z.object({
  uri: z.string().url(),
  default: z.string(),
  locales: z.array(z.string()),
});

/**
 * HIP-412 Properties Schema
 * Allows arbitrary key-value pairs for custom properties
 */
export const HIP412PropertiesSchema = z.record(z.unknown());

/**
 * Complete HIP-412 Metadata Schema
 */
export const HIP412MetadataSchema = z.object({
  // Required fields
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  image: z.string().url(),
  type: z.string().min(1),

  // Optional fields
  format: z.string().optional(),
  properties: HIP412PropertiesSchema.optional(),
  attributes: z.array(HIP412AttributeSchema).optional(),
  files: z.array(HIP412FileSchema).optional(),
  localization: HIP412LocalizationSchema.optional(),

  // Creator information
  creator: z.string().optional(),
  creatorDID: z.string().optional(),

  // Checksum for integrity
  checksum: z
    .object({
      algorithm: z.enum(['SHA-256', 'SHA-384', 'SHA-512']),
      hash: z.string(),
    })
    .optional(),
});

export type HIP412Metadata = z.infer<typeof HIP412MetadataSchema>;
export type HIP412Attribute = z.infer<typeof HIP412AttributeSchema>;
export type HIP412File = z.infer<typeof HIP412FileSchema>;
export type HIP412Localization = z.infer<typeof HIP412LocalizationSchema>;

/**
 * Validation result with detailed errors
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: HIP412Metadata;
}

/**
 * HIP-412 Metadata Validator
 */
export class HIP412Validator {
  private static readonly MAX_HEDERA_METADATA_BYTES = 100;
  private static readonly IPFS_CID_PATTERN =
    /^(ipfs:\/\/|https:\/\/ipfs\.io\/ipfs\/|https:\/\/.*\.ipfs\.[^\/]+\/)?(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50})$/;

  /**
   * Validate metadata against HIP-412 schema
   */
  static validate(metadata: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Zod schema validation
    const result = HIP412MetadataSchema.safeParse(metadata);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        errors.push(`${err.path.join('.')}: ${err.message}`);
      });

      return { valid: false, errors, warnings };
    }

    const validatedMetadata = result.data;

    // Additional validations
    this.validateImageURI(validatedMetadata.image, errors, warnings);
    this.validateAttributes(validatedMetadata.attributes, warnings);
    this.validateFiles(validatedMetadata.files, warnings);
    this.validateSerializationSize(validatedMetadata, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: validatedMetadata,
    };
  }

  /**
   * Validate image URI (prefer IPFS)
   */
  private static validateImageURI(image: string, errors: string[], warnings: string[]): void {
    // Check if IPFS CID
    if (this.IPFS_CID_PATTERN.test(image)) {
      return; // Valid IPFS CID
    }

    // Check if valid HTTP/HTTPS URL
    try {
      const url = new URL(image);
      if (!['http:', 'https:', 'ipfs:', 'ar:'].includes(url.protocol)) {
        errors.push(`Invalid image protocol: ${url.protocol}. Use IPFS, Arweave, or HTTPS`);
      }

      // Warn if using HTTP instead of IPFS
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        warnings.push('Consider using IPFS or Arweave for decentralized, permanent storage');
      }
    } catch (err) {
      errors.push('Invalid image URI format');
    }
  }

  /**
   * Validate attributes array
   */
  private static validateAttributes(
    attributes: HIP412Attribute[] | undefined,
    warnings: string[]
  ): void {
    if (!attributes || attributes.length === 0) return;

    // Check for duplicate trait_types
    const traitTypes = attributes.map((attr) => attr.trait_type);
    const duplicates = traitTypes.filter((item, index) => traitTypes.indexOf(item) !== index);

    if (duplicates.length > 0) {
      warnings.push(`Duplicate trait_types found: ${duplicates.join(', ')}`);
    }

    // Validate numeric attributes with max_value
    attributes.forEach((attr) => {
      if (typeof attr.value === 'number' && attr.max_value !== undefined) {
        if (attr.value > attr.max_value) {
          warnings.push(
            `Attribute "${attr.trait_type}": value ${attr.value} exceeds max_value ${attr.max_value}`
          );
        }
      }
    });
  }

  /**
   * Validate files array
   */
  private static validateFiles(files: HIP412File[] | undefined, warnings: string[]): void {
    if (!files || files.length === 0) return;

    // Check for default file
    const defaultFiles = files.filter((f) => f.is_default_file);
    if (defaultFiles.length > 1) {
      warnings.push('Multiple files marked as is_default_file');
    }

    // Validate URIs
    files.forEach((file, index) => {
      try {
        new URL(file.uri);
      } catch {
        warnings.push(`File ${index}: Invalid URI format`);
      }
    });
  }

  /**
   * Validate metadata serialization size for Hedera
   * HTS metadata field has 100-byte limit, use IPFS CID instead
   */
  private static validateSerializationSize(
    metadata: HIP412Metadata,
    errors: string[],
    warnings: string[]
  ): void {
    const serialized = JSON.stringify(metadata);
    const byteSize = Buffer.from(serialized, 'utf-8').length;

    if (byteSize > this.MAX_HEDERA_METADATA_BYTES) {
      warnings.push(
        `Metadata size ${byteSize} bytes exceeds Hedera HTS limit (${this.MAX_HEDERA_METADATA_BYTES} bytes). ` +
          `Store full metadata on IPFS and use CID as metadata field.`
      );
    }

    // Check if metadata is JSON-serializable
    try {
      JSON.parse(serialized);
    } catch (err) {
      errors.push('Metadata contains non-JSON-serializable values');
    }
  }

  /**
   * Generate IPFS-ready metadata JSON
   */
  static generateIPFSMetadata(metadata: HIP412Metadata): string {
    const validation = this.validate(metadata);

    if (!validation.valid) {
      throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`);
    }

    return JSON.stringify(metadata, null, 2);
  }

  /**
   * Create metadata reference for Hedera HTS
   * Returns shortened reference that fits in 100-byte limit
   */
  static createHederaMetadataReference(ipfsCID: string): Buffer {
    // Store IPFS CID as metadata (compact format)
    const reference = {
      ipfs: ipfsCID,
      v: '2.0.0', // HIP-412 version
    };

    const serialized = JSON.stringify(reference);
    const buffer = Buffer.from(serialized, 'utf-8');

    if (buffer.length > this.MAX_HEDERA_METADATA_BYTES) {
      // Fallback: just the CID
      return Buffer.from(ipfsCID, 'utf-8');
    }

    return buffer;
  }

  /**
   * Validate and prepare metadata for minting
   * Returns both full metadata (for IPFS) and Hedera reference
   */
  static prepareForMinting(metadata: unknown): {
    fullMetadata: HIP412Metadata;
    ipfsJSON: string;
    validationResult: ValidationResult;
  } {
    const validationResult = this.validate(metadata);

    if (!validationResult.valid) {
      throw new Error(`Metadata validation failed: ${validationResult.errors.join(', ')}`);
    }

    const fullMetadata = validationResult.metadata!;
    const ipfsJSON = this.generateIPFSMetadata(fullMetadata);

    return {
      fullMetadata,
      ipfsJSON,
      validationResult,
    };
  }

  /**
   * Validate Quantum Shield extended metadata
   * Adds quantum signature validation fields
   */
  static validateQuantumShieldMetadata(metadata: unknown): ValidationResult {
    const baseValidation = this.validate(metadata);

    if (!baseValidation.valid) {
      return baseValidation;
    }

    const warnings = [...baseValidation.warnings];

    // Check for quantum signature properties
    const meta = metadata as any;
    if (meta.properties) {
      const quantumFields = ['quantumSignature', 'mldsaPublicKey', 'shieldId'];
      const hasQuantumData = quantumFields.some((field) => field in meta.properties);

      if (!hasQuantumData) {
        warnings.push('Quantum Shield metadata missing quantum signature properties');
      }
    } else {
      warnings.push('No properties field - consider adding quantum signature data');
    }

    return {
      ...baseValidation,
      warnings,
    };
  }
}

/**
 * Helper function for quick validation
 */
export function validateHIP412(metadata: unknown): boolean {
  return HIP412Validator.validate(metadata).valid;
}

/**
 * Helper function to get validation errors
 */
export function getHIP412Errors(metadata: unknown): string[] {
  return HIP412Validator.validate(metadata).errors;
}
