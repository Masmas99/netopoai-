# NetTopo AI — Project Overview

## 1. Description
NetTopo AI is an AI-powered Cisco network topology generator and educational workspace. It transforms natural language network descriptions and lab assignments into validated, interactive network topologies, deterministic IP addressing plans, and ready-to-use Cisco IOS CLI configurations.

## 2. Core Architecture
- **Frontend:** Next.js (App Router), TypeScript (Strict), React Flow (`@xyflow/react`), Tailwind CSS, shadcn/ui.
- **Backend Service:** Python, FastAPI, Pydantic v2, Python `ipaddress` standard library, NetworkX.
- **Data Persistence:** PostgreSQL with Prisma / SQLAlchemy.
- **AI Integration:** Multi-stage prompt architecture (Requirement Extractor -> Clarification/Assumptions -> Topology Planner).
- **Network Engine:** Deterministic calculation for VLSM/CIDR, interface capacity, port media validation, and Cisco IOS CLI generation.

## 3. High-Level Workflows
1. **Text to Topology:** User enters natural text (e.g., "2 routers, 2 switches, 4 PCs with static routing"). System extracts requirements, plans the topology, computes IP subnets, validates connections, and renders in visual editor.
2. **Assignment to Topology:** User submits a lab assignment. System parses constraints, highlights assumptions and missing parameters, waits for user confirmation, generates the topology, and verifies all constraints against validation rules.
3. **Interactive Visual Editor:** React Flow canvas with custom nodes (Routers, Switches, PCs, Servers). Interactive wiring, interface selection, device property editing, and real-time validation feedback.
4. **Export Center:** Downloadable topology JSON, individual Cisco CLI configuration files (`.cfg`), IP addressing documentation (`.pdf`), high-res diagrams (`.svg`/`.png`), and bundled ZIP archives. Honest, transparent status regarding Cisco `.pkt` files.

