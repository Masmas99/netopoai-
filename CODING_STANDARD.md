# NetTopo AI — Coding Standards

## 1. General Principles
- **Strict Typing:** TypeScript strict mode enabled on frontend; Python type hints with Pydantic v2 on backend.
- **Single Source of Truth:** The Canonical Topology Schema defines the shape of all topology entities. Frontend and backend must conform to this schema.
- **Deterministic Logic First:** Never delegate mathematical or structural validation (IP calculations, VLSM, port limits, graph cycles) to an LLM. Always execute deterministic Python/TypeScript logic.
- **Preserve Documentation Integrity:** Maintain all existing comments, docstrings, and guidelines.

## 2. Python Backend Standards
- **Style:** PEP 8 compliance.
- **Pydantic Models:** Use Pydantic v2 `BaseModel` with `Field(...)`, strict validation, and JSON schema exportability.
- **Network Math:** Use standard library `ipaddress` for IPv4/IPv6 operations (`ipaddress.IPv4Network`, `ipaddress.IPv4Interface`).
- **Error Handling:** Use custom domain exceptions (`SubnetOverlapError`, `InvalidInterfaceError`, `PortCapacityExceededError`) with descriptive error messages.
- **Testing:** Write Pytest fixtures for network topologies. Every new engine feature must have unit tests covering edge cases.

## 3. Next.js Frontend Standards
- **Architecture:** App Router (`app/` directory), React Server Components where appropriate, Client Components marked with `'use client'`.
- **State Management:** Keep canvas node state synchronized with the canonical topology structure.
- **Components:** Modular components under `components/`, UI primitives under `components/ui/` (shadcn-compatible).
- **Security:** Never expose backend AI API keys or database connection strings to the client bundle.

