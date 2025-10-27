import React from 'react';

interface FooterProps {
  backendStatus?: 'connected' | 'disconnected' | 'checking';
}

export const Footer: React.FC<FooterProps> = ({ backendStatus = 'checking' }) => {
  const currentYear = new Date().getFullYear();

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      default: return 'Connecting...';
    }
  };

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="text-white font-semibold">
              Firewall<span className="text-blue-400">X</span>
            </div>
            <div className="text-gray-400 text-sm">
              Network Security Simulation Platform
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className={`${getStatusColor()} mr-1`}>●</span>
              <span className="text-gray-400">Backend: </span>
              <span className={getStatusColor()}>{getStatusText()}</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {currentYear} Edwin Bwambale
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};