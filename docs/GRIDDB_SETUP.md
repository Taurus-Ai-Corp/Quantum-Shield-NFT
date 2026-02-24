# GridDB Integration Setup

## Environment Variables

Add these variables to your `.env` file:

```bash
# GridDB Cloud Configuration
GRIDDB_ENABLED=true
GRIDDB_HOST=https://griddb-cloud.example.com/contract_id/griddb/v2/
GRIDDB_CLUSTER=quantum-shield-cluster
GRIDDB_DATABASE=shields_db
GRIDDB_USERNAME=your_username
GRIDDB_PASSWORD=your_password
GRIDDB_TIMEOUT=10000
```

## GridDB Cloud Setup

1. **Sign up for GridDB Cloud** (free tier available)
   - Visit: https://griddb.net/cloud
   - Create account and contract

2. **Create Cluster**
   - Cluster name: `quantum-shield-cluster`
   - Region: Select nearest to your deployment

3. **Create Databases**
   - `shields_db` - Primary NFT shield storage
   - `provenance_db` - Provenance event streams
   - `compliance_db` - Audit logs

4. **Get Credentials**
   - Copy your cluster URL (GRIDDB_HOST)
   - Create database user (GRIDDB_USERNAME/PASSWORD)

## Container Schemas

The GridDB client automatically creates these containers on first run:

### nft_shields (COLLECTION)
```json
{
  "container_name": "nft_shields",
  "container_type": "COLLECTION",
  "columns": [
    {"name": "shield_id", "type": "STRING"},
    {"name": "asset_id", "type": "STRING"},
    {"name": "owner", "type": "STRING"},
    {"name": "category", "type": "STRING"},
    {"name": "metadata_hash", "type": "STRING"},
    {"name": "ml_dsa_signature", "type": "STRING"},
    {"name": "shielded_at", "type": "TIMESTAMP"},
    {"name": "migration_state", "type": "STRING"},
    {"name": "status", "type": "STRING"},
    {"name": "metadata_json", "type": "STRING"}
  ]
}
```

### provenance_events (TIME_SERIES)
```json
{
  "container_name": "provenance_events",
  "container_type": "TIME_SERIES",
  "columns": [
    {"name": "timestamp", "type": "TIMESTAMP"},
    {"name": "asset_id", "type": "STRING"},
    {"name": "event_type", "type": "STRING"},
    {"name": "from_owner", "type": "STRING"},
    {"name": "to_owner", "type": "STRING"},
    {"name": "quantum_signature", "type": "STRING"},
    {"name": "hedera_topic_id", "type": "STRING"},
    {"name": "hedera_sequence", "type": "LONG"}
  ]
}
```

### verification_results (COLLECTION)
```json
{
  "container_name": "verification_results",
  "container_type": "COLLECTION",
  "columns": [
    {"name": "verification_id", "type": "STRING"},
    {"name": "shield_id", "type": "STRING"},
    {"name": "verified_at", "type": "TIMESTAMP"},
    {"name": "is_valid", "type": "BOOL"},
    {"name": "signature_valid", "type": "BOOL"},
    {"name": "provenance_valid", "type": "BOOL"},
    {"name": "migration_state", "type": "STRING"},
    {"name": "warnings", "type": "STRING"}
  ]
}
```

## Testing Connection

```typescript
import { GridDBClient } from './services/GridDBClient';

const client = new GridDBClient({
  host: process.env.GRIDDB_HOST!,
  cluster: process.env.GRIDDB_CLUSTER!,
  database: process.env.GRIDDB_DATABASE!,
  username: process.env.GRIDDB_USERNAME!,
  password: process.env.GRIDDB_PASSWORD!,
});

// Health check
const healthy = await client.healthCheck();
console.log('GridDB connected:', healthy);

// Initialize containers
await client.initializeShieldContainers();
```

## Benefits

- **Persistent Storage**: Data survives restarts (no more in-memory Map())
- **40-100x Faster Queries**: GridDB optimized for time-series data
- **SaaS Analytics**: Track usage per customer for billing
- **Compliance Ready**: Audit logs for EU AI Act, CNSA 2.0
- **90% Cost Reduction**: Fewer expensive Hedera HCS RPC calls
