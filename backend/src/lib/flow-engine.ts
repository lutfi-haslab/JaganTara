import { db } from '../db';
import { flows, datastreams, telemetry } from '../db/schema';
import { eq } from 'drizzle-orm';

interface FlowEvent {
  deviceId: string;
  datastreamId: string;
  value: any;
  timestamp: Date;
}

export async function processFlows(event: FlowEvent) {
  // 1. Find the datastream details (to get the key)
  const ds = await db.query.datastreams.findFirst({
    where: eq(datastreams.id, event.datastreamId),
    with: {
        device: true
    }
  });

  if (!ds) return;

  // 2. Fetch all flows for this project
  const projectFlows = await db.query.flows.findMany({
    where: eq(flows.projectId, ds.device.projectId)
  });

  for (const flow of projectFlows) {
    const config = flow.config as any;
    // Simple logic: If flow has a node matched to this datastream, execute
    // This is a stub for a real graph execution engine
    const inputNode = config.nodes?.find((n: any) => 
        n.type === 'datastream_input' && n.datastreamId === event.datastreamId
    );

    if (inputNode) {
       console.log(`Executing flow "${flow.name}" triggered by ${ds.key}`);
       // TODO: Implement actual node traversal
    }
  }
}
