# NetTopo AI — Task List (TODO.md)

| Task ID | Description | Priority | Dependencies | Acceptance Criteria | Status |
|---|---|---|---|---|---|
| **TASK-001** | Conduct `.pkt` export feasibility study and document findings | P0 | None | Formal feasibility report created in `docs/pkt_export_feasibility.md` examining modern PT binary structure and official IPC mechanisms. | **DONE** |
| **TASK-002** | Create core architectural and design documentation | P0 | None | `PROJECT.md`, `ROADMAP.md`, `TODO.md`, `DATABASE.md`, `UI_GUIDELINE.md`, `CODING_STANDARD.md`, `ROUTES.md`, and `.env.example` created. | **DONE** |
| **TASK-003** | Implement Canonical Topology Data Model (Pydantic v2) and Cisco Hardware Catalog | P0 | TASK-002 | Strict Pydantic models for Devices, Interfaces, Connections, Networks, and Topologies. Cisco device catalog with accurate port counts. | **DONE** |
| **TASK-004** | Implement Deterministic IP Addressing & VLSM Engine | P0 | TASK-003 | Subnet calculations, host ranges, broadcast addresses, overlap detection, duplicate IP checks, and gateway assignments using Python `ipaddress`. | **DONE** |
| **TASK-005** | Implement Deterministic Topology Validation Engine | P0 | TASK-003, TASK-004 | Validates interface limits, connection media compatibility, gateway consistency, static route reachability, and isolated nodes. Produces categorized Error/Warning/Info reports. | **DONE** |
| **TASK-006** | Implement Cisco IOS CLI Configuration Generator (Phase 1) | P1 | TASK-003, TASK-004 | Generates valid Cisco IOS commands (hostname, interface IP/mask, no shutdown, ip route) for routers and switches with explanation comments. | **DONE** |
| **TASK-007** | Write Comprehensive Backend Pytest Suite & Fixtures | P0 | TASK-003 to TASK-006 | Automated unit tests covering 2-router static routing, 3-router multi-LAN, VLSM subnets, and contradictory/error cases. 19/19 tests passed. | **DONE** |
| **TASK-008** | Implement FastAPI Application & Endpoints | P1 | TASK-003 to TASK-007 | REST API endpoints for `/api/health`, `/api/catalog/devices`, `/api/topology/validate`, `/api/topology/ip-plan/vlsm`, `/api/topology/configure`, `/api/export/feasibility/pkt`. Tested & verified. | **DONE** |
| **TASK-009** | Initialize Next.js Frontend Workspace with React Flow & Tailwind | P1 | TASK-002 | Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui components, and React Flow integration. Built & type-checked cleanly. | **DONE** |
| **TASK-010** | Build Interactive Visual Topology Editor | P1 | TASK-009, TASK-003 | Interactive canvas with custom Cisco nodes, port connection modal, property inspector drawer, and live validation status. Verified & compiled. | **DONE** |
| **TASK-011** | Implement AI Requirement Extractor & Clarification Review | P2 | TASK-008, TASK-009 | Multi-stage prompt flow separating explicit requirements, assumptions, and missing parameters with user confirmation dialog. | **TODO** |
| **TASK-012** | Implement Export Center (JSON, CLI .cfg, SVG/PNG, PDF, ZIP) | P1 | TASK-008, TASK-010 | Generates downloadable artifacts per device and bundled archive. Honest `.pkt` status disclosure. | **TODO** |
