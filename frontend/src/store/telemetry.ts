import { useEffect, useRef, useState } from 'react'

const WS_URL = 'ws://localhost:4001';

export function useTelemetry(_projectId: string) {
  const [telemetry, setTelemetry] = useState<Record<string, string>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    function applyEvent(item: any) {
      setTelemetry(prev => ({
        ...prev,
        [`${item.deviceId}.${item.datastreamId}`]: String(item.value),
      }));
    }

    function connect() {
      if (!active) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'connected') {
            // Seed with buffered history
            msg.payload.buffered?.forEach(applyEvent);
          } else if (msg.type === 'telemetry') {
            applyEvent(msg.payload);
          }
        } catch {}
      };

      ws.onclose = () => {
        if (active) {
          reconnectRef.current = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      active = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [_projectId]);

  return telemetry;
}
