# Product Requirement Document (PRD): Planit

## 1. Executive Summary & Goals

Planit is a real-time, collaborative digital whiteboard application designed to let distributed teams brainstorm, map out workflows, and collaborate visually.

### Architectural Goals (The "Why" for your Portfolio)

* **Demonstrate Client-Side Performance:** Render and manipulate hundreds of complex visual elements smoothly at 60 FPS.
* **Showcase Real-Time Sync at Scale:** Handle multi-user synchronization with sub-100ms latency without server degradation.
* **Prove Modern System Design:** Architect a decoupled system separating volatile real-time traffic (mouse tracking) from persistent document state (shapes, text).

---

## 2. Core Feature Set (MVP Scope)

To make this an impressive yet executable portfolio project, the scope is focused on three foundational pillars:

### A. The Infinite Canvas (Frontend Mastery)

* **Pan & Zoom:** Smooth navigation across a mathematically infinite Cartesian coordinate plane via trackpad gestures or mouse wheel + click-drag.
* **Basic Shapes:** Users can create, resize, reposition, and delete Rectangles, Circles, and connecting Lines/Arrows between shapes.
* **Text Integration:** Double-clicking any shape enables inline text editing, which scales dynamically with the canvas zoom.
* **Performance Optimization:** Must use an HTML5 `<canvas>` or a highly optimized SVG rendering layer with spatial partitioning (virtualization) to ensure smooth performance under heavy loads.

### B. Real-Time Collaboration (Full-Stack / Network)

* **Live Multi-User Cursors:** Real-time visibility of all active users’ cursors with accompanying personalized name tags.
* **Conflict-Free Editing:** Concurrent edits to the same object are resolved gracefully on the client side without UI stutter, rollbacks, or application crashes.
* **Multi-Room Isolation:** Unique room routing (e.g., `/board/{board-uuid}`). Data and network events must be strictly isolated to that specific board context.

### C. Workspace & Persistence (Backend / Architecture)

* **Auto-Save Engine:** State-changing canvas events (creating/moving a shape) are saved asynchronously to the database.
* **Board Snapshotting:** Efficient loading of the canvas by fetching the latest state snapshot on initial page load, rather than replaying the entire history of actions.

---

## 3. System Architecture & Tech Stack

The architecture utilizes a decoupled system to isolate heavy real-time traffic from standard transactional operations.

              ┌────────────────────────────────────────┐
              │            Next.js Frontend            │
              └───────┬────────────────────────┬───────┘
                      │ (HTTP / Auth)          │ (WebSockets / CRDT)
                      ▼                        ▼
             ┌─────────────────┐      ┌─────────────────┐
             │  NestJS/Express │      │ WebSocket Room  │
             │   REST API      │      │     Server      │
             └────────┬────────┘      └────────┬────────┘
                      │                        │
                      ▼                        ▼
             ┌─────────────────┐      ┌─────────────────┐
             │ PostgreSQL / DB │      │   Redis Cache   │
             │ (State Storage) │      │(Ephemeral Cursors)
             └─────────────────┘      └─────────────────┘

### Recommended Tech Stack

* **Frontend:** React / Next.js with TypeScript.
  * *Canvas Engine:* Custom HTML5 2D Canvas Context OR a specialized vector/canvas library like `PixiJS` or `Fabric.js`.
  * *Sync Engine:* **Yjs** or **Automerge** (production-grade CRDT libraries for real-time state sync).
* **Backend REST API:** Node.js (NestJS or Express) with TypeScript. Handles user authentication, board metadata management, and board snapshot persistence.
* **Backend Real-Time Server:** Node.js running `y-websocket` or standard WebSockets (`ws`).
* **Databases:**
  * **PostgreSQL:** Stores persistent structures like users, workspace data, and the serialized binary/JSON snapshots of the shapes.
  * **Redis:** Handles ephemeral data (e.g., active session tracking) and broadcasts high-frequency cursor coordinates without hitting disk storage.

---

## 4. Key Engineering Challenges to Highlight

These are the core engineering hurdles that turn this project into a high-impact senior portfolio piece:

### Challenge 1: Viewport Coordinate Transformations

* **The Problem:** When a user zooms to 150% and pans 400px to the left, a mouse click at physical screen coordinate `(X: 200, Y: 300)` does not correspond to coordinate `(200, 300)` in the virtual drawing space.
* **The Solution:** Implementing screen-to-world space matrix math ($Viewport = Pan \times Zoom$). This demonstrates your capability to handle the geometric logic required to translate hardware inputs into a virtual plane.

### Challenge 2: Network Throttle & Ephemeral Scaling (Cursor Noise)

* **The Problem:** Emitting a WebSocket frame for every individual pixel of mouse movement from dozens of concurrent users will rapidly overwhelm network bandwidth and server process threads.
* **The Solution:** Throttling mouse coordinates on the client (e.g., max 1 event per 33ms/50ms) and keeping that high-frequency state separated from the main relational database by leveraging an in-memory Redis layer.

### Challenge 3: State Convergence (CRDTs)

* **The Problem:** If User A and User B modify the coordinates or text of the exact same square at the same time, traditional client-server paradigms can result in race conditions, UI flashing, or out-of-sync clients.
* **The Solution:** Utilizing a **CRDT (Conflict-free Replicated Data Type)** architecture. Instead of treating the server as an absolute gatekeeper that rejects delayed events, state mutations are treated as mathematically mergeable operations across all peers.

---

## 5. Phased Implementation Plan

To systematically build the system, development is broken down into four distinct phases:

* **Phase 1: Local-First Canvas Engine** * Build a standalone local frontend canvas.
  * Implement smooth panning, zooming, and drawing/manipulating basic shapes with no active network connectivity.
* **Phase 2: REST API & Persistence** * Build out the backend REST server and PostgreSQL database schema.
  * Implement user authentication, dashboard management, and the ability to manually save/load JSON canvas states.
* **Phase 3: Real-Time CRDT Integration** * Spin up the dedicated WebSocket server using `y-websocket`.
  * Integrate Yjs on the client to automatically synchronize shape states and canvas mutations across multiple open browser tabs.
* **Phase 4: Ephemeral Layer & Visual Polish** * Integrate Redis to track active room users and broadcast live cursor locations.
  * Add styling, UI components (menus, sidebars), and loading state feedback.
