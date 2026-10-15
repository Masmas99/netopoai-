# Cisco Packet Tracer (.pkt) Export Feasibility Report

**Project:** NetTopo AI  
**Author:** AI Systems Architect & Network Automation Engineer  
**Date:** October 2026  
**Status:** Feasibility Study Complete — Fallback Architecture Adopted  

---

## 1. Executive Summary

A core promise of NetTopo AI is to assist networking students and instructors in producing topologies that can be loaded into Cisco Packet Tracer. However, both `PRD.md` and `PROMPT.md` strictly prohibit spoofing `.pkt` files (e.g., renaming XML, JSON, or ZIP files to `.pkt`), demanding honest technical proof before any claims of automatic `.pkt` generation are made.

Based on empirical analysis of local Cisco Packet Tracer installations (v7.3.0 and v8.2.2) and review of Cisco's official documentation:
1. **The `.pkt` file format is a proprietary, encrypted binary format.** It is not an open standard, nor is it plain XML or standard zip/zlib compression.
2. **There is no standalone public library or API provided by Cisco** to generate valid `.pkt` files from a web backend.
3. **Attempting to generate fake or malformed `.pkt` files causes Packet Tracer to reject them** with "Incompatible version" or crash.
4. **Viable, production-ready solution:** NetTopo AI will export **canonical topology JSON, high-resolution SVG/PNG diagrams, comprehensive PDF documentation, and exact Cisco IOS CLI configuration scripts (.cfg / .txt)** per device. For automated `.pkt` generation, a desktop IPC bridge using Packet Tracer's native PTMP (TCP port 39000) is scheduled as an experimental desktop integration.

---

## 2. Technical Investigation Findings

### 2.1 Binary Inspection of Native `.pkt` Files
Inspection of native Packet Tracer 8.2.2 `.pkt` files (e.g. `HotSwappablePower.pkt`) reveals:
- Magic bytes / header: High-entropy binary sequence (`59 bf f4 06 11 7b 86 a6...`).
- Decompression tests: Standard `zipfile` and raw `zlib` stream decoders at multiple offsets fail to decompress the file (`Error -3: incorrect header check`).
- Modern versions of Packet Tracer (v7.0+) utilize proprietary serialization with encryption and integrity signatures to prevent tamper and exam cheating in Cisco Networking Academy curricula.

### 2.2 Cisco Official IPC & Extension Architecture
Cisco Packet Tracer v7 and v8 include an official Inter-Process Communication (IPC) subsystem:
- **Protocol:** Packet Tracer Messaging Protocol (PTMP).
- **Transport:** TCP listening by default on port `39000` (incremented for additional instances).
- **External Applications (ExApps):** Supports `.pta` app manifests and `.pts` / `.pkp` scripts.
- **Limitation:** PTMP IPC requires an active, running instance of the Cisco Packet Tracer GUI application on the client system. It cannot be run as a headless web service on a remote Linux server without running Packet Tracer under a virtual display or Wine environment.

---

## 3. Risks & Compliance

| Risk | Impact | Mitigation in NetTopo AI |
|---|---|---|
| Malformed `.pkt` generated | PT error / student file corruption | **Strictly prohibited:** Never output pseudobinary or renamed files as `.pkt`. |
| Reverse engineering proprietary crypto | Legal and stability risks | Do not attempt brittle reverse engineering of proprietary Cisco binary formats. |
| Student workflow friction | Students need to build topology in PT | Provide device-by-device copy-paste CLI configurations and visual connection guides. |

---

## 4. NetTopo AI Export Strategy

### Phase 1 & 2 (MVP — Deterministic & Usable)
1. **Per-Device Cisco IOS Configuration Files (`.cfg` / `.txt`):**
   - Clean, ordered CLI commands ready for pasting into PT Console/CLI tab (`enable`, `configure terminal`, interface IPs, `no shutdown`, static routes).
2. **Visual Network Diagrams (`.svg` / `.png`):**
   - High-fidelity export of the React Flow canvas with clear interface labels (e.g. `Gig0/0`, `FastEthernet0/1`).
3. **IP Addressing Plan & VLSM Documentation (`.pdf` / `.json`):**
   - Complete table containing subnets, usable host ranges, gateway IPs, and subnet masks.
4. **All-in-One Download (`.zip`):**
   - Bundles diagrams, IP plans, and all device CLI configurations in one click.

### Phase 3 (Experimental Desktop Bridge)
- Develop an optional local desktop bridge utility (Python / Electron) that connects to the local Cisco Packet Tracer IPC port (`39000`) and uses PTMP commands to automate device placement and link wiring in the user's running Packet Tracer instance.

---

## 5. Conclusion

NetTopo AI maintains 100% technical integrity:
- **No false `.pkt` exports.**
- **Immediate, practical value for students** through error-free Cisco IOS configurations and structured diagrams.
- **Clear UI disclosure:** The Export Center will transparently state that `.pkt` direct binary export is experimental / requires the local PTMP bridge, while offering guaranteed, 1-click CLI & diagram downloads.
