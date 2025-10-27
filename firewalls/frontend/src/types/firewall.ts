// src/types/firewall.ts
//-------------------------------------------------------------
// Author: Edwin Bwambale
// Description: Unified type definitions for FirewallX Frontend
//-------------------------------------------------------------

// Core firewall rule
export interface FirewallRule {
  id: number;
  src_ip: string;
  dest_ip: string;
  port: number | null;
  protocol: "TCP" | "UDP" | "ICMP" | "ANY";
  action: "ALLOW" | "BLOCK";
  description: string;
  created_at: string;
}

// A single simulated network packet
export interface Packet {
  src_ip: string;
  dest_ip: string;
  port: number;
  protocol: "TCP" | "UDP" | "ICMP";
  timestamp?: string;
}

// Log entry for a packet inspection
export interface PacketLog {
  id?: number;
  src_ip: string;
  dest_ip: string;
  port: number | null;
  protocol: "TCP" | "UDP" | "ICMP";
  action: "ALLOW" | "BLOCK";
  description?: string;
  decision?: "ALLOW" | "BLOCK";
  reason?: string;
  rule_id?: number | null;
  timestamp?: string;
}

// WebSocket simulation state
export interface SimulationStatus {
  is_running: boolean;
  interval: number;
  packet_count: number;
}

// Generic API response
export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}

// Simulation decision output
export interface SimulationResult {
  decision: "ALLOW" | "BLOCK";
  reason: string;
  packet: Packet;
}

// Context types used in hooks and pages
export interface PacketVisualizerProps {
  packets: PacketLog[];
}

export interface PacketContextType {
  packets: PacketLog[];
  fetchPackets: () => Promise<void>;
  addPacket: (packet: PacketLog) => void;
}
