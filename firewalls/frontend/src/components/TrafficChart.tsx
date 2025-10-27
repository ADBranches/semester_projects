import React, { useMemo } from 'react';
import type { PacketLog } from '../types';
import { CHART_COLORS } from '../utils/constants';

interface TrafficChartProps {
  logs: PacketLog[];
  timeRange?: '1h' | '6h' | '24h';
  height?: number;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ 
  logs, 
  timeRange = '1h',
  height = 200 
}) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const timeAgo = new Date();
    
    switch (timeRange) {
      case '1h':
        timeAgo.setHours(now.getHours() - 1);
        break;
      case '6h':
        timeAgo.setHours(now.getHours() - 6);
        break;
      case '24h':
        timeAgo.setDate(now.getDate() - 1);
        break;
    }

    const filteredLogs = logs.filter(log => new Date(log.timestamp) > timeAgo);
    
    // Group by 5-minute intervals
    const intervals: { [key: string]: { allowed: number; blocked: number } } = {};
    
    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const intervalKey = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        Math.floor(date.getMinutes() / 5) * 5
      ).toISOString();
      
      if (!intervals[intervalKey]) {
        intervals[intervalKey] = { allowed: 0, blocked: 0 };
      }
      
      if (log.decision === 'ALLOW') {
        intervals[intervalKey].allowed++;
      } else {
        intervals[intervalKey].blocked++;
      }
    });

    const labels = Object.keys(intervals)
      .sort()
      .slice(-12) // Last 12 intervals
      .map(isoString => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      });

    const allowedData = Object.values(intervals)
      .slice(-12)
      .map(interval => interval.allowed);
    
    const blockedData = Object.values(intervals)
      .slice(-12)
      .map(interval => interval.blocked);

    return { labels, allowedData, blockedData };
  }, [logs, timeRange]);

  const maxValue = useMemo(() => {
    const allValues = [...chartData.allowedData, ...chartData.blockedData];
    return Math.max(...allValues, 10); // Minimum scale of 10
  }, [chartData]);

  return (
    <div className="card bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Network Traffic</h3>
        <div className="flex space-x-2">
          {(['1h', '6h', '24h'] as const).map(range => (
            <button
              key={range}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
          {[maxValue, Math.floor(maxValue * 0.66), Math.floor(maxValue * 0.33), 0].map((value, index) => (
            <div key={index} className="text-right pr-1">
              {value}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full flex items-end space-x-2">
          {chartData.labels.map((label, index) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              {/* Bars */}
              <div className="w-full flex flex-col-reverse space-y-1 space-y-reverse" style={{ height: '90%' }}>
                {/* Allowed bar */}
                {chartData.allowedData[index] > 0 && (
                  <div
                    className="rounded-t transition-all duration-500"
                    style={{
                      height: `${(chartData.allowedData[index] / maxValue) * 100}%`,
                      backgroundColor: CHART_COLORS.allowed,
                    }}
                    title={`Allowed: ${chartData.allowedData[index]}`}
                  />
                )}
                
                {/* Blocked bar */}
                {chartData.blockedData[index] > 0 && (
                  <div
                    className="rounded-t transition-all duration-500"
                    style={{
                      height: `${(chartData.blockedData[index] / maxValue) * 100}%`,
                      backgroundColor: CHART_COLORS.blocked,
                    }}
                    title={`Blocked: ${chartData.blockedData[index]}`}
                  />
                )}
              </div>
              
              {/* X-axis label */}
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: CHART_COLORS.allowed }}
            />
            <span className="text-xs text-gray-400">Allowed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: CHART_COLORS.blocked }}
            />
            <span className="text-xs text-gray-400">Blocked</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex justify-between text-sm text-gray-400 mt-4">
        <div>
          Total: {chartData.allowedData.reduce((a, b) => a + b, 0) + chartData.blockedData.reduce((a, b) => a + b, 0)}
        </div>
        <div className="text-green-400">
          Allowed: {chartData.allowedData.reduce((a, b) => a + b, 0)}
        </div>
        <div className="text-red-400">
          Blocked: {chartData.blockedData.reduce((a, b) => a + b, 0)}
        </div>
      </div>
    </div>
  );
};