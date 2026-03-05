import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { db } from './db'
import { projects, devices, datastreams, telemetry, dashboards, flows } from './db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { RingBuffer } from './lib/ring-buffer'
import { randomUUID } from 'crypto'
import { setupMqtt } from './lib/mqtt'
import { processFlows } from './lib/flow-engine'

// Connected WebSocket clients for real-time broadcasting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wsClients = new Set<any>();

function broadcastTelemetry(data: object) {
  const msg = JSON.stringify({ type: 'telemetry', payload: data });
  wsClients.forEach(client => {
    try { client.send(msg); } catch {}
  });
}

const app = new Hono()


// In-memory event bus (custom ring buffer)
const eventBus = new RingBuffer<{
  deviceId: string;
  datastreamId: string;
  value: string;
  timestamp: Date;
}>(5000);

// Setup MQTT Broker on port 1883
await setupMqtt(1883, eventBus);



// Middlewares
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Routes
app.get('/', (c) => c.json({ status: 'ok', message: 'Jagantara API running' }))

// Projects
app.get('/api/projects', async (c) => {
  const allProjects = await db.select().from(projects);
  return c.json(allProjects);
})

app.post('/api/projects', 
  zValidator('json', z.object({
    name: z.string().min(1),
    description: z.string().optional()
  })),
  async (c) => {
    const body = c.req.valid('json');
    const id = randomUUID();
    const newProject = {
      id,
      name: body.name,
      description: body.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(projects).values(newProject);
    return c.json(newProject);
  }
)

app.get('/api/projects/:id', async (c) => {
  const id = c.req.param('id');
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      devices: true,
      dashboards: true,
      flows: true
    }
  });
  if (!project) return c.json({ error: 'Project not found' }, 404);
  return c.json(project);
})

// Devices & Datastreams
app.get('/api/projects/:id/devices', async (c) => {
  const projectId = c.req.param('id');
  const allDevices = await db.query.devices.findMany({
    where: eq(devices.projectId, projectId),
    with: {
      datastreams: true
    }
  });
  return c.json(allDevices);
})

app.post('/api/projects/:id/devices',
  zValidator('json', z.object({
    name: z.string().min(1),
    type: z.string()
  })),
  async (c) => {
    const projectId = c.req.param('id');
    const body = c.req.valid('json');
    const id = randomUUID();
    const newDevice = {
      id,
      projectId,
      name: body.name,
      type: body.type,
      status: 'offline' as const,
    };
    await db.insert(devices).values(newDevice);
    return c.json(newDevice);
  }
)

// Datastreams
app.post('/api/devices/:id/datastreams',
  zValidator('json', z.object({
    key: z.string().min(1),
    type: z.enum(['number', 'boolean', 'string']),
    mode: z.enum(['telemetry', 'command', 'hybrid']).default('telemetry')
  })),
  async (c) => {
    const deviceId = c.req.param('id');
    const body = c.req.valid('json');
    const id = randomUUID();
    const newDatastream = {
      id,
      deviceId,
      ...body
    };
    await db.insert(datastreams).values(newDatastream);
    return c.json(newDatastream);
  }
)

// Telemetry ingestion
app.post('/api/telemetry', 
  zValidator('json', z.object({
    deviceId: z.string(),
    datastreamId: z.string(),
    value: z.string()
  })),
  async (c) => {
    const item = c.req.valid('json');
    const data = {
      ...item,
      timestamp: new Date()
    };
    
    // 1. Push to Ring Buffer
    eventBus.push(data);
    
    // 2. Persist in background (Batched writes to be implemented in worker)
    // For now, write immediately to SQLite
    await db.insert(telemetry).values(data);
    
    // 3. Broadcast to WebSocket clients in real-time
    broadcastTelemetry(data);

    // Trigger flow engine
    processFlows(data);

    
    // 3. Update device status
    await db.update(devices)
      .set({ lastSeen: new Date(), status: 'online' })
      .where(eq(devices.id, item.deviceId));

    return c.json({ success: true, timestamp: data.timestamp });
  }
)

// Real-time telemetry feed (polled for now, should be WebSocket)
app.get('/api/telemetry/recent', (c) => {
  return c.json(eventBus.getRecent(50));
})

// Dashboards
app.get('/api/dashboards/:id', async (c) => {
  const id = c.req.param('id');
  const token = c.req.query('token');
  
  const dash = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, id)
  });
  
  if (!dash) return c.json({ error: 'Dashboard not found' }, 404);
  
  if (!dash.isPublic && !token) {
    // In a real app we'd check session here
    return c.json(dash);
  }
  
  if (dash.isPublic || (dash.publicToken && dash.publicToken === token)) {
    return c.json(dash);
  }
  
  return c.json({ error: 'Unauthorized' }, 401);
})

app.put('/api/dashboards/:id',
  zValidator('json', z.object({
    name: z.string().min(1).optional(),
    config: z.any(),
    isPublic: z.boolean().optional()
  })),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const dash = await db.query.dashboards.findFirst({ where: eq(dashboards.id, id) });
    if (!dash) return c.json({ error: 'Dashboard not found' }, 404);
    const updated: any = {};
    if (body.name !== undefined) updated.name = body.name;
    if (body.config !== undefined) updated.config = body.config;
    if (body.isPublic !== undefined) updated.isPublic = body.isPublic;
    await db.update(dashboards).set(updated).where(eq(dashboards.id, id));
    return c.json({ success: true });
  }
)

app.delete('/api/dashboards/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(dashboards).where(eq(dashboards.id, id));
  return c.json({ success: true });
})


app.get('/api/projects/:id/dashboards', async (c) => {

  const projectId = c.req.param('id');
  const res = await db.select().from(dashboards).where(eq(dashboards.projectId, projectId));
  return c.json(res);
})

app.post('/api/projects/:id/dashboards',
  zValidator('json', z.object({
    name: z.string().min(1),
    type: z.enum(['web', 'mobile_app']),
    config: z.any()
  })),
  async (c) => {
    const projectId = c.req.param('id');
    const body = c.req.valid('json');
    const id = randomUUID();
    const newDashboard = {
      id,
      projectId,
      name: body.name,
      type: body.type,
      config: body.config,
      isPublic: false
    };
    await db.insert(dashboards).values(newDashboard);
    return c.json(newDashboard);
  }
)

const port = process.env.PORT || 4000
console.log(`Jagantara API is running on http://localhost:${port}`)
console.log(`Jagantara WS  is broadcasting on ws://localhost:4001`)

// Native Bun WebSocket server for real-time telemetry broadcasting
// @ts-ignore – Bun.serve is a Bun global; types available at runtime
Bun.serve({
  port: 4001,
  websocket: {
    // @ts-ignore
    open(ws: any) {
      wsClients.add(ws);
      ws.send(JSON.stringify({ type: 'connected', payload: { buffered: eventBus.getRecent(50) } }));
    },
    // @ts-ignore
    close(ws: any) {
      wsClients.delete(ws);
    },
    message() {},
  },
  // @ts-ignore
  fetch(req: any, server: any) {
    if (server.upgrade(req)) return;
    return new Response('WebSocket only', { status: 426 });
  },
});

export default {
  port,
  fetch: app.fetch,
}
