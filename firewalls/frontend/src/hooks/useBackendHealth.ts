/**
 * useBackendHealth Hook
 * Monitors backend connectivity and displays status to users
 */
import { useState, useEffect } from "react";
import { apiClient } from "../services/api";

interface BackendHealth {
  isHealthy: boolean;
  status: string;
  message: string;
  isChecking: boolean;
  lastChecked: Date | null;
}

export const useBackendHealth = (checkInterval = 30000) => {
  const [health, setHealth] = useState<BackendHealth>({
    isHealthy: false,
    status: "unknown",
    message: "Checking backend status...",
    isChecking: true,
    lastChecked: null,
  });

  const checkHealth = async () => {
    setHealth(prev => ({ ...prev, isChecking: true }));

    try {
      const result = await apiClient.healthCheck();
      
      setHealth({
        isHealthy: result.healthy,
        status: result.status,
        message: result.healthy 
          ? "✅ Backend connected and operational"
          : "⚠️ Backend is offline - waiting for Render to wake up (~50s)",
        isChecking: false,
        lastChecked: new Date(),
      });
    } catch (error: any) {
      setHealth({
        isHealthy: false,
        status: "offline",
        message: error.message || "❌ Cannot reach backend",
        isChecking: false,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Periodic checks
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return {
    ...health,
    refresh: checkHealth,
  };
};