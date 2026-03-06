import { expect, test, describe } from "bun:test";
import { RingBuffer } from "../backend/src/lib/ring-buffer";
import { db } from "../backend/src/db";
import { projects, devices, datastreams } from "../backend/src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

describe("Phase 0: Core Foundation", () => {
  describe("RingBuffer", () => {
    test("should initialize with correct size", () => {
      const rb = new RingBuffer(10);
      expect(rb.getAll()).toEqual([]);
    });

    test("should push and retrieve items", () => {
      const rb = new RingBuffer<number>(3);
      rb.push(1);
      rb.push(2);
      expect(rb.getAll()).toEqual([1, 2]);
    });

    test("should handle overflow correctly (FIFO)", () => {
      const rb = new RingBuffer<number>(3);
      rb.push(1);
      rb.push(2);
      rb.push(3);
      rb.push(4); // Overwrites 1
      expect(rb.getAll()).toEqual([2, 3, 4]);
    });

    test("getRecent should return limited items", () => {
      const rb = new RingBuffer<number>(5);
      [1, 2, 3, 4, 5].forEach((n) => rb.push(n));
      expect(rb.getRecent(2)).toEqual([4, 5]);
      expect(rb.getRecent(10)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("Database Schema & Connection", () => {
    test("should be able to insert and query a project", async () => {
      const id = randomUUID();
      const testProject = {
        id,
        name: "Test Project Phase 0",
        description: "Testing DB connection",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(projects).values(testProject);

      const result = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test Project Phase 0");

      // Cleanup
      await db.delete(projects).where(eq(projects.id, id));
    });
  });
});
