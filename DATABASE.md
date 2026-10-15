# NetTopo AI — Database Schema Design

## 1. Overview
NetTopo AI stores user accounts, projects, topology versions, export jobs, and audit histories in PostgreSQL. The canonical topology specification itself is stored as structured, validated JSON conforming to the NetTopo Topology Schema (v1.0), enabling fast iteration and versioning.

## 2. Entity-Relationship Diagram (Conceptual)

```
User (1) ────< (N) Project (1) ────< (N) TopologyVersion
                      │
                      └───< (N) ExportJob
```

## 3. Tables & Schema Definitions

### 3.1 `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Account email |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password (argon2id or bcrypt) |
| `created_at` | TIMESTAMPTZ | DEFAULT now(), NOT NULL | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now(), NOT NULL | Last update timestamp |

### 3.2 `projects`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique project ID |
| `user_id` | UUID | REFERENCES users(id) ON DELETE CASCADE | Owner of the project |
| `name` | VARCHAR(255) | NOT NULL | Project title |
| `description` | TEXT | NULLABLE | Optional project notes |
| `source_type` | VARCHAR(50) | NOT NULL | `TEXT`, `ASSIGNMENT`, `MANUAL` |
| `source_text` | TEXT | NULLABLE | Original input prompt or assignment |
| `status` | VARCHAR(50) | DEFAULT 'DRAFT' | `DRAFT`, `PLANNED`, `VALIDATED`, `ARCHIVED` |
| `created_at` | TIMESTAMPTZ | DEFAULT now(), NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now(), NOT NULL | Last update timestamp |

### 3.3 `topology_versions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique version ID |
| `project_id` | UUID | REFERENCES projects(id) ON DELETE CASCADE | Associated project |
| `version_number` | INTEGER | NOT NULL | Incremental version (1, 2, 3...) |
| `topology_json` | JSONB | NOT NULL | Full validated Canonical Topology Schema |
| `requirement_json`| JSONB | NULLABLE | Extracted explicit/inferred requirements |
| `validation_json` | JSONB | NULLABLE | Deterministic validation report output |
| `created_at` | TIMESTAMPTZ | DEFAULT now(), NOT NULL | Timestamp when snapshot was created |

### 3.4 `export_jobs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique export job ID |
| `project_id` | UUID | REFERENCES projects(id) ON DELETE CASCADE | Target project |
| `format` | VARCHAR(50) | NOT NULL | `JSON`, `CLI_CFG`, `SVG`, `PNG`, `PDF`, `ZIP` |
| `status` | VARCHAR(50) | DEFAULT 'PENDING' | `PENDING`, `COMPLETED`, `FAILED` |
| `artifact_url` | TEXT | NULLABLE | Storage path / URL for download |
| `error_message` | TEXT | NULLABLE | Error description if failed |
| `created_at` | TIMESTAMPTZ | DEFAULT now(), NOT NULL | Job trigger timestamp |
| `completed_at` | TIMESTAMPTZ | NULLABLE | Job completion timestamp |

