# Jagantara Implementation Roadmap 🌌

This document tracks the engineering phases and feature status for the Jagantara IoT platform.

---

## 🛠️ Phase 0: Core Foundation (Done ✅)

- [x] Project scaffolding (Bun + Hono + React + Vite).
- [x] Mono-repo structure with shared packages.
- [x] Database schema with Drizzle ORM (Projects, Devices, Datastreams, Telemetry).
- [x] High-performance in-memory Ring Buffer (Event Bus).
- [x] SQL persistence for telemetry (WAL enabled).
- [x] TanStack Router integration (Frontend).

---

## 🏗️ Phase 1: MVP Core (In Progress 🚧)

### 1. Ingestion Layer

- [x] REST API telemetry endpoint.
- [x] Internal MQTT Broker (Aedes) for native connectivity.
- [ ] WebSocket real-time broadcaster (Frontend/Backend).
- [ ] Batched writes for telemetry storage.

### 2. Dashboard Systems

- [x] Web Dashboard viewer grid system.
- [x] Dashboard-specific widget types (Gauge, Switch, Value Display).
- [x] App-like Mobile Dashboard builder/runtime (Vertical blocks).
- [ ] Dynamic Widget Designer/Editor for both runtimes.
- [ ] Additional core widgets (Line Charts, Terminal, Sliders).

### 3. Flow Engine

- [x] Engine execution stub triggered by telemetry.
- [ ] Visual Flow designer UI.
- [ ] Functional input/transform/logic nodes.
- [ ] Notification and Webhook output support.

### 4. Identity & Access

- [x] Project-based isolation logic.
- [x] Basic dashboard sharing structure.
- [ ] Full Lucia Auth integration (JWT).
- [ ] Public viewer tokens for shared links.
- [ ] Role-based access control (Admin, Editor, Viewer).

---

## 🌌 Phase 2: Refinement

- [ ] Multi-page navigation for Mobile Apps.
- [ ] Advanced time-series aggregations (min/max/avg/sum).
- [ ] Version history for dashboards and flows.
- [ ] Native PWA manifest and offline caching.
- [ ] Custom CSS/HTML injection blocks for power users.

---

## 🚀 Post-MVP & Future

- [ ] Widget Plugin SDK for 3rd-party developers.
- [ ] Distributed clustering support (beyond single node).
- [ ] Project Export/Import as JSON.
- [ ] Mobile-native wrapper (Capacitor/React Native).

---

_Last Updated: 2026-03-05_
_Current Focus: WebSocket Broadcasting & Dashboard Designers._
