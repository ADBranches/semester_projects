/**
 * AppProvider.tsx
 * Central integration layer between backend & frontend
 * Author: Edwin Bwambale
 */

import React, { createContext, useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { usePacket } from "./PacketContext";
import { useRule } from "./RuleContext";

interface HealthContextType {
  backendOnline: boolean;
  reconnecting: boolean;
  lastChecked: string | null;
}

export const HealthContext = createContext<HealthContextType>({
  backendOnline: false,
  reconnecting: false,
  lastChecked: null,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendOnline, setBackendOnline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const { isConnected, connectionStatus } = useWebSocket();
  const { fetchRules } = useRule();
  const { fetchPackets } = usePacket();

  /** 🔍 Periodic backend ping */
  const checkHealth = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/health");
      setBackendOnline(res.ok);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, 10000);
    return () => clearInterval(id);
  }, []);

  /** 🔁 Resync when backend returns online */
  useEffect(() => {
    if (backendOnline) {
      fetchRules();
      fetchPackets();
    }
  }, [backendOnline]);

  useEffect(() => setReconnecting(connectionStatus === "retrying"), [connectionStatus]);

  return (
    <HealthContext.Provider value={{ backendOnline, reconnecting, lastChecked }}>
      {children}
    </HealthContext.Provider>
  );
};
