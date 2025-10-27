/**
 * Native WebSocket Hook (Graceful Offline Handling + Smart Reconnect)
 * Author: Edwin Bwambale
 * Environment-ready for both localhost and hosted setups.
 */

import { useState, useEffect, useRef, useCallback } from "react";

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, onOpen, onClose, onError } = options;

  // Controlled debug logging
  const DEBUG = import.meta.env.VITE_DEBUG_LOGS === "true" || false;
  const log = (...args: any[]) => DEBUG && console.log(...args);
  const warn = (...args: any[]) => DEBUG && console.warn(...args);
  const errlog = (...args: any[]) => DEBUG && console.error(...args);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "retrying" | "offline"
  >("disconnected");

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 8;
  const isConnecting = useRef(false);
  const silentOffline = useRef(false);
  const isManualDisconnect = useRef(false);

  // ✅ Dynamically detect correct WS URL
  const WS_URL =
    import.meta.env.VITE_WS_URL ||
    `${window.location.origin.replace(/^http/, "ws")}/ws`;

  const API_HEALTH_URL =
    import.meta.env.VITE_API_BASE?.replace(/\/api$/, "") + "/api/health" ||
    "http://localhost:5001/api/health";

  // Exponential backoff (1s → 2s → 4s → ... up to 10s)
  const getReconnectDelay = (attempt: number) =>
    Math.min(10000, Math.pow(2, attempt) * 1000);

  // Lightweight backend reachability check
  const checkBackendOnline = async () => {
    try {
      const res = await fetch(API_HEALTH_URL, { method: "GET" });
      if (res.ok) return true;
    } catch (_) {}
    return false;
  };

  const connect = useCallback(async () => {
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.OPEN))
      return;

    const backendUp = await checkBackendOnline();
    if (!backendUp) {
      if (!silentOffline.current) {
        warn("⚠️ Backend is offline — will retry silently when online...");
        silentOffline.current = true;
      }
      setConnectionStatus("offline");
      return;
    }

    // Clean up stale socket
    if (ws.current) {
      try {
        ws.current.close();
      } catch (_) {}
      ws.current = null;
    }

    try {
      isConnecting.current = true;
      setConnectionStatus("connecting");
      log(`🌐 WebSocket connecting → ${WS_URL}`);

      const socket = new WebSocket(WS_URL);
      ws.current = socket;

      socket.onopen = () => {
        isConnecting.current = false;
        reconnectAttempts.current = 0;
        silentOffline.current = false;
        setIsConnected(true);
        setConnectionStatus("connected");
        log("✅ WebSocket connected");
        onOpen?.();
      };

      socket.onmessage = (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          if (data && typeof data === "object") {
            setLastMessage(data);
            onMessage?.(data);
          } else {
            warn("⚠️ Invalid WebSocket payload:", data);
          }
        } catch (err) {
          errlog("❌ Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (event) => {
        const msg = (event as any)?.message || "";
        if (msg.includes("closed before the connection")) {
          if (DEBUG) warn("⚠️ Backend not ready yet — retrying silently...");
          setTimeout(connect, 1000);
          socket?.close();
          setConnectionStatus("offline");
          isConnecting.current = false;
          return;
        }

        if (!silentOffline.current) {
          warn("⚠️ WebSocket unreachable — retrying silently...");
          silentOffline.current = true;
        }

        setIsConnected(false);
        setConnectionStatus("offline");
        isConnecting.current = false;
        onError?.(new Error("WebSocket error (offline)"));
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        isConnecting.current = false;

        if (isManualDisconnect.current) return;

        if ([1001, 1006].includes(event.code)) {
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            const delay = getReconnectDelay(reconnectAttempts.current);
            setConnectionStatus("retrying");
            if (DEBUG) warn(`⏳ Retrying WebSocket in ${delay / 1000}s...`);

            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = setTimeout(connect, delay);
          } else {
            warn("🛑 Max reconnection attempts reached — pausing");
            setConnectionStatus("offline");
          }
        } else {
          setConnectionStatus("disconnected");
        }

        onClose?.();
      };
    } catch (error) {
      isConnecting.current = false;
      onError?.(error);
      errlog("💥 WebSocket setup error:", error);
    }
  }, [onMessage, onOpen, onClose, onError]);

  const sendMessage = useCallback(
    (event: string, message: any) => {
      if (ws.current && isConnected && ws.current.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ type: event, data: message });
        log(`📤 Sending [${event}]`);
        ws.current.send(payload);
        return true;
      } else {
        if (DEBUG) warn(`⚠️ WebSocket not connected, cannot send [${event}]`);
        return false;
      }
    },
    [isConnected]
  );

  const disconnect = useCallback(() => {
    log("🔌 Manually disconnecting WebSocket...");
    isManualDisconnect.current = true;
    isConnecting.current = false;
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);

    if (ws.current) {
      try {
        ws.current.close(1000, "Manual disconnect");
      } catch (_) {}
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("disconnected");
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    connectionStatus,
  };
}
