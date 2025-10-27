export interface FirewallRule {
  id: number;
  src_ip: string;
  dest_ip: string;
  port: number | null;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ANY';
  action: 'ALLOW' | 'BLOCK';
  description: string;
  created_at: string;
}

export interface Packet {
  src_ip: string;
  dest_ip: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  timestamp?: string;
}

export interface PacketLog {
  id: number;
  packet_id: number;
  decision: 'ALLOW' | 'BLOCK';
  reason: string;
  rule_id: number | null;
  timestamp: string;
}

export interface SimulationStatus {
  is_running: boolean;
  interval: number;
  packet_count: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface SimulationResult {
  decision: 'ALLOW' | 'BLOCK';
  reason: string;
  packet: Packet;
}