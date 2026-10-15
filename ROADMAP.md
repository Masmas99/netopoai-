# NetTopo AI — Product Roadmap

## Phase 0: Repository, Feasibility & Architecture (CURRENT)
- [x] Read and understand `PRD.md` and `PROMPT.md`.
- [x] Audit system environment (Node v24, Python 3.14, Git).
- [x] Conduct Cisco Packet Tracer `.pkt` export feasibility study (`docs/pkt_export_feasibility.md`).
- [x] Establish architectural documentation (`PROJECT.md`, `ROADMAP.md`, `TODO.md`, `DATABASE.md`, `UI_GUIDELINE.md`, `CODING_STANDARD.md`, `ROUTES.md`, `.env.example`).
- [ ] Implement Task 1: Core Canonical Topology Schema & Deterministic Network Engines (IP Addressing, Graph Validation, IOS CLI generation).

## Phase 1: Backend API & Core Foundation
- [ ] FastAPI application structure with Pydantic v2 schemas.
- [ ] Endpoints for parsing, planning, validation, IP allocation, and CLI configuration generation.
- [ ] Pytest test suite with representative Cisco network topologies (2-router static, 3-router multi-LAN, VLSM).

## Phase 2: Next.js Frontend Foundation & React Flow Editor
- [ ] Next.js App Router workspace with TypeScript, Tailwind CSS, and shadcn/ui.
- [ ] Custom React Flow nodes: Cisco Routers, Catalyst Switches, PCs, Servers.
- [ ] Interactive wiring: Port-to-port cable connection modal with interface picker.
- [ ] Properties drawer: Device configuration, IP settings, and real-time validation badges.

## Phase 3: AI Pipeline & Assignment Analyzer
- [ ] Multi-stage AI prompt chain:
  - Stage 1: RequirementExtractor (explicit constraints, missing parameters, assumptions).
  - Stage 2: Clarification and Assumption Review UI.
  - Stage 3: TopologyPlanner (translates approved requirements into canonical topology JSON).
- [ ] Deterministic post-validation before editor rendering.

## Phase 4: Device Configuration & Export Center
- [ ] Multi-device Cisco IOS CLI generator (Hostname, Interface IPs, `no shutdown`, static routes, VLANs).
- [ ] Export formats: Structured JSON, individual `.cfg` files, SVG/PNG diagram, PDF summary report, and `.zip` bundle.
- [ ] Transparent Packet Tracer export disclosure and PTMP bridge prototype.

## Phase 5: Hardening & End-to-End Verification
- [ ] Comprehensive unit and integration test coverage.
- [ ] Performance and security audits.
- [ ] User guide and installation instructions.

