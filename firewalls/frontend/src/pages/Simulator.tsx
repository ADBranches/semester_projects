/**
 * Simulator.tsx
 * Author: Edwin Bwambale
 * Main simulation interface for FirewallX
 */

import React, { useState } from "react";
import { usePacket } from "../context/PacketContext";
import {PacketVisualizer} from "../components/PacketVisualizer";
import type { Packet } from "../types";

const Simulator: React.FC = () => {
  const {
    packets,
    simulationStatus,
    startSimulation,
    stopSimulation,
    simulatePacket,
    isSimulating,
    error,
    clearError,
  } = usePacket();

  const [manualPacket, setManualPacket] = useState<Omit<Packet, "id" | "timestamp">>({
    src_ip: "",
    dest_ip: "",
    port: 80,
    protocol: "TCP",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setManualPacket((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }));
  };

  const handleSend = async () => {
    await simulatePacket(manualPacket);
  };

  return (
    <div className="p-6 text-gray-200">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">
        Packet Simulation Interface
      </h2>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 p-2 rounded-md mb-4">
          {error}
          <button onClick={clearError} className="ml-3 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 🧠 Simulation Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            isSimulating
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Start Simulation
        </button>
        <button
          onClick={stopSimulation}
          disabled={!isSimulating}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            !isSimulating
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Stop Simulation
        </button>

        <div className="ml-auto text-sm text-gray-400">
          <span>Status: </span>
          <span
            className={`font-medium ${
              isSimulating ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {simulationStatus.is_running ? "Running" : "Stopped"}
          </span>{" "}
          | Packets:{" "}
          <span className="text-blue-400">{simulationStatus.packet_count}</span>
        </div>
      </div>

      {/* 💡 Manual Packet Form */}
      <div className="bg-[#101522] border border-gray-700 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold text-indigo-400 mb-3">
          Send Manual Packet
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            name="src_ip"
            value={manualPacket.src_ip}
            onChange={handleChange}
            placeholder="Source IP"
            className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="dest_ip"
            value={manualPacket.dest_ip}
            onChange={handleChange}
            placeholder="Destination IP"
            className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            name="port"
            value={manualPacket.port}
            onChange={handleChange}
            placeholder="Port"
            className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
          />
          <select
            name="protocol"
            value={manualPacket.protocol}
            onChange={handleChange}
            className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option>TCP</option>
            <option>UDP</option>
            <option>ICMP</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm"
          >
            Send Packet
          </button>
        </div>
      </div>

      {/* 🌐 Packet Visualizer */}
      <h3 className="text-lg font-semibold text-indigo-400 mb-2">
        Live Packet Visualizer
      </h3>
      <PacketVisualizer packets={packets} />
    </div>
  );
};

export default Simulator;
