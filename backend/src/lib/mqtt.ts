import { Aedes, PublishPacket, Client } from 'aedes';
import net from 'net';

import { db } from '../db';
import { datastreams, devices, telemetry } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { RingBuffer } from './ring-buffer';
import { processFlows } from './flow-engine';


export async function setupMqtt(port: number, eventBus: RingBuffer<any>) {
  const aedes = await Aedes.createBroker();
  const server = net.createServer(aedes.handle);


  aedes.on('publish', async (packet: PublishPacket, client: Client | null) => {

    if (!client) return;
    const topic = packet.topic;
    const payload = packet.payload.toString();

    // Standard topic for Jagantara: v1/{deviceId}/data
    const topicParts = topic.split('/');
    if (topicParts[0] === 'v1' && topicParts[2] === 'data') {
      const deviceId = topicParts[1];
      try {
        const data = JSON.parse(payload);
        
        // Find if device exists
        const device = await db.query.devices.findFirst({
           where: eq(devices.id, deviceId)
        });
        
        if (!device) return;

        // Iterate over keys in payload and update datastreams
        for (const [key, value] of Object.entries(data)) {
           // Find datastream by deviceId and key
           const ds = await db.query.datastreams.findFirst({
              where: and(eq(datastreams.deviceId, deviceId), eq(datastreams.key, key))
           });

           if (ds) {
               const item = {
                   deviceId,
                   datastreamId: ds.id,
                   value: String(value),
                   timestamp: new Date()
               };

               // 1. Push to Ring Buffer
               eventBus.push(item);
               
               // 2. Persist
               await db.insert(telemetry).values(item);

               // 3. Trigger flow engine
               processFlows(item);

               // 4. Update device online status

               await db.update(devices)
                 .set({ lastSeen: new Date(), status: 'online' })
                 .where(eq(devices.id, deviceId));
           }
        }
      } catch (e) {
        console.error('MQTT Parsing Error:', e);
      }
    }
  });

  server.listen(port, () => {
    console.log(`Jagantara MQTT Broker is running on port ${port}`);
  });
}
