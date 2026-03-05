Understood. We rebuild the PRD properly — with **dual dashboard architecture (Web + Mobile App Builder)** as first-class citizens.

Below is the revised and structured PRD for **Jagantara**.

---

# PRODUCT REQUIREMENTS DOCUMENT

# Jagantara – Unified IoT Application & Automation Platform

---

# 1. Product Vision

Jagantara is a self-contained IoT platform that enables teams to:

- Connect devices (MQTT, WebSocket, REST)
- Process and transform telemetry using an internal flow engine
- Store time-series data in SQLite
- Build web dashboards for monitoring
- Build app-like mobile dashboards via no-code builder
- Create automations and alerts
- Share viewer links securely

All running on a single-node architecture without Redis, Kafka, or external services.

---

# 2. Product Goals

## Primary Goals

1. Single runtime deployment (Bun + SQLite)
2. Project-based isolation
3. Internal flow engine (Node-RED-like but controlled)
4. Two independent dashboard systems:
   - Web Analytics Dashboard
   - Mobile App Dashboard Builder

5. Real-time telemetry and device control
6. Shareable viewer links
7. Theme and branding customization

## Non-Goals (MVP)

- Multi-tenant SaaS
- Distributed clustering
- Native mobile apps
- Marketplace ecosystem

---

# 3. Core Architecture

## Stack

Backend:

- Bun
- Hono
- SQLite (WAL mode)
- In-memory ring buffer (custom event bus)

Frontend:

- React
- Vite
- TailwindCSS

Connectivity:

- MQTT
- WebSocket
- REST API

---

## Logical Flow

Devices
→ Ingestion Layer
→ Ring Buffer (Event Bus)
→
 • Storage Worker (SQLite)
 • Flow Engine
 • WebSocket Broadcaster
→
Web Dashboard Runtime
Mobile Dashboard Runtime

Single-node execution.

---

# 4. Project Model

Jagantara uses project-based isolation.

Structure:

Project
├── Devices
├── Datastreams
├── Web Dashboards
├── Mobile Dashboards
├── Flows
├── Rules
└── Users (Admin / Editor / Viewer)

No tenant layer.

---

# 5. Device & Telemetry Layer

## Device Model

Device:

- id
- projectId
- name
- type
- lastSeen
- status

Datastream:

- id
- deviceId
- key
- type (number | boolean | string)
- mode (telemetry | command | hybrid)

---

## Telemetry Storage

SQLite (WAL enabled)

Telemetry table:

- device_id
- datastream_id
- value
- timestamp

Requirements:

- Batched writes
- Indexed queries
- Aggregation support (min/max/avg/sum)
- Range filtering

Target:

- 5,000 events/sec ingestion (single node)

---

# 6. Internal Event Bus

Custom ring buffer:

- Fixed capacity
- O(1) enqueue/dequeue
- Overwrites oldest when full
- Used only for in-memory event distribution

Feeds:

- Storage worker
- Flow engine
- WebSocket broadcaster

Not used for persistence.

---

# 7. Flow Engine (Jagantara Flow)

Purpose:
Internal visual automation engine.

## Characteristics

- Graph-based execution
- Deterministic runtime
- Project-scoped
- No arbitrary JavaScript execution

## Node Categories

Input:

- datastream_input
- timer

Logic:

- condition
- switch
- transform
- delay
- throttle
- rolling_avg

Output:

- write_datastream
- send_notification
- webhook
- emit_event

Flows stored as JSON in SQLite.

---

# 8. Dashboard Systems

Jagantara has two independent dashboard systems.

---

# 8.1 Web Dashboard

Route: `/dashboard/:id`

Purpose:
Analytics & monitoring.

## Characteristics

- Grid-based layout
- Data-dense
- Multi-column support
- Table & log heavy
- Chart-focused
- Terminal view
- Device admin tools

## Web Widget Categories

- Gauge
- Radial Gauge
- Line Chart
- Bar Chart
- Table
- Terminal
- Value Display
- Switch
- Button
- Status Indicator

Layout:
Grid layout system with column span & row span.

---

# 8.2 Mobile Dashboard (App Builder)

Route: `/dashboard/mobile/:id`

Purpose:
App-like IoT control experience.

This is NOT responsive mode.

This is a separate builder and runtime.

---

## Mobile Dashboard Core Requirements

### A. App-like UX

- Full-screen layouts
- Vertical stacked blocks
- Card-based sections
- Drawer navigation
- Bottom navigation
- Tabs
- Nested pages
- Swipe navigation
- Smooth transitions

---

### B. Theme & Branding

- Light/Dark mode toggle
- Custom primary/secondary colors
- Custom fonts
- Logo injection
- Custom splash configuration
- Card radius control
- Shadow presets

Theme stored in dashboard JSON.

---

### C. Block-Based Layout Engine

Instead of grid.

Supports:

- Stack
- Section
- Card
- Spacer
- Full-width block
- Collapsible section

Example schema:

```json
{
  "type": "mobile_app",
  "theme": { "mode": "dark" },
  "pages": [
    {
      "id": "home",
      "layout": "stack",
      "blocks": [
        { "type": "gauge", "datastreamId": "temp_1" },
        { "type": "switch", "datastreamId": "relay_1" }
      ]
    }
  ]
}
```

---

### D. Widget Categories (Mobile)

Header:

- Connection Status
- Last Reported
- Battery Level
- Image

Controllers:

- Button
- Styled Button
- Icon Button
- Slider
- Switch
- RGB Control
- Joystick

Displays:

- Gauge
- Radial Gauge
- Value Display
- Chart
- LED
- Terminal
- Image Animation

Interface:

- Tabs
- Menu
- Text
- Input
- Spacer

Other:

- WebPage Button
- Alias Name
- Custom HTML Block

---

### E. Customization Capabilities

Mobile dashboard supports:

- Custom CSS injection (scoped to project)
- Custom HTML block widget
- Inline style override per widget
- Visibility rules
- Conditional styling
- Role-based visibility

---

### F. Shareable Viewer Mode

Support:

- Public viewer link
- Token-based access
- Read-only mode
- Expirable links
- Mobile-first share mode

Example:
`/dashboard/mobile/:id?token=xyz`

---

# 9. Widget SDK Architecture

Each widget must define:

- Metadata
- Property schema
- Datastream binding schema
- Rendering component
- Event hooks
- Theme token support

Widgets must be:

- Stateless by default
- Efficiently memoized
- Subscribed only to required streams

---

# 10. Authentication & Authorization

Roles per project:

- Admin
- Editor
- Viewer

Permissions:

Admin:

- Full access

Editor:

- Edit dashboards & flows

Viewer:

- Read-only dashboards

JWT-based authentication.

Viewer token system for shared dashboards.

---

# 11. Performance Requirements

Ingestion:

- ≤ 5ms average processing per event

Dashboard latency:

- ≤ 200ms real-time update

Flow execution:

- ≤ 10ms average

WebSocket:

- Efficient diff-based broadcasting

---

# 12. MVP Scope (Phase 1 – 4 Months)

Included:

- Project management
- MQTT + REST ingestion
- Telemetry storage
- Ring buffer event system
- Basic flow engine
- Web dashboard builder
- Mobile dashboard builder (single-page)
- 8–10 core widgets
- Theme system
- Viewer link sharing

Excluded:

- Nested mobile navigation
- Plugin marketplace
- App versioning
- Native wrapper
- Advanced aggregations

---

# 13. Future Expansion

Phase 2:

- Nested mobile pages
- Drawer navigation
- Advanced alert center
- Version history
- Role-level widget permissions

Phase 3:

- Widget plugin SDK
- Edge deployment mode
- Offline mobile PWA caching
- Export/import projects

---

# 14. Differentiation

Jagantara differentiates by:

- Single-node deployability
- No external infra
- Dual dashboard architecture
- Embedded flow engine
- App-like mobile builder
- Project-based simplicity
- Cultural brand identity

---
