# Jagantara 🌌

**Unified IoT Application & Automation Platform**

Jagantara is a self-contained, high-performance IoT platform designed for seamless device connectivity, real-time data processing, and premium dashboard visualization. Built on a single-node architecture, it eliminates the need for complex infrastructure while providing professional-grade tools for engineers.

---

## 🚀 Key Features

- **⚡ High-Speed Ingestion**: In-memory ring buffer (event bus) for O(1) telemetry processing.
- **📡 Multi-Protocol Native Support**: Built-in MQTT Broker (port 1883), WebSocket, and REST API.
- **🛠️ Dual Dashboard System**:
  - **Web Dashboard**: High-density grid-based analytics for desktop monitoring.
  - **Mobile App Builder**: A dedicated no-code vertical block builder for app-like control experiences.
- **🧩 Embedded Flow Engine**: Visual graph-based automation engine for real-time logic and alerts.
- **🔒 Project-Based Isolation**: Secure environments for different IoT ecosystems within a single instance.
- **📦 Single Runtime**: Powered by **Bun**, **Hono**, and **SQLite (WAL)** — zero external dependencies.

---

## 🏗️ Architecture

- **Backend**: Bun + Hono + Drizzle ORM
- **Database**: SQLite (WAL mode) for time-series persistence
- **Frontend**: React + Vite + TanStack Router + TailwindCSS 4
- **Real-time**: Internal MQTT Broker + In-memory Ring Buffer

---

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)

### Installation

```bash
# Install dependencies for all packages
bun install

# Initialize Database
cd backend && bun run db:push
```

### Development

Start both backend and frontend servers:

```bash
bun dev
```

- **Web Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
- **MQTT Broker**: `1883`

---

## 🌓 Dashboard Runtimes

- **Web**: `http://localhost:5173/dashboard/:id`
- **Mobile App**: `http://localhost:5173/dashboard/mobile/:id`

---

## 📜 Development Status

Currently in **Phase 1 (MVP)**. Core ingestion, event distribution, and initial dashboard runtimes are implemented.

Built with 💜 by Antigravity AI.
