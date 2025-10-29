/**
 * packetService.ts
 * FirewallX Packet Simulation Service
 * Author: Edwin Bwambale
 * 
 * ✅ Hardened version:
 * - Gracefully handles missing or malformed API responses
 * - Preserves all working functionalities
 * - Adds safe defaults for message responses
 */

import { apiClient } from "./api";
import type { Packet, SimulationStatus, SimulationResult } from "../types";

export const packetService = {
  /**
   * Simulate a single packet request
   */
  async simulatePacket(packet: Omit<Packet, "timestamp">): Promise<SimulationResult> {
    try {
      const result = await apiClient.post<SimulationResult>("/packets/simulate", packet);
      return result;
    } catch (err: any) {
      console.error("❌ simulatePacket failed:", err?.message || err);
      throw new Error(err?.message || "Failed to simulate packet.");
    }
  },

  /**
   * Start packet simulation stream
   */
  async startSimulation(): Promise<string> {
    try {
      const result = await apiClient.post<{ message?: string }>("/packets/simulate-stream");
      return result?.message || "Simulation started successfully.";
    } catch (err: any) {
      console.error("❌ startSimulation failed:", err?.message || err);
      throw new Error(err?.message || "Unable to start simulation.");
    }
  },

  /**
   * Stop active packet simulation stream
   */
  async stopSimulation(): Promise<string> {
    try {
      const result = await apiClient.post<{ message?: string }>("/packets/simulate-stop");
      return result?.message || "Simulation stopped successfully.";
    } catch (err: any) {
      console.error("❌ stopSimulation failed:", err?.message || err);
      throw new Error(err?.message || "Unable to stop simulation.");
    }
  },

  /**
   * Retrieve current simulation status
   */
  async getSimulationStatus(): Promise<SimulationStatus> {
    try {
      const status = await apiClient.get<SimulationStatus>("/packets/simulation-status");
      return status;
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as any).message
          : "Unknown error";

      console.error("⚠️ getSimulationStatus failed:", message);

      // ✅ Return fallback matching SimulationStatus type
      return {
        is_running: false,
        interval: 0,
        packet_count: 0,
      } as SimulationStatus;
    }
  },


  /**
   * Retrieve simulation logs
   */
  async getLogs(): Promise<any[]> {
    try {
      const logs = await apiClient.get<any[]>("/logs");
      return Array.isArray(logs) ? logs : [];
    } catch (err: any) {
      console.error("⚠️ getLogs failed:", err?.message || err);
      return [];
    }
  },

  /**
   * Generate mock packet (for offline testing)
   */
  generateMockPacket(): Packet {
    const protocols: Array<"TCP" | "UDP" | "ICMP"> = ["TCP", "UDP", "ICMP"];
    const ports = [80, 443, 22, 53, 8080, 3000];

    return {
      src_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      dest_ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      port: ports[Math.floor(Math.random() * ports.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      timestamp: new Date().toISOString(),
    };
  },
};
