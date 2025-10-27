import type { Packet, FirewallRule } from '../types';

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('en-US');
};

export const isValidIP = (ip: string): boolean => {
  if (ip === 'any') return true;
  
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  if (!ipRegex.test(ip)) return false;
  
  // Basic validation for IP ranges
  const parts = ip.split('/');
  const baseIP = parts[0];
  const octets = baseIP.split('.');
  
  return octets.every(octet => {
    const num = parseInt(octet);
    return num >= 0 && num <= 255;
  });
};

export const doesPacketMatchRule = (packet: Packet, rule: FirewallRule): boolean => {
  // Check source IP (supports 'any' and CIDR notation)
  if (rule.src_ip !== 'any' && rule.src_ip !== packet.src_ip) {
    return false;
  }
  
  // Check destination IP
  if (rule.dest_ip !== 'any' && rule.dest_ip !== packet.dest_ip) {
    return false;
  }
  
  // Check port
  if (rule.port !== null && rule.port !== packet.port) {
    return false;
  }
  
  // Check protocol
  if (rule.protocol !== 'ANY' && rule.protocol !== packet.protocol) {
    return false;
  }
  
  return true;
};

export const generatePacketId = (packet: Packet): string => {
  return `${packet.src_ip}-${packet.dest_ip}-${packet.port}-${packet.protocol}-${Date.now()}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};