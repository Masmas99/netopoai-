# NetTopo AI — API & Application Routes

## 1. Frontend Web Routes (Next.js)

### Public Pages
- `GET /` — Landing page & product feature highlights
- `GET /features` — Interactive capability demonstrations
- `GET /docs` — Documentation, Cisco Packet Tracer compatibility guide
- `GET /login` — User authentication
- `GET /register` — Account registration

### Authenticated Workspace Pages
- `GET /dashboard` — User project repository, recent generations, and templates
- `GET /topology/new` — Text-to-Topology wizard & prompt builder
- `GET /topology/assignment` — Assignment-to-Topology analyzer & document parser
- `GET /topology/editor/[projectId]` — Visual interactive React Flow canvas & properties inspector
- `GET /topology/editor/[projectId]/export` — Export Center for `.cfg`, `.json`, `.svg`, `.pdf`, `.zip`
- `GET /settings` — User preferences, theme, and API keys

---

## 2. Backend REST API Routes (FastAPI)

### Health & Meta
- `GET /api/health` — Service status and engine readiness
- `GET /api/catalog/devices` — List of supported Cisco models, interfaces, and media specifications

### Topology Processing Engine
- `POST /api/topology/parse` — Extract requirements and identify assumptions from natural text or assignment
- `POST /api/topology/plan` — Generate canonical topology JSON from structured requirements
- `POST /api/topology/validate` — Deterministic static validation of devices, interfaces, and IP plan
- `POST /api/topology/ip-plan` — Deterministic VLSM / subnet allocation calculations
- `POST /api/topology/configure` — Generate Cisco IOS CLI commands per device

### Projects & Persistence
- `GET /api/projects` — List user projects
- `POST /api/projects` — Create new project
- `GET /api/projects/{id}` — Retrieve project and latest topology version
- `PATCH /api/projects/{id}` — Update project metadata
- `DELETE /api/projects/{id}` — Delete project

### Export Pipeline
- `POST /api/export/cli` — Generate raw text configuration files for download
- `POST /api/export/bundle` — Package JSON, CLI scripts, diagrams, and documentation into a ZIP archive
- `GET /api/export/feasibility/pkt` — Status and documentation regarding Packet Tracer `.pkt` export

