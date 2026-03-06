import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import app from "../backend/src/index";
import { db } from "../backend/src/db";
import {
  projects,
  devices,
  datastreams,
  telemetry,
  dashboards,
} from "../backend/src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

describe("Phase 1: MVP Core", () => {
  let projectId: string;
  let deviceId: string;
  let datastreamId: string;

  beforeAll(async () => {
    // Setup test data
    projectId = randomUUID();
    deviceId = randomUUID();
    datastreamId = randomUUID();

    await db.insert(projects).values({
      id: projectId,
      name: "Phase 1 Test Project",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(devices).values({
      id: deviceId,
      projectId: projectId,
      name: "Test Device",
      type: "sensor",
      status: "offline",
    });

    await db.insert(datastreams).values({
      id: datastreamId,
      deviceId: deviceId,
      key: "temp",
      type: "number",
      mode: "telemetry",
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(telemetry).where(eq(telemetry.deviceId, deviceId));
    await db.delete(dashboards).where(eq(dashboards.projectId, projectId));
    await db.delete(datastreams).where(eq(datastreams.deviceId, deviceId));
    await db.delete(devices).where(eq(devices.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));
  });

  describe("Ingestion API", () => {
    test("POST /api/telemetry should ingest data", async () => {
      const res = await app.fetch(
        new Request("http://localhost/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            datastreamId,
            value: "25.5",
          }),
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      // Verify persistence
      const saved = await db.query.telemetry.findFirst({
        where: eq(telemetry.deviceId, deviceId),
      });
      expect(saved?.value).toBe("25.5");

      // Verify device status update
      const device = await db.query.devices.findFirst({
        where: eq(devices.id, deviceId),
      });
      expect(device?.status).toBe("online");
    });
  });

  describe("Dashboard API", () => {
    let dashId: string;

    test("POST /api/projects/:id/dashboards should create dashboard", async () => {
      const res = await app.fetch(
        new Request(`http://localhost/api/projects/${projectId}/dashboards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Web Dashboard",
            type: "web",
            config: { widgets: [] },
          }),
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      dashId = body.id;
      expect(body.name).toBe("Test Web Dashboard");
    });

    test("PUT /api/dashboards/:id should update config", async () => {
      const res = await app.fetch(
        new Request(`http://localhost/api/dashboards/${dashId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: { widgets: [{ type: "gauge", id: "w1" }] },
          }),
        }),
      );

      expect(res.status).toBe(200);

      const dash = await db.query.dashboards.findFirst({
        where: eq(dashboards.id, dashId),
      });
      expect(dash?.config).toEqual({ widgets: [{ type: "gauge", id: "w1" }] });
    });
  });
});
