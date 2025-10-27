/**
 * LogTable.tsx
 * Displays network log entries in a responsive table
 * Author: Edwin Bwambale
 */

import React from "react";
import type { PacketLog } from "../types";

interface LogTableProps {
  logs: PacketLog[];
  loading?: boolean;
  error?: string | null;
}

const LogTable: React.FC<LogTableProps> = ({ logs, loading, error }) => {
  if (loading) return <p className="text-gray-400">Fetching logs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-x-auto mt-4 border border-gray-700 rounded-lg">
      <table className="min-w-full bg-[#101522] text-gray-200 text-sm">
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
          <tr>
            <th className="py-3 px-4 text-left">Timestamp</th>
            <th className="py-3 px-4 text-left">Source IP</th>
            <th className="py-3 px-4 text-left">Destination IP</th>
            <th className="py-3 px-4 text-left">Port</th>
            <th className="py-3 px-4 text-left">Protocol</th>
            <th className="py-3 px-4 text-left">Action</th>
            <th className="py-3 px-4 text-left">Decision</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No logs yet — start simulation to see activity.
              </td>
            </tr>
          ) : (
            logs.map((log, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-700 hover:bg-gray-800/70 transition-colors"
              >
                <td className="py-2 px-4 text-gray-400">{log.timestamp}</td>
                <td className="py-2 px-4">{log.src_ip}</td>
                <td className="py-2 px-4">{log.dest_ip}</td>
                <td className="py-2 px-4">{log.port}</td>
                <td className="py-2 px-4">{log.protocol}</td>
                <td
                  className={`py-2 px-4 font-medium ${
                    log.action === "allow" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {log.action}
                </td>
                <td className="py-2 px-4 text-gray-300">{log.decision}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
