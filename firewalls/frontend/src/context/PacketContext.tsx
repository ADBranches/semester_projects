/**
 * FirewallX Packet Context
 * Author: Edwin Bwambale
 * Description: Unified state management for packets, logs, and simulation.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { Packet, PacketLog, SimulationStatus } from "../types";
import { packetService } from "../services/packetService";
import { useWebSocket } from "../hooks/useWebSocket";

// -------------------- STATE TYPES --------------------

interface PacketState {
  packets: Packet[];
  logs: PacketLog[];
  simulationStatus: SimulationStatus;
  isSimulating: boolean;
  error: string | null;
  isWebSocketConnected: boolean;
  webSocketStatus: "disconnected" | "connecting" | "connected";
}

type PacketAction =
  | { type: "SET_SIMULATION_STATUS"; payload: SimulationStatus }
  | { type: "ADD_PACKET"; payload: Packet }
  | { type: "ADD_LOG"; payload: PacketLog }
  | { type: "SET_LOGS"; payload: PacketLog[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_PACKETS" }
  | { type: "SET_WEBSOCKET_STATUS"; payload: boolean }
  | {
      type: "SET_WEBSOCKET_CONNECTION_STATUS";
      payload: "disconnected" | "connecting" | "connected";
    };

// -------------------- REDUCER --------------------

const packetReducer = (state: PacketState, action: PacketAction): PacketState => {
  switch (action.type) {
    case "SET_SIMULATION_STATUS":
      return {
        ...state,
        simulationStatus: action.payload,
        isSimulating: action.payload.is_running,
      };

    case "ADD_PACKET":
      return { ...state, packets: [action.payload, ...state.packets].slice(0, 100) };

    case "ADD_LOG":
      return { ...state, logs: [action.payload, ...state.logs].slice(0, 200) };

    case "SET_LOGS":
      return { ...state, logs: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_PACKETS":
      return { ...state, packets: [] };

    case "SET_WEBSOCKET_STATUS":
      return { ...state, isWebSocketConnected: action.payload };

    case "SET_WEBSOCKET_CONNECTION_STATUS":
      return { ...state, webSocketStatus: action.payload };

    default:
      return state;
  }
};

// -------------------- INITIAL STATE --------------------

const initialState: PacketState = {
  packets: [],
  logs: [],
  simulationStatus: { is_running: false, interval: 2.0, packet_count: 0 },
  isSimulating: false,
  error: null,
  isWebSocketConnected: false,
  webSocketStatus: "disconnected",
};

// -------------------- CONTEXT INTERFACE --------------------

interface PacketContextType extends PacketState {
  startSimulation: () => Promise<void>;
  stopSimulation: () => Promise<void>;
  simulatePacket: (packet: Omit<Packet, "timestamp">) => Promise<void>;
  clearPackets: () => void;
  clearError: () => void;
  refreshLogs: () => Promise<void>;
  testWebSocketConnection: () => boolean;
}

// -------------------- CONTEXT --------------------

const PacketContext = createContext<PacketContextType | undefined>(undefined);

// -------------------- PROVIDER --------------------

export const PacketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(packetReducer, initialState);

  // -------------------- WEBSOCKET HANDLERS --------------------

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      if (!data || typeof data !== "object") {
        console.warn("⚠️ Ignored invalid WebSocket message:", data);
        return;
      }

      console.log("📨 WebSocket message received:", data);

      // ✅ Safe dispatch for PACKET_RESULT
      if (data?.type === "PACKET_RESULT" && data.packet && data.log) {
        dispatch({ type: "ADD_PACKET", payload: data.packet });
        dispatch({ type: "ADD_LOG", payload: data.log });

        dispatch({
          type: "SET_SIMULATION_STATUS",
          payload: {
            ...state.simulationStatus,
            packet_count: (state.simulationStatus.packet_count || 0) + 1,
          },
        });
        return;
      }

      // ✅ Handle simulation status messages safely
      if (data?.type === "simulation_status") {
        const msg = data.message ?? "Simulation status updated";
        console.log(`📡 ${msg}`);

        dispatch({
          type: "SET_SIMULATION_STATUS",
          payload: {
            ...state.simulationStatus,
            is_running: data.status === "started",
          },
        });
        return;
      }

      // ✅ Handle other known message types
      if (data?.status === "started") {
        console.log("🚀 Simulation started via WebSocket");
        dispatch({
          type: "SET_SIMULATION_STATUS",
          payload: { ...state.simulationStatus, is_running: true },
        });
        return;
      }

      if (data?.status === "stopped") {
        console.log("🛑 Simulation stopped via WebSocket");
        dispatch({
          type: "SET_SIMULATION_STATUS",
          payload: { ...state.simulationStatus, is_running: false },
        });
        return;
      }

      // ✅ Catch-all for unexpected packets
      if (data?.message) {
        console.log(`ℹ️ Message: ${data.message}`);
      } else {
        console.warn("⚠️ Unhandled WebSocket payload:", data);
      }
    },
    [state.simulationStatus]
  );


  const handleWebSocketConnected = useCallback(() => {
    console.log("✅ WebSocket connected and stable");
    dispatch({ type: "SET_WEBSOCKET_STATUS", payload: true });
    dispatch({ type: "SET_WEBSOCKET_CONNECTION_STATUS", payload: "connected" });
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  const handleWebSocketOpen = useCallback(() => {
    console.log("🔗 WebSocket connection opening");
    dispatch({ type: "SET_WEBSOCKET_CONNECTION_STATUS", payload: "connecting" });
  }, []);

  const handleWebSocketClose = useCallback(() => {
    console.log("📡 WebSocket connection closed");
    dispatch({ type: "SET_WEBSOCKET_STATUS", payload: false });
    dispatch({ type: "SET_WEBSOCKET_CONNECTION_STATUS", payload: "disconnected" });
  }, []);

  const handleWebSocketError = useCallback((err?: any) => {
    // Gracefully handle WebSocket close-before-connect errors
    if (err?.message?.includes("closed before the connection")) {
      console.warn("⚠️ WebSocket attempted connection before backend was ready — retrying silently...");
      return;
    }

    console.error("❌ WebSocket connection error");
    dispatch({ type: "SET_WEBSOCKET_STATUS", payload: false });
    dispatch({ type: "SET_WEBSOCKET_CONNECTION_STATUS", payload: "disconnected" });
  }, []);


  const { sendMessage, isConnected, connectionStatus } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnected: handleWebSocketConnected,
    onOpen: handleWebSocketOpen,
    onClose: handleWebSocketClose,
    onError: handleWebSocketError,
  });

  // -------------------- COMMON ERROR HANDLER --------------------

  const handleApiError = useCallback(
    (error: any, fallback: string) => {
      const message =
        error?.message?.includes("Cannot connect") ||
        error?.message?.includes("refused") ||
        error?.message?.includes("Failed to fetch")
          ? "Backend is offline. Please ensure it’s running on port 5001."
          : error?.message || fallback;

      dispatch({ type: "SET_ERROR", payload: message });
    },
    []
  );

  // -------------------- SIMULATION CONTROL --------------------

  const startSimulation = useCallback(async () => {
    if (isConnected) {
      const success = sendMessage("start_simulation", {});
      if (success) return console.log("🚀 Simulation start command sent via WebSocket");
    }

    try {
      await packetService.startSimulation();
      const status = await packetService.getSimulationStatus();
      dispatch({ type: "SET_SIMULATION_STATUS", payload: status });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error: any) {
      handleApiError(error, "Failed to start simulation");
    }
  }, [isConnected, sendMessage, handleApiError]);

  const stopSimulation = useCallback(async () => {
    if (isConnected) {
      const success = sendMessage("stop_simulation", {});
      if (success) return console.log("🛑 Simulation stop command sent via WebSocket");
    }

    try {
      await packetService.stopSimulation();
      const status = await packetService.getSimulationStatus();
      dispatch({ type: "SET_SIMULATION_STATUS", payload: status });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error: any) {
      handleApiError(error, "Failed to stop simulation");
    }
  }, [isConnected, sendMessage, handleApiError]);

  const simulatePacket = useCallback(
    async (packet: Omit<Packet, "timestamp">) => {
      if (isConnected) {
        const success = sendMessage("simulate_packet", packet);
        if (success) return console.log("📤 Packet sent via WebSocket:", packet);
      }

      try {
        const result = await packetService.simulatePacket(packet);
        const packetWithTimestamp = {
          ...packet,
          timestamp: new Date().toISOString(),
          id: Date.now(),
        };
        dispatch({ type: "ADD_PACKET", payload: packetWithTimestamp });
        dispatch({
          type: "SET_SIMULATION_STATUS",
          payload: {
            ...state.simulationStatus,
            packet_count: state.simulationStatus.packet_count + 1,
          },
        });
      } catch (error: any) {
        handleApiError(error, "Failed to simulate packet");
      }
    },
    [isConnected, sendMessage, state.simulationStatus, handleApiError]
  );

  // -------------------- AUXILIARY ACTIONS --------------------

  const clearPackets = useCallback(() => dispatch({ type: "CLEAR_PACKETS" }), []);
  const clearError = useCallback(() => dispatch({ type: "SET_ERROR", payload: null }), []);

  const refreshLogs = useCallback(async () => {
    try {
      const logs = await packetService.getLogs();
      dispatch({ type: "SET_LOGS", payload: logs });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error: any) {
      handleApiError(error, "Failed to fetch logs");
    }
  }, [handleApiError]);

  const testWebSocketConnection = useCallback((): boolean => sendMessage("ping_test", {}), [sendMessage]);

  // -------------------- EFFECTS --------------------

  useEffect(() => {
    let alreadyWarned = false;

    if (!isConnected) {
      const interval = setInterval(async () => {
        try {
          const status = await packetService.getSimulationStatus();
          dispatch({ type: "SET_SIMULATION_STATUS", payload: status });
          dispatch({ type: "SET_ERROR", payload: null });

          // ✅ Reset flag when backend returns
          alreadyWarned = false;
        } catch (err: any) {
          // Log only once while backend stays offline
          if (
            !alreadyWarned &&
            (err.message?.includes("Cannot connect") ||
              err.message?.includes("refused"))
          ) {
            console.warn("⚠️ Backend is offline, will retry silently…");
            alreadyWarned = true;
          }
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);


  useEffect(() => {
    dispatch({ type: "SET_WEBSOCKET_STATUS", payload: isConnected });
    dispatch({
      type: "SET_WEBSOCKET_CONNECTION_STATUS",
      payload: isConnected ? "connected" : connectionStatus,
    });
  }, [isConnected, connectionStatus]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  // -------------------- CONTEXT VALUE --------------------

  const value: PacketContextType = {
    ...state,
    startSimulation,
    stopSimulation,
    simulatePacket,
    clearPackets,
    clearError,
    refreshLogs,
    testWebSocketConnection,
  };

  return <PacketContext.Provider value={value}>{children}</PacketContext.Provider>;
};

// -------------------- HOOK --------------------

export const usePacket = (): PacketContextType => {
  const context = useContext(PacketContext);
  if (!context) throw new Error("usePacket must be used within a PacketProvider");
  return context;
};
