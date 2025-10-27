/**
 * BackendStatusBanner Component
 * Displays backend connectivity status with auto-refresh
 */
import React from "react";
import { useBackendHealth } from "../hooks/useBackendHealth";
import { apiClient } from "../services/api";

export const BackendStatusBanner: React.FC = () => {
  const { isHealthy, message, isChecking, lastChecked, refresh } = useBackendHealth();

  // Don't show banner if healthy and not checking
  if (isHealthy && !isChecking) {
    return null;
  }

  const getStatusColor = () => {
    if (isChecking) return "bg-blue-100 border-blue-300 text-blue-800";
    if (isHealthy) return "bg-green-100 border-green-300 text-green-800";
    return "bg-yellow-100 border-yellow-300 text-yellow-800";
  };

  return (
    <div className={`border-b ${getStatusColor()} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="relative">
            {isChecking ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`} />
            )}
          </div>

          {/* Message */}
          <span className="font-medium text-sm">{message}</span>

          {/* Backend URL */}
          <code className="text-xs bg-white/50 px-2 py-1 rounded">
            {apiClient.getBaseUrl()}
          </code>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {lastChecked && (
            <span className="text-xs opacity-75">
              Last check: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={refresh}
            disabled={isChecking}
            className="text-xs px-3 py-1 bg-white/50 hover:bg-white/80 rounded transition-colors disabled:opacity-50"
          >
            {isChecking ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};