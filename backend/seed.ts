/**
 * Jagantara Seed Script
 * Creates a complete "Smart Building Monitor" demo with:
 * - 1 Project
 * - 3 Devices (HVAC, Energy Meter, Security Node)
 * - 12 Datastreams
 * - 1 Web Dashboard (9 widgets with full layout)
 * - 1 Mobile App Dashboard (10 blocks)
 * - 300 Telemetry points for rich chart history
 *
 * Run: bun run seed.ts
 */

import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './src/db/schema'
import { randomUUID } from 'crypto'

const client = createClient({ url: 'file:jagantara.db' })
const db = drizzle(client, { schema })

// ─── IDs ──────────────────────────────────────────────────────────────────────
const PROJECT_ID  = randomUUID()

const HVAC_ID     = randomUUID()
const ENERGY_ID   = randomUUID()
const SECURITY_ID = randomUUID()

// Datastream IDs
const DS_TEMP     = randomUUID()
const DS_HUMIDITY = randomUUID()
const DS_HVAC_PWR = randomUUID()  // boolean

const DS_KWH      = randomUUID()
const DS_VOLTAGE  = randomUUID()
const DS_CURRENT  = randomUUID()

const DS_MOTION   = randomUUID()
const DS_CO2      = randomUUID()
const DS_DOOR     = randomUUID()

// Extra datastreams
const DS_SETPOINT = randomUUID()
const DS_PM25     = randomUUID()
const DS_LUMENS   = randomUUID()

const WEB_DASH_ID    = randomUUID()
const MOBILE_DASH_ID = randomUUID()

const now = new Date()

// ─── Helpers ──────────────────────────────────────────────────────────────────
function jitter(base: number, range: number) {
  return +(base + (Math.random() - 0.5) * 2 * range).toFixed(2)
}

function timeAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60_000)
}

// ─── 1. Project ───────────────────────────────────────────────────────────────
await db.insert(schema.projects).values({
  id: PROJECT_ID,
  name: 'Smart Building Monitor',
  description: 'HVAC, energy, and security telemetry for Office Block A',
  createdAt: timeAgo(2880),
  updatedAt: now,
})

console.log('✓ Project inserted')

// ─── 2. Devices ───────────────────────────────────────────────────────────────
await db.insert(schema.devices).values([
  {
    id: HVAC_ID,
    projectId: PROJECT_ID,
    name: 'HVAC Unit — Floor 3',
    type: 'thermostat',
    status: 'online',
    lastSeen: now,
  },
  {
    id: ENERGY_ID,
    projectId: PROJECT_ID,
    name: 'Energy Meter — Main Panel',
    type: 'energy_meter',
    status: 'online',
    lastSeen: now,
  },
  {
    id: SECURITY_ID,
    projectId: PROJECT_ID,
    name: 'Security Node — Lobby',
    type: 'sensor_hub',
    status: 'online',
    lastSeen: now,
  },
])

console.log('✓ Devices inserted')

// ─── 3. Datastreams ───────────────────────────────────────────────────────────
await db.insert(schema.datastreams).values([
  // HVAC
  { id: DS_TEMP,     deviceId: HVAC_ID, key: 'temperature', type: 'number', mode: 'telemetry' },
  { id: DS_HUMIDITY, deviceId: HVAC_ID, key: 'humidity',    type: 'number', mode: 'telemetry' },
  { id: DS_HVAC_PWR, deviceId: HVAC_ID, key: 'power',       type: 'boolean', mode: 'hybrid' },
  { id: DS_SETPOINT, deviceId: HVAC_ID, key: 'setpoint',    type: 'number', mode: 'hybrid' },

  // Energy Meter
  { id: DS_KWH,     deviceId: ENERGY_ID, key: 'kwh',     type: 'number', mode: 'telemetry' },
  { id: DS_VOLTAGE, deviceId: ENERGY_ID, key: 'voltage',  type: 'number', mode: 'telemetry' },
  { id: DS_CURRENT, deviceId: ENERGY_ID, key: 'current',  type: 'number', mode: 'telemetry' },

  // Security
  { id: DS_MOTION,  deviceId: SECURITY_ID, key: 'motion',  type: 'boolean', mode: 'telemetry' },
  { id: DS_CO2,     deviceId: SECURITY_ID, key: 'co2',     type: 'number',  mode: 'telemetry' },
  { id: DS_DOOR,    deviceId: SECURITY_ID, key: 'door',    type: 'boolean', mode: 'hybrid' },
  { id: DS_PM25,    deviceId: SECURITY_ID, key: 'pm2_5',   type: 'number',  mode: 'telemetry' },
  { id: DS_LUMENS,  deviceId: SECURITY_ID, key: 'lux',     type: 'number',  mode: 'telemetry' },
])

console.log('✓ Datastreams inserted')

// ─── 4. Telemetry history (300 points / stream) ───────────────────────────────
const telemetryRows: typeof schema.telemetry.$inferInsert[] = []

const streams = [
  { deviceId: HVAC_ID,     datastreamId: DS_TEMP,     base: 23.5, range: 3.0 },
  { deviceId: HVAC_ID,     datastreamId: DS_HUMIDITY, base: 54,   range: 12 },
  { deviceId: ENERGY_ID,   datastreamId: DS_KWH,      base: 142,  range: 30 },
  { deviceId: ENERGY_ID,   datastreamId: DS_VOLTAGE,  base: 220,  range: 8 },
  { deviceId: ENERGY_ID,   datastreamId: DS_CURRENT,  base: 12.4, range: 4 },
  { deviceId: SECURITY_ID, datastreamId: DS_CO2,      base: 680,  range: 180 },
  { deviceId: SECURITY_ID, datastreamId: DS_PM25,     base: 14,   range: 8 },
  { deviceId: SECURITY_ID, datastreamId: DS_LUMENS,   base: 480,  range: 200 },
]

for (const s of streams) {
  for (let i = 300; i >= 0; i--) {
    telemetryRows.push({
      deviceId: s.deviceId,
      datastreamId: s.datastreamId,
      value: String(jitter(s.base, s.range)),
      timestamp: timeAgo(i * 2), // 2-min intervals → 10h of history
    })
  }
}

// Boolean streams — a few state changes
const boolStreams = [
  { deviceId: HVAC_ID,     datastreamId: DS_HVAC_PWR, value: 'true' },
  { deviceId: SECURITY_ID, datastreamId: DS_MOTION,   value: 'false' },
  { deviceId: SECURITY_ID, datastreamId: DS_DOOR,     value: 'false' },
]
for (const b of boolStreams) {
  telemetryRows.push({ ...b, timestamp: now })
}

// Insert in chunks of 200 to avoid SQLite max-vars limit
for (let i = 0; i < telemetryRows.length; i += 200) {
  await db.insert(schema.telemetry).values(telemetryRows.slice(i, i + 200))
}

console.log(`✓ ${telemetryRows.length} telemetry rows inserted`)

// ─── 5. Web Dashboard ─────────────────────────────────────────────────────────
const webWidgets = [
  // Row 0 — summary values across top
  { id: randomUUID(), type: 'value',  label: 'Temperature',  datastream: `${HVAC_ID}.${DS_TEMP}`,     unit: '°C',  x: 0, y: 0, w: 2, h: 2, color: '#f97316', min: 15, max: 40 },
  { id: randomUUID(), type: 'value',  label: 'Humidity',     datastream: `${HVAC_ID}.${DS_HUMIDITY}`, unit: '%',   x: 2, y: 0, w: 2, h: 2, color: '#38bdf8', min: 0,  max: 100 },
  { id: randomUUID(), type: 'value',  label: 'CO₂',          datastream: `${SECURITY_ID}.${DS_CO2}`,  unit: 'ppm', x: 4, y: 0, w: 2, h: 2, color: '#a3e635', min: 400, max: 2000 },
  { id: randomUUID(), type: 'value',  label: 'Energy Today', datastream: `${ENERGY_ID}.${DS_KWH}`,    unit: 'kWh', x: 6, y: 0, w: 2, h: 2, color: '#facc15', min: 0,  max: 500 },
  // HVAC power switch — right side
  { id: randomUUID(), type: 'switch', label: 'HVAC Power',   datastream: `${HVAC_ID}.${DS_HVAC_PWR}`,                x: 8, y: 0, w: 2, h: 2 },
  // Door switch
  { id: randomUUID(), type: 'switch', label: 'Door Lock',    datastream: `${SECURITY_ID}.${DS_DOOR}`,                x: 10, y: 0, w: 2, h: 2 },

  // Row 2 — Large temperature chart
  { id: randomUUID(), type: 'chart',  label: 'Temperature Trend',  datastream: `${HVAC_ID}.${DS_TEMP}`,     unit: '°C',  color: '#f97316', x: 0, y: 2, w: 6, h: 3, min: 15, max: 40 },
  // Row 2 — Energy chart beside it
  { id: randomUUID(), type: 'chart',  label: 'Energy Consumption', datastream: `${ENERGY_ID}.${DS_KWH}`,    unit: 'kWh', color: '#facc15', x: 6, y: 2, w: 6, h: 3, min: 0,  max: 500 },

  // Row 5 — Gauges
  { id: randomUUID(), type: 'gauge',  label: 'Humidity',  datastream: `${HVAC_ID}.${DS_HUMIDITY}`, unit: '%',   x: 0, y: 5, w: 3, h: 3, min: 0, max: 100 },
  { id: randomUUID(), type: 'gauge',  label: 'Voltage',   datastream: `${ENERGY_ID}.${DS_VOLTAGE}`,unit: 'V',   x: 3, y: 5, w: 3, h: 3, min: 190, max: 250 },
  { id: randomUUID(), type: 'gauge',  label: 'CO₂',       datastream: `${SECURITY_ID}.${DS_CO2}`,  unit: 'ppm', x: 6, y: 5, w: 3, h: 3, min: 400, max: 2000 },
  // PM2.5 chart
  { id: randomUUID(), type: 'chart',  label: 'PM2.5 Air Quality', datastream: `${SECURITY_ID}.${DS_PM25}`,  unit: 'µg/m³', color: '#c084fc', x: 9, y: 5, w: 3, h: 3, min: 0, max: 50 },
]

await db.insert(schema.dashboards).values({
  id: WEB_DASH_ID,
  projectId: PROJECT_ID,
  name: 'Building Overview',
  type: 'web',
  isPublic: false,
  config: JSON.stringify({ widgets: webWidgets }),
})

console.log('✓ Web dashboard inserted')

// ─── 6. Mobile Dashboard ──────────────────────────────────────────────────────
const mobileBlocks = [
  { id: randomUUID(), type: 'header', text: '🌡️  Climate' },
  { id: randomUUID(), type: 'value',  label: 'Temperature', datastream: `${HVAC_ID}.${DS_TEMP}`,     unit: '°C' },
  { id: randomUUID(), type: 'gauge',  label: 'Humidity',    datastream: `${HVAC_ID}.${DS_HUMIDITY}`, unit: '%' },
  { id: randomUUID(), type: 'switch', label: 'HVAC Power',  datastream: `${HVAC_ID}.${DS_HVAC_PWR}` },
  { id: randomUUID(), type: 'chart',  label: 'Temp Trend',  datastream: `${HVAC_ID}.${DS_TEMP}`,     unit: '°C', color: '#f97316' },

  { id: randomUUID(), type: 'spacer', height: 8 },
  { id: randomUUID(), type: 'header', text: '⚡  Energy' },
  { id: randomUUID(), type: 'value',  label: 'kWh Today',   datastream: `${ENERGY_ID}.${DS_KWH}`,    unit: 'kWh' },
  { id: randomUUID(), type: 'chart',  label: 'Consumption', datastream: `${ENERGY_ID}.${DS_KWH}`,    unit: 'kWh', color: '#facc15' },

  { id: randomUUID(), type: 'spacer', height: 8 },
  { id: randomUUID(), type: 'header', text: '🔒  Security' },
  { id: randomUUID(), type: 'value',  label: 'CO₂ Level',   datastream: `${SECURITY_ID}.${DS_CO2}`,  unit: 'ppm' },
  { id: randomUUID(), type: 'switch', label: 'Door Lock',   datastream: `${SECURITY_ID}.${DS_DOOR}` },
  { id: randomUUID(), type: 'gauge',  label: 'PM2.5',       datastream: `${SECURITY_ID}.${DS_PM25}`, unit: 'µg/m³' },
]

await db.insert(schema.dashboards).values({
  id: MOBILE_DASH_ID,
  projectId: PROJECT_ID,
  name: 'Building Monitor App',
  type: 'mobile_app',
  isPublic: false,
  config: JSON.stringify({ blocks: mobileBlocks }),
})

console.log('✓ Mobile dashboard inserted')

// ─── Done ─────────────────────────────────────────────────────────────────────
console.log('\n🚀 Seed complete!')
console.log(`\nProject ID : ${PROJECT_ID}`)
console.log(`Web Dash   : http://localhost:5173/dashboard/${WEB_DASH_ID}`)
console.log(`Mobile App : http://localhost:5173/dashboard/mobile/${MOBILE_DASH_ID}`)
