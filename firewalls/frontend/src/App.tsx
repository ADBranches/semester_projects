import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Dashboard } from "./pages/Dashboard";
import Simulator from "./pages/Simulator";
import RuleManager from "./pages/RuleManager";
import Logs from "./pages/Logs";
import { usePacket } from "./context/PacketContext";
import { apiClient } from "./services/api";
import "./App.css";

function App() {
  const { simulationStatus, startSimulation, stopSimulation, refreshSimulationStatus } = usePacket();
  const [backendStatus, setBackendStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [error, setError] = useState<string | null>(null);

  /** 🔍 Check backend health */
  const checkBackendHealth = async () => {
    try {
      await apiClient.healthCheck();
      setBackendStatus("connected");
      setError(null);
    } catch {
      setBackendStatus("disconnected");
      setError("Backend server is not responding. Ensure it’s running on port 5001.");
    }
  };

  /** 🔄 Toggle simulation via context */
  const handleSimulationToggle = async () => {
    if (backendStatus !== "connected") {
      setError("Cannot control simulation: Backend is disconnected.");
      return;
    }

    try {
      setError(null);
      if (simulationStatus.is_running) await stopSimulation();
      else await startSimulation();
      setTimeout(refreshSimulationStatus, 500);
    } catch (err) {
      console.error("Simulation toggle failed:", err);
      setError(
        `Failed to ${simulationStatus.is_running ? "stop" : "start"} simulation.`
      );
    }
  };

  /** 🌐 Check backend health on mount */
  useEffect(() => {
    checkBackendHealth();
  }, []);

  /** ⏱️ Poll for simulation updates if backend is active */
  useEffect(() => {
    if (backendStatus === "connected") {
      const interval = setInterval(refreshSimulationStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [backendStatus]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar
        simulationStatus={simulationStatus}
        onSimulationToggle={handleSimulationToggle}
        backendStatus={backendStatus}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 🔴 Backend Disconnected Alert */}
        {backendStatus === "disconnected" && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
              <div>
                <h3 className="text-red-200 font-medium">Backend Disconnected</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button
                  onClick={checkBackendHealth}
                  className="btn btn-secondary mt-2 text-sm"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ⚠️ Generic Error Alert */}
        {error && backendStatus === "connected" && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
              <p className="text-yellow-200">{error}</p>
            </div>
          </div>
        )}

        {/* 🧭 Page Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/rules" element={<RuleManager />} />
          <Route path="/logs" element={<Logs />} />
          <Route
            path="/about"
            element={
              <div className="text-center text-gray-300">
                <h2 className="text-3xl font-bold text-blue-400 mb-3">
                  About FirewallX
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  FirewallX is a real-time firewall simulation and visualization
                  tool built to help you understand network security operations,
                  packet inspection, and traffic filtering.
                    <h1 className="text-lg text-gray-400 max-w-2xl mx-auto">GROUP 4 CSF</h1>
                </p>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer backendStatus={backendStatus} />
    </div>
  );
}

export default App;
