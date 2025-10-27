import { apiClient } from './api';
import type { Packet, SimulationStatus, SimulationResult } from '../types';

export const packetService = {
  async simulatePacket(packet: Omit<Packet, 'timestamp'>): Promise<SimulationResult> {
    return apiClient.post<SimulationResult>('/packets/simulate', packet);
  },

  async startSimulation(): Promise<string> {
    const result = await apiClient.post<{ message: string }>('/packets/simulate-stream');
    return result.message;
  },

  async stopSimulation(): Promise<string> {
    const result = await apiClient.post<{ message: string }>('/packets/simulate-stop');
    return result.message;
  },

  async getSimulationStatus(): Promise<SimulationStatus> {
    return apiClient.get<SimulationStatus>('/packets/simulation-status');
  },

  async getLogs(): Promise<any[]> {
    return apiClient.get<any[]>('/logs');
  },

  // Utility function to generate mock packets for testing
  generateMockPacket(): Packet {
    const protocols: Array<'TCP' | 'UDP' | 'ICMP'> = ['TCP', 'UDP', 'ICMP'];
    const ports = [80, 443, 22, 53, 8080, 3000];
    
    return {
      src_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      dest_ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      port: ports[Math.floor(Math.random() * ports.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      timestamp: new Date().toISOString()
    };
  }
};