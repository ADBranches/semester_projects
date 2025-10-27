/**
 * FirewallX API Client - ENHANCED VERSION
 * Author: Edwin Bwambale
 * Description: Robust API layer with CORS handling, retry logic, and backend health monitoring
 */
import type { ApiResponse } from "../types";

// ✅ Environment-aware base URL configuration
const getApiBaseUrl = (): string => {
  // 1. Check for explicit environment variable
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // 2. Detect deployment environment
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  
  // Production environments
  if (hostname.includes("onrender.com") || hostname.includes("vercel.app")) {
    return "https://semester-projects.onrender.com/api";
  }
  
  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5001/api";
  }
  
  // Fallback for same-origin API
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

// ✅ Backend health state management
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
    // ✅ Auto health check on initialization
    this.performHealthCheck();
    
    // ✅ Periodic health monitoring
    if (typeof window !== "undefined") {
      setInterval(() => this.performHealthCheck(), this.HEALTH_CHECK_INTERVAL);
    }
  }

  /**
   * Core request method with retry logic and CORS handling
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
        "Accept": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      log(`Request: ${options.method || "GET"} ${url}`);
      
      const response = await fetch(url, config);

      // ✅ Handle HTTP errors
      if (!response.ok) {
        // Check if it's a CORS preflight issue
        if (response.status === 0) {
          throw new Error("CORS_ERROR");
        }
        
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // ✅ Parse successful response
      const result: ApiResponse<T> = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.message || "API returned error status");
      }

      // ✅ Mark backend as healthy on success
      this.markHealthy();
      
      return result.data as T;

    } catch (err: any) {
      // ✅ Handle network/CORS errors
      if (err instanceof TypeError || err.message === "CORS_ERROR" || err.message.includes("Failed to fetch")) {
        warn(`Backend unreachable (attempt ${retryCount + 1}/${this.MAX_RETRIES + 1})`);
        
        // ✅ Retry logic for network errors
        if (retryCount < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY);
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
        this.markUnhealthy();
        throw new Error(
          "Backend is currently offline. " +
          "If on Render free tier, please wait ~50 seconds for the service to wake up."
        );
      }

      // ✅ Other API errors
      error(`Request failed: ${err.message}`);
      throw new Error(err.message || "Unknown API error occurred");
    }
  }

  /**
   * HTTP method wrappers
   */
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

  /**
   * Health check with caching
   */
  async healthCheck(): Promise<{ status: string; service: string; healthy: boolean }> {
    const now = Date.now();
    
    // ✅ Return cached health status if recent
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

  /**
   * Silent background health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      await this.healthCheck();
    } catch {
      // Silent failure - state already updated
    }
  }

  /**
   * Health state management
   */
  private markHealthy(): void {
    if (!this.healthState.isHealthy) {
      log("Backend connection restored ✅");
    }
    
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

  /**
   * Get current health state
   */
  getHealthState(): Readonly<HealthState> {
    return { ...this.healthState };
  }

  /**
   * Utility: delay for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get configured API base URL
   */
  getBaseUrl(): string {
    return API_BASE_URL;
  }
}

// ✅ Export singleton instance
export const apiClient = new ApiClient();

// ✅ Export for type safety
export type { HealthState };