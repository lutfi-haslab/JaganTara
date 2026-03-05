# Jagantara 🌌

**Unified IoT Application & Automation Platform**

Jagantara is a self-contained, high-performance IoT platform for seamless device connectivity, real-time telemetry, and premium dashboard visualization. Built on a single-node architecture — no Redis, no Kafka, no Docker required.

---

## 🚀 Key Features

- **⚡ High-Speed Ingestion** — In-memory ring buffer (event bus) for O(1) telemetry processing
- **📡 Multi-Protocol** — Built-in MQTT Broker (port 1883) + WebSocket (port 4001) + REST API
- **📊 Blynk-style Web Dashboard** — 12-column drag-and-drop, resizable widget grid powered by `react-grid-layout`
- **📱 Mobile App Builder** — Vertical block designer for app-like control panels
- **🎨 Widget Designer** — Slide-in panel to add / configure / remove widgets for both dashboards and mobile apps
- **🧩 Flow Engine** — Stub for graph-based automation (visual designer coming soon)
- **🔒 Project Isolation** — Secure multi-project environments within a single instance
- **📦 Zero-dependency infra** — Bun + Hono + SQLite (WAL) — single runtime, single binary

---

## 🛠️ Widget Types

| Widget            | Web | Mobile | Description                            |
| ----------------- | --- | ------ | -------------------------------------- |
| **Value Display** | ✅  | ✅     | Large numeric readout                  |
| **Gauge**         | ✅  | ✅     | SVG arc gauge                          |
| **Line Chart**    | ✅  | ✅     | Real-time sparkline with gradient fill |
| **Switch**        | ✅  | ✅     | Boolean toggle / command control       |
| **Header**        | —   | ✅     | Section label for mobile stacks        |
| **Spacer**        | —   | ✅     | Visual breathing room                  |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Jagantara Node                         │
│                                                            │
│  ┌──────────────────────┐   ┌─────────────────────────┐   │
│  │   Bun HTTP (4000)    │   │   Bun WS Server (4001)  │   │
│  │   Hono REST API      │──▶│   Broadcasts telemetry  │   │
│  └──────────────────────┘   └─────────────────────────┘   │
│          │                              │                   │
│  ┌───────▼──────────────────────────────▼──────────────┐   │
│  │              In-Memory Ring Buffer                   │   │
│  │              (Event Bus, 5000 cap)                   │   │
│  └───────────────────────┬────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────▼────────────────────────────┐    │
│  │         SQLite (WAL) — jagantara.db                 │    │
│  │  projects · devices · datastreams · telemetry       │    │
│  │  dashboards · flows                                 │    │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────┐                                  │
│  │  MQTT Broker (1883)  │  ← IoT devices connect here      │
│  │  (Aedes v1)          │                                  │
│  └──────────────────────┘                                  │
└────────────────────────────────────────────────────────────┘
           ▲ React + Vite frontend (5173)
```

**Tech Stack**

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Runtime            | Bun                      |
| API                | Hono + Zod               |
| ORM                | Drizzle + libsql         |
| Database           | SQLite (WAL)             |
| MQTT               | Aedes v1                 |
| Frontend framework | React 19 + Vite 8        |
| Routing            | TanStack Router          |
| Styling            | TailwindCSS v4           |
| Grid layouts       | react-grid-layout v1.4.4 |
| Icons              | lucide-react             |
| Animations         | framer-motion            |

---

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1

### Install

```bash
# Install deps for all packages
bun install

# Push database schema
cd backend && bun run db:push
```

### Run

```bash
# From root — starts both backend (4000) and frontend (5173)
bun dev
```

### Seed Demo Data

The seed script creates a full "Smart Building Monitor" demo project with 3 devices, 12 datastreams, and 2,400+ telemetry data points:

```bash
cd backend && bun run seed.ts
```

The URLs for the seeded dashboards are printed at the end of the seed output.

---

## 🌓 Dashboard Routes

| Route                   | Description                                 |
| ----------------------- | ------------------------------------------- |
| `/`                     | Landing page                                |
| `/projects`             | Project list                                |
| `/projects/:id`         | Project detail (devices, dashboards)        |
| `/dashboard/:id`        | Web dashboard — drag/resize widget grid     |
| `/dashboard/mobile/:id` | Mobile app dashboard — vertical block stack |

---

## 📡 Backend API

| Method   | Path                           | Description                               |
| -------- | ------------------------------ | ----------------------------------------- |
| `GET`    | `/api/projects`                | List all projects                         |
| `POST`   | `/api/projects`                | Create project                            |
| `GET`    | `/api/projects/:id`            | Get project                               |
| `GET`    | `/api/projects/:id/devices`    | List devices                              |
| `POST`   | `/api/projects/:id/devices`    | Create device                             |
| `GET`    | `/api/projects/:id/dashboards` | List dashboards                           |
| `POST`   | `/api/projects/:id/dashboards` | Create dashboard                          |
| `GET`    | `/api/dashboards/:id`          | Get dashboard config                      |
| `PUT`    | `/api/dashboards/:id`          | Update dashboard config                   |
| `DELETE` | `/api/dashboards/:id`          | Delete dashboard                          |
| `POST`   | `/api/telemetry`               | Ingest telemetry (also broadcasts via WS) |
| `POST`   | `/api/devices/:id/datastreams` | Create datastream                         |

**WebSocket** `ws://localhost:4001` — subscribe for real-time telemetry broadcasts.

---

## 📜 Development Status

Currently in **Phase 1 (MVP Active)**. Core ingestion, real-time broadcasting, Blynk-style dashboards, and mobile designer are all functional.

See [TASKS.md](./TASKS.md) for the full roadmap.

---

Built with 💜 by Antigravity AI · 2026-03-05
