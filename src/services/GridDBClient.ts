/**
 * GridDB Cloud WebAPI Client
 *
 * Provides persistent storage for NFT shields, provenance, and verifications
 * using GridDB Cloud's REST API interface.
 *
 * Architecture:
 * - COLLECTION containers for key-value storage (shields, verifications)
 * - TIME_SERIES containers for event streams (provenance, audit logs)
 * - REST API over HTTPS with Basic Auth
 *
 * @see https://docs.griddb.net/latest/webapi/webapi/
 */

export interface GridDBConfig {
  host: string; // https://griddb-cloud.q-grid.net/contract_id/griddb/v2/
  cluster: string;
  database: string;
  username: string;
  password: string;
  timeout?: number; // Request timeout in ms
}

export interface GridDBContainer {
  container_name: string;
  container_type: 'COLLECTION' | 'TIME_SERIES';
  columns: GridDBColumn[];
  rowKeyAssigned?: boolean;
}

export interface GridDBColumn {
  name: string;
  type:
    | 'STRING'
    | 'BOOL'
    | 'BYTE'
    | 'SHORT'
    | 'INTEGER'
    | 'LONG'
    | 'FLOAT'
    | 'DOUBLE'
    | 'TIMESTAMP'
    | 'BLOB';
  timePrecision?: 'MILLISECOND' | 'MICROSECOND' | 'NANOSECOND';
}

export interface GridDBRow {
  [key: string]: any;
}

/**
 * GridDB Cloud WebAPI Client
 */
export class GridDBClient {
  private config: GridDBConfig;
  private authHeader: string;

  constructor(config: GridDBConfig) {
    this.config = {
      timeout: 10000, // 10 seconds default
      ...config,
    };

    // Basic Auth header
    const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          GRIDDB CLIENT INITIALIZED                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Host: ${config.host.padEnd(54)} ║
║  Cluster: ${config.cluster.padEnd(51)} ║
║  Database: ${config.database.padEnd(50)} ║
║  Storage: Persistent time-series + collections               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Make HTTP request to GridDB WebAPI
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.config.host}${this.config.cluster}/${this.config.database}${endpoint}`;

    // eslint-disable-next-line no-undef -- RequestInit is a built-in TypeScript type
    const options: RequestInit = {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout!),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`GridDB API error: ${response.status} - ${error}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error(`GridDB request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Create a container (table) in GridDB
   */
  async createContainer(container: GridDBContainer): Promise<void> {
    await this.request('POST', '/containers', [container]);
  }

  /**
   * Check if container exists
   */
  async containerExists(containerName: string): Promise<boolean> {
    try {
      await this.request('GET', `/containers/${containerName}`);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Insert row into container
   */
  async insertRow(containerName: string, row: GridDBRow): Promise<void> {
    await this.request('PUT', `/containers/${containerName}/rows`, [row]);
  }

  /**
   * Insert multiple rows
   */
  async insertRows(containerName: string, rows: GridDBRow[]): Promise<void> {
    await this.request('PUT', `/containers/${containerName}/rows`, rows);
  }

  /**
   * Query container with TQL (GridDB query language)
   */
  async query<T>(tql: string): Promise<T[]> {
    interface QueryResponse {
      columns: GridDBColumn[];
      results: any[][];
    }

    const response = await this.request<QueryResponse>('POST', '/tql', { stmt: tql });

    // Convert array of arrays to array of objects
    return response.results.map((row) => {
      const obj: any = {};
      response.columns.forEach((col, index) => {
        obj[col.name] = row[index];
      });
      return obj as T;
    });
  }

  /**
   * Get row by key (for COLLECTION containers)
   */
  async getRow<T>(containerName: string, key: string | number): Promise<T | null> {
    try {
      interface RowResponse {
        columns: GridDBColumn[];
        rows: any[][];
      }

      const response = await this.request<RowResponse>(
        'POST',
        `/containers/${containerName}/rows`,
        [key]
      );

      if (!response.rows || response.rows.length === 0) {
        return null;
      }

      const row = response.rows[0];
      if (!row) {
        return null;
      }

      const obj: any = {};
      response.columns.forEach((col, index) => {
        obj[col.name] = row[index];
      });
      return obj as T;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update row (delete + insert)
   */
  async updateRow(containerName: string, key: string | number, row: GridDBRow): Promise<void> {
    await this.deleteRow(containerName, key);
    await this.insertRow(containerName, row);
  }

  /**
   * Delete row by key
   */
  async deleteRow(containerName: string, key: string | number): Promise<void> {
    await this.request('DELETE', `/containers/${containerName}/rows`, [key]);
  }

  /**
   * Get all rows from container (use with caution on large containers)
   */
  async getAllRows<T>(containerName: string, limit = 1000): Promise<T[]> {
    const tql = `SELECT * FROM ${containerName} LIMIT ${limit}`;
    return this.query<T>(tql);
  }

  /**
   * Search rows with condition
   */
  async searchRows<T>(containerName: string, where: string, limit = 100): Promise<T[]> {
    const tql = `SELECT * FROM ${containerName} WHERE ${where} LIMIT ${limit}`;
    return this.query<T>(tql);
  }

  /**
   * Count rows in container
   */
  async countRows(containerName: string, where?: string): Promise<number> {
    const tql = where
      ? `SELECT COUNT(*) FROM ${containerName} WHERE ${where}`
      : `SELECT COUNT(*) FROM ${containerName}`;

    const result = await this.query<{ count: number }>(tql);
    return result[0]?.count || 0;
  }

  /**
   * Initialize NFT Shield containers
   */
  async initializeShieldContainers(): Promise<void> {
    console.log('\n📦 Initializing GridDB containers for NFT Shield...');

    // Container 1: nft_shields (COLLECTION)
    const shieldsContainer: GridDBContainer = {
      container_name: 'nft_shields',
      container_type: 'COLLECTION',
      rowKeyAssigned: true,
      columns: [
        { name: 'shield_id', type: 'STRING' }, // Primary key
        { name: 'asset_id', type: 'STRING' },
        { name: 'owner', type: 'STRING' },
        { name: 'category', type: 'STRING' },
        { name: 'metadata_hash', type: 'STRING' },
        { name: 'ml_dsa_signature', type: 'STRING' },
        { name: 'shielded_at', type: 'TIMESTAMP', timePrecision: 'MILLISECOND' },
        { name: 'migration_state', type: 'STRING' },
        { name: 'status', type: 'STRING' },
        { name: 'metadata_json', type: 'STRING' }, // Full metadata as JSON
      ],
    };

    // Container 2: provenance_events (TIME_SERIES)
    const provenanceContainer: GridDBContainer = {
      container_name: 'provenance_events',
      container_type: 'TIME_SERIES',
      columns: [
        { name: 'timestamp', type: 'TIMESTAMP', timePrecision: 'MILLISECOND' },
        { name: 'asset_id', type: 'STRING' },
        { name: 'event_type', type: 'STRING' }, // SHIELD_CREATED, OWNERSHIP_TRANSFERRED, etc.
        { name: 'from_owner', type: 'STRING' },
        { name: 'to_owner', type: 'STRING' },
        { name: 'quantum_signature', type: 'STRING' },
        { name: 'hedera_topic_id', type: 'STRING' },
        { name: 'hedera_sequence', type: 'LONG' },
      ],
    };

    // Container 3: verification_results (COLLECTION)
    const verificationsContainer: GridDBContainer = {
      container_name: 'verification_results',
      container_type: 'COLLECTION',
      rowKeyAssigned: true,
      columns: [
        { name: 'verification_id', type: 'STRING' }, // Primary key
        { name: 'shield_id', type: 'STRING' },
        { name: 'verified_at', type: 'TIMESTAMP', timePrecision: 'MILLISECOND' },
        { name: 'is_valid', type: 'BOOL' },
        { name: 'signature_valid', type: 'BOOL' },
        { name: 'provenance_valid', type: 'BOOL' },
        { name: 'migration_state', type: 'STRING' },
        { name: 'warnings', type: 'STRING' }, // JSON array of warnings
      ],
    };

    // Create containers if they don't exist
    for (const container of [shieldsContainer, provenanceContainer, verificationsContainer]) {
      const exists = await this.containerExists(container.container_name);
      if (!exists) {
        await this.createContainer(container);
        console.log(`  ✅ Created container: ${container.container_name}`);
      } else {
        console.log(`  ✓ Container exists: ${container.container_name}`);
      }
    }

    console.log('✅ GridDB containers initialized\n');
  }

  /**
   * Health check - verify connection to GridDB
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('GET', '/containers');
      return true;
    } catch (error) {
      console.error('GridDB health check failed:', error);
      return false;
    }
  }
}

export default GridDBClient;
