/**
 * FirewallX API Client - STABLE & SAFE VERSION
 * Author: Edwin Bwambale
 * Description: Robust API layer with CORS handling, retry logic, error normalization, and backend health monitoring
 */

import type { ApiResponse } from "../types";

// ✅ Environment-aware base URL configuration
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  // Production environments
  if (hostname.includes("onrender.com") || hostname.includes("vercel.app")) {
    return "https://semester-projects.onrender.com/api";
  }

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5001/api";
  }

  // Fallback
  return typeof window !== "undefined"
    ? `${window.location.origin.replace(/\/$/, "")}/api`
    : "http://localhost:5001/api";
};

const API_BASE_URL = getApiBaseUrl();
const DEBUG = import.meta.env.VITE_DEBUG_LOGS === "true" || false;

// ✅ Logging helpers
const log = (...args: any[]) => DEBUG && console.log("🔥 API:", ...args);
const warn = (...args: any[]) => DEBUG && console.warn("⚠️ API:", ...args);
const error = (...args: any[]) => DEBUG && console.error("❌ API:", ...args);

console.log("🔥 FirewallX API initialized =>", API_BASE_URL);

// ✅ Backend health state
interface HealthState {
  isHealthy: boolean;
  lastChecked: number;
  consecutiveFailures: number;
}

class ApiClient {
  private healthState: HealthState = {
    isHealthy: true,
    lastChecked: 0,
    consecutiveFailures: 0,
  };

  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Auto health check
    this.performHealthCheck();
    if (typeof window !== "undefined") {
      setInterval(() => this.performHealthCheck(), this.HEALTH_CHECK_INTERVAL);
    }
  }

  /**
   * Core request handler
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      log(`Request: ${options.method || "GET"} ${url}`);
      const response = await fetch(url, config);

      // Handle HTTP-level failures
      if (!response.ok) {
        if (response.status === 0) throw new Error("CORS_ERROR");

        let errorMessage = `HTTP ${response.status}`;
        try {
          const errText = await response.text();
          if (errText) {
            const errJson = JSON.parse(errText);
            errorMessage = errJson.message || errorMessage;
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // ✅ Robust JSON parsing (handles empty or malformed responses)
      const text = await response.text();
      if (!text) {
        warn("Empty response from backend:", url);
        this.markHealthy();
        return {} as T;
      }

      let result: ApiResponse<T>;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON returned by backend");
      }

      // Validate structure
      if (!result) {
        throw new Error("Empty or malformed API response");
      }
      if (result.status === "error") {
        throw new Error(result.message || "API returned error status");
      }

      this.markHealthy();
      return result.data as T;
    } catch (err: any) {
      // ✅ Normalize unknown error shapes safely
      const safeMessage =
        (err && typeof err === "object" && "message" in err && err.message) ||
        (typeof err === "string" ? err : "Unknown error occurred");

      // ✅ Handle network/CORS errors
      if (
        safeMessage.includes("CORS") ||
        safeMessage.includes("Failed to fetch") ||
        err instanceof TypeError
      ) {
        warn(`Backend unreachable (attempt ${retryCount + 1}/${this.MAX_RETRIES + 1})`);
        if (retryCount < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY);
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        this.markUnhealthy();
        throw new Error(
          "Backend is currently offline. " +
            "If on Render free tier, please wait ~50 seconds for it to wake up."
        );
      }

      // ✅ Other API-level errors
      error(`Request failed: ${safeMessage}`);
      throw new Error(safeMessage);
    }
  }

  // -----------------------------------
  // HTTP method wrappers
  // -----------------------------------
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // -----------------------------------
  // Health Monitoring
  // -----------------------------------
  async healthCheck(): Promise<{ status: string; service: string; healthy: boolean }> {
    const now = Date.now();
    if (now - this.healthState.lastChecked < 5000 && this.healthState.consecutiveFailures === 0) {
      return {
        status: this.healthState.isHealthy ? "online" : "offline",
        service: "FirewallX Backend",
        healthy: this.healthState.isHealthy,
      };
    }

    try {
      const result = await this.get<{ status: string; service?: string }>("/health");
      this.markHealthy();
      return {
        status: result.status || "online",
        service: result.service || "FirewallX Backend",
        healthy: true,
      };
    } catch {
      this.markUnhealthy();
      return {
        status: "offline",
        service: "FirewallX Backend",
        healthy: false,
      };
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      await this.healthCheck();
    } catch {
      // Silent failure
    }
  }

  private markHealthy(): void {
    if (!this.healthState.isHealthy) log("Backend connection restored ✅");
    this.healthState.isHealthy = true;
    this.healthState.consecutiveFailures = 0;
    this.healthState.lastChecked = Date.now();
  }

  private markUnhealthy(): void {
    this.healthState.isHealthy = false;
    this.healthState.consecutiveFailures++;
    this.healthState.lastChecked = Date.now();
    if (this.healthState.consecutiveFailures === 1) {
      warn("Backend appears to be offline");
    }
  }

  getHealthState(): Readonly<HealthState> {
    return { ...this.healthState };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getBaseUrl(): string {
    return API_BASE_URL;
  }
}

// ✅ Export singleton instance
export const apiClient = new ApiClient();

// ✅ Export for type safety
export type { HealthState };
