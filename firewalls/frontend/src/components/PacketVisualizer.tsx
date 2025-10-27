import React, { useState, useEffect } from 'react';
import type { Packet, PacketLog } from '../types';
import { usePacket } from '../context/PacketContext';
import { formatTimestamp } from '../utils/helpers';

interface PacketVisualizerProps {
  maxPackets?: number;
  showControls?: boolean;
}

export const PacketVisualizer: React.FC<PacketVisualizerProps> = ({ 
  maxPackets = 10,
  showControls = true 
}) => {
  const { packets, logs, simulatePacket, clearPackets } = usePacket();
  const [visiblePackets, setVisiblePackets] = useState<Packet[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update visible packets with animation
  useEffect(() => {
    if (packets.length > 0) {
      setIsAnimating(true);
      setVisiblePackets(prev => [
        packets[0],
        ...prev.slice(0, maxPackets - 1)
      ]);
      
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [packets, maxPackets]);

  const getRecentLogs = (): PacketLog[] => {
    return logs.slice(0, 5);
  };

  const handleQuickTest = () => {
    const testPackets: Omit<Packet, 'timestamp'>[] = [
      { src_ip: '192.168.1.100', dest_ip: '10.0.0.5', port: 80, protocol: 'TCP' },
      { src_ip: '10.0.0.10', dest_ip: '8.8.8.8', port: 443, protocol: 'TCP' },
      { src_ip: '172.16.0.5', dest_ip: '10.0.0.5', port: 22, protocol: 'TCP' },
    ];
    
    testPackets.forEach((packet, index) => {
      setTimeout(() => simulatePacket(packet), index * 1000);
    });
  };

  const getDecisionColor = (decision: 'ALLOW' | 'BLOCK') => {
    return decision === 'ALLOW' ? 'text-green-400' : 'text-red-400';
  };

  const getDecisionBgColor = (decision: 'ALLOW' | 'BLOCK') => {
    return decision === 'ALLOW' ? 'bg-green-400/10' : 'bg-red-400/10';
  };

  return (
    <div className="card bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Packet Flow</h3>
        {showControls && (
          <div className="flex space-x-2">
            <button
              onClick={handleQuickTest}
              className="btn btn-secondary text-sm"
            >
              Quick Test
            </button>
            <button
              onClick={clearPackets}
              className="btn btn-secondary text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Real-time packet animation area */}
      <div className="relative h-32 mb-6 bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        {/* Network lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-gray-400"
              style={{ top: `${(i + 1) * 25}%` }}
            />
          ))}
        </div>

        {/* Animated packets */}
        {visiblePackets.map((packet, index) => {
          const log = logs.find(l => l.packet_id === (packet as any).id);
          const decision = log?.decision || 'ALLOW';
          
          return (
            <div
              key={`${packet.src_ip}-${packet.dest_ip}-${index}`}
              className={`absolute top-1/2 transform -translate-y-1/2 packet-dot ${decision.toLowerCase()} ${
                isAnimating && index === 0 ? 'scale-150' : 'scale-100'
              } transition-transform duration-300`}
              style={{
                left: `${(index / maxPackets) * 80 + 10}%`,
                transition: 'left 0.5s ease-out',
              }}
              title={`${packet.src_ip} → ${packet.dest_ip}:${packet.port} (${packet.protocol}) - ${decision}`}
            />
          );
        })}

        {/* Labels */}
        <div className="absolute left-4 top-2 text-xs text-gray-400">Internal</div>
        <div className="absolute right-4 top-2 text-xs text-gray-400">External</div>
      </div>

      {/* Recent packets table */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Recent Packets</h4>
        
        {visiblePackets.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No packets to display. Start simulation or send test packets.
          </div>
        ) : (
          visiblePackets.map((packet, index) => {
            const log = logs.find(l => l.packet_id === (packet as any).id);
            const decision = log?.decision || 'ALLOW';
            const reason = log?.reason || 'Processing...';

            return (
              <div
                key={`${packet.src_ip}-${packet.dest_ip}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  index === 0 && isAnimating ? 'glow-effect' : 'border-gray-700'
                } ${getDecisionBgColor(decision)}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      decision === 'ALLOW' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {packet.src_ip} → {packet.dest_ip}
                      </div>
                      <div className="text-xs text-gray-400">
                        Port {packet.port} • {packet.protocol}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getDecisionColor(decision)}`}>
                      {decision}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[120px]">
                      {reason}
                    </div>
                  </div>
                  {packet.timestamp && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimestamp(packet.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick stats */}
      {logs.length > 0 && (
        <div className="flex justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-700">
          <div>Total Processed: {logs.length}</div>
          <div className="text-green-400">
            Allowed: {logs.filter(l => l.decision === 'ALLOW').length}
          </div>
          <div className="text-red-400">
            Blocked: {logs.filter(l => l.decision === 'BLOCK').length}
          </div>
        </div>
      )}
    </div>
  );
};