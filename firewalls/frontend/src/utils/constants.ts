export const API_BASE_URL = 'http://localhost:5001/api';
export const WS_BASE_URL = 'ws://localhost:5001';

export const FIREWALL_PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'ANY'] as const;
export const FIREWALL_ACTIONS = ['ALLOW', 'BLOCK'] as const;

export const DEFAULT_RULE: Omit<Rule, 'id' | 'created_at'> = {
  src_ip: 'any',
  dest_ip: 'any',
  port: null,
  protocol: 'ANY',
  action: 'ALLOW',
  description: ''
};

export const MOCK_PACKETS = [
  { src_ip: '192.168.1.100', dest_ip: '10.0.0.5', port: 80, protocol: 'TCP' as const },
  { src_ip: '10.0.0.10', dest_ip: '8.8.8.8', port: 443, protocol: 'TCP' as const },
  { src_ip: '172.16.0.5', dest_ip: '10.0.0.5', port: 22, protocol: 'TCP' as const },
];

export const CHART_COLORS = {
  allowed: '#10B981',
  blocked: '#EF4444',
  pending: '#F59E0B'
};