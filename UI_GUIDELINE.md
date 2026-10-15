# NetTopo AI — UI/UX Guidelines

## 1. Design Philosophy
NetTopo AI is a specialized technical workspace designed for computer network engineering students, instructors, and engineers. The design must emphasize:
- **High Information Density & Visual Clarity:** Clean layouts without unnecessary visual clutter.
- **Desktop First:** Network topology design requires extensive canvas space and multi-panel property inspectors.
- **Immediate Feedback:** Clear visual error/warning badges, live connection validation, and deterministic addressing feedback.
- **Zero Deception:** No fake mockups, no claiming simulation success without evidence, and clear disclosure of `.pkt` export realities.

## 2. Color Palette & Typography
- **Primary / Brand:** Slate / Cisco Blue (`#005073`, `#049fd9`, Tailwind `sky-600` / `blue-600`).
- **Backgrounds:** Clean neutral dark/light theme (Slate 900 for dark canvas, Slate 50 for light surfaces).
- **Status Colors:**
  - Success / Up: Emerald / Green (`#10b981`)
  - Warning / Incomplete: Amber / Yellow (`#f59e0b`)
  - Error / Conflict: Rose / Red (`#ef4444`)
  - Info / Hint: Sky / Blue (`#0ea5e9`)
- **Typography:**
  - UI font: Inter or system sans-serif.
  - Code / Terminal / Interface names: JetBrains Mono / Fira Code / monospace.

## 3. Workspace Layout
- **Top Navigation Bar:** Project name, status indicator, undo/redo, auto-save state, validation summary button, and Export menu.
- **Left Sidebar (Device Catalog):** Grouped Cisco devices (Routers, Switches, Endpoints). Draggable into the canvas.
- **Center Canvas (React Flow):** Infinite zoom/pan canvas, minimap, grid snap, custom device nodes with interface badge indicators.
- **Right Sidebar (Properties Inspector):** Device details, interface list, IP assignments, gateway config, and local routing table.
- **Bottom Drawer (Collapsible):** Tabs for "Validation Engine Report", "Cisco IOS CLI Output", and "IP Addressing Table".

## 4. Cisco Device Node Representation
Each node on the canvas must show:
- Standard Cisco iconography (Router cylinder with cross-arrows, Switch box with dual arrows, PC monitor, Server tower).
- Hostname (e.g. `Router1`, `SW-Core`).
- Model name (e.g. `Cisco 2911`, `WS-C2960-24TT-L`).
- Interface link status dots (Green = connected, Gray = unconnected).
- Primary management / loopback IP if configured.

