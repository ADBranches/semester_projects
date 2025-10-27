/**
 * logService.ts
 * FirewallX Log Service
 * Author: Edwin Bwambale
 */

import { apiClient } from "./api";
import type { PacketLog } from "../types";

export const logService = {
  async getAllLogs(): Promise<PacketLog[]> {
    return apiClient.get<PacketLog[]>("/logs");
  },

  async getRecentLogs(limit: number = 50): Promise<PacketLog[]> {
    return apiClient.get<PacketLog[]>(`/logs?limit=${limit}`);
  },

  async clearLogs(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>("/logs/clear");
  },
};
