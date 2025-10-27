import React from 'react';
import { usePacket } from '../context/PacketContext';
import { useRule } from '../context/RuleContext';
import { TrafficChart } from '../components/TrafficChart';
import { PacketVisualizer } from '../components/PacketVisualizer';
import '../styles/dashboard.css';

export const Dashboard: React.FC = () => {
  const { 
    simulationStatus, 
    logs, 
    packets,
    startSimulation, 
    stopSimulation,
    error 
  } = usePacket();
  
  const { rules } = useRule();

  const stats = [
    {
      title: 'Packets Processed',
      value: simulationStatus.packet_count,
      change: '+12%',
      color: 'from-blue-500 to-cyan-500',
      icon: '📊'
    },
    {
      title: 'Active Rules',
      value: rules.length,
      change: '+2',
      color: 'from-green-500 to-emerald-500',
      icon: '🛡️'
    },
    {
      title: 'Simulation Status',
      value: simulationStatus.is_running ? 'Live' : 'Ready',
      change: simulationStatus.is_running ? 'Running' : 'Stopped',
      color: simulationStatus.is_running ? 'from-orange-500 to-red-500' : 'from-gray-500 to-gray-600',
      icon: simulationStatus.is_running ? '🟢' : '⚪'
    },
    {
      title: 'Threats Blocked',
      value: logs.filter(log => log.decision === 'BLOCK').length,
      change: '-5%',
      color: 'from-purple-500 to-pink-500',
      icon: '🚫'
    }
  ];

  const recentActivity = logs.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Firewall Dashboard</h1>
          <p className="text-gray-400">
            Real-time monitoring and visualization of network traffic and firewall activity
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="dashboard-grid mb-8">
          {stats.map((stat, index) => (
            <div key={stat.title} className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="metric-label">{stat.title}</div>
                </div>
                <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
              </div>
              <div className={`text-xs font-medium mt-3 ${
                stat.change.startsWith('+') ? 'text-green-400' : 
                stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
              }`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Control Section */}
        <div className="flex items-center justify-between mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Simulation Controls
            </h3>
            <p className="text-gray-400 text-sm">
              {simulationStatus.is_running 
                ? 'Real-time packet simulation is active' 
                : 'Start simulation to generate network traffic'
              }
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={simulationStatus.is_running ? stopSimulation : startSimulation}
              className={`btn text-lg px-6 py-3 ${
                simulationStatus.is_running 
                  ? 'btn-danger pulse-warning' 
                  : 'btn-primary glow-effect'
              }`}
            >
              {simulationStatus.is_running ? '🛑 Stop Simulation' : '🚀 Start Simulation'}
            </button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  simulationStatus.is_running ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`} />
                <span>{simulationStatus.is_running ? 'Live' : 'Ready'}</span>
              </div>
              <div>Interval: {simulationStatus.interval}s</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Traffic Chart */}
          <TrafficChart logs={logs} timeRange="1h" height={300} />
          
          {/* Packet Visualizer */}
          <PacketVisualizer maxPackets={8} showControls={true} />
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📨</div>
                <p>No activity yet. Start the simulation to see packet flow.</p>
              </div>
            ) : (
              recentActivity.map((log, index) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      log.decision === 'ALLOW' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-white font-medium">
                        Packet #{log.packet_id} - {log.decision}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {log.reason}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};