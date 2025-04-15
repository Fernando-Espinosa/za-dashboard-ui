// hooks/useEchoWebSocket.ts
import { useEffect, useRef } from 'react';

export type RealTimeVitals = {
  name: string;
  heartRate: number;
  bloodPressure: string;
  oxygenLevel: number;
};

export const useEchoWebSocket = (
  patients: string[],
  onVitalsUpdate: (vitals: RealTimeVitals) => void,
  intervalMs: number = 3000
) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('wss://ws.postman-echo.com/raw');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected');

      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * patients.length);
        const name = patients[randomIndex];

        const vitals: RealTimeVitals = {
          name,
          heartRate: Math.floor(Math.random() * (130 - 60) + 60),
          bloodPressure: `${Math.floor(Math.random() * 40 + 90)}/${Math.floor(
            Math.random() * 20 + 60
          )}`,
          oxygenLevel: Math.floor(Math.random() * (100 - 85) + 85),
        };

        socket.send(JSON.stringify(vitals));
      }, intervalMs);

      socket.onclose = () => clearInterval(interval);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onVitalsUpdate(data);
      } catch {
        // skip non-JSON
      }
    };

    socket.onerror = (err) => console.error('[WebSocket] Error', err);

    return () => {
      socketRef.current?.close();
    };
  }, [patients, onVitalsUpdate, intervalMs]);
};
