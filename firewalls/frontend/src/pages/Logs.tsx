/**
 * Logs.tsx
 * Centralized log viewer for FirewallX
 * Author: Edwin Bwambale
 */

import React, { useEffect, useState } from "react";
import LogTable from "../components/LogTable";
import { logService } from "../services/logService";
import { usePacket } from "../context/PacketContext";
import type { PacketLog } from "../types";

const Logs: React.FC = () => {
  const { logs: wsLogs, isWebSocketConnected } = usePacket();
  const [logs, setLogs] = useState<PacketLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial logs from backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetched = await logService.getRecentLogs(100);
      setLogs(fetched);
      setError(null);
    } catch (err: any) {
      setError(
        err.message?.includes("Cannot connect")
          ? "Backend is offline — unable to fetch logs."
          : "Failed to load logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Merge WebSocket live logs into state
  useEffect(() => {
    if (wsLogs?.length) {
      setLogs((prev) => {
        const newEntries = wsLogs.filter(
          (log) => !prev.find((p) => p.id === log.id)
        );
        return [...newEntries, ...prev].slice(0, 200);
      });
    }
  }, [wsLogs]);

  return (
    <div className="p-6 text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400">Network Logs</h2>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm"
        >
          Refresh
        </button>
      </div>

      {!isWebSocketConnected && (
        <div className="mb-4 bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-2 rounded-md">
          ⚠️ WebSocket disconnected — displaying last known logs.
        </div>
      )}

      <LogTable logs={logs} loading={loading} error={error} />
    </div>
  );
};

export default Logs;
