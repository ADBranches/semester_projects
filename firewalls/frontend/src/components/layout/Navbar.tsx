import React from "react";
import { NavLink } from "react-router-dom";
import type { SimulationStatus } from "../../types";

interface NavbarProps {
  simulationStatus?: SimulationStatus;
  onSimulationToggle?: () => void;
  backendStatus?: "connected" | "disconnected" | "checking";
}

export const Navbar: React.FC<NavbarProps> = ({
  simulationStatus,
  onSimulationToggle,
  backendStatus = "checking",
}) => {
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Simulator", path: "/simulator" },
    { name: "Rules", path: "/rules" },
    { name: "Logs", path: "/logs" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FX</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            Firewall<span className="text-blue-400">X</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-4">
          {navItems.map(({ name, path }) => (
            <NavLink
              key={name}
              to={path}
              end
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {name}
            </NavLink>
          ))}
        </div>

        {/* Status & Controls */}
        <div className="flex items-center space-x-4">
          {/* Backend Status */}
          <div className="flex items-center space-x-2 mr-4">
            <div
              className={`w-2 h-2 rounded-full ${
                backendStatus === "connected"
                  ? "bg-green-400"
                  : backendStatus === "checking"
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="text-xs text-gray-400 hidden sm:block">
              {backendStatus === "connected"
                ? "Backend"
                : backendStatus === "checking"
                ? "Connecting..."
                : "Disconnected"}
            </span>
          </div>

          {/* Simulation Status */}
          {simulationStatus && (
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  simulationStatus.is_running
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-400"
                }`}
              />
              <span className="text-sm text-gray-300 hidden sm:block">
                {simulationStatus.is_running ? "Simulating" : "Stopped"}
              </span>
            </div>
          )}

          {/* Start/Stop Simulation */}
          <button
            onClick={onSimulationToggle}
            disabled={backendStatus !== "connected"}
            className={`btn ${
              simulationStatus?.is_running ? "btn-danger" : "btn-primary"
            } ${
              backendStatus !== "connected"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {simulationStatus?.is_running ? "Stop" : "Start"} Sim
          </button>
        </div>
      </div>
    </nav>
  );
};
