import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function useTelemetry(projectId: string) {
  const [telemetry, setTelemetry] = useState<Record<string, any>>({});

  useEffect(() => {
    const interval = setInterval(async () => {
      // For now, poll recent telemetry for ALL devices
      // Optimization: filter by projectId eventually
      const recent = await fetch('http://localhost:4000/api/telemetry/recent').then(r => r.json());
      
      setTelemetry(prev => {
        const next = { ...prev };
        recent.forEach((item: any) => {
          next[`${item.deviceId}.${item.datastreamId}`] = item.value;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [projectId]);

  return telemetry;
}
