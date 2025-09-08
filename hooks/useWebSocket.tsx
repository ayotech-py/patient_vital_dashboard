// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface Aggregate {
  id: number;
  start_time: string;
  end_time: string;
  patient: {
    id: number;
    name: string;
  };
  avg_heart_rate?: number;
  avg_spo2?: number;
  avg_temperature?: number;
  avg_accel_x?: number;
  avg_accel_y?: number;
  avg_accel_z?: number;
  risk_level: "Low" | "Moderate" | "High";
  confidence?: number;
  summary: string;
  created_at: string;
}

interface AggregateTableProps {
  aggregates: Aggregate[];
}

interface VitalsData {
  timestamp: string;
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
  ecg?: number;
  accel_x?: number;
  accel_y?: number;
  accel_z?: number;
  risk_level?: "Low" | "Moderate" | "High" | "N/A";
  confidence?: number;
  summary?: string;
  motion_status?: string;
  aggregates?: Aggregate[];
  hr_data: [number];
  spo2_data: [number];
  ecg_data: [number];
}

interface WebSocketMessage {
  type: string;  // e.g., 'vitals_update', 'connection_established'
  data?: VitalsData;
  message?: string;
}

const useWebSocket = (patientId: string | null) => {
  const [latestVitals, setLatestVitals] = useState<VitalsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    if (!patientId) return;

    // Construct WebSocket URL (replace with your backend base URL)
    const wsUrl = `ws://patientvitalbackend-production.up.railway.app/ws/patient/${patientId}/`;  // Use 'ws://' for local dev

    wsRef.current = new ReconnectingWebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'vitals_update' && message.data) {
        setLatestVitals(message.data);
        // Optionally, trigger other updates (e.g., graphs, risk assessment)
      } else if (message.type === 'connection_established') {
        console.log(message.message);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount or patient change
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [patientId]);

  return { latestVitals, isConnected };
};

export default useWebSocket;