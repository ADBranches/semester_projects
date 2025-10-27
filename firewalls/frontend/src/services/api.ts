/**
 * FirewallX API Client
 * Author: Edwin Bwambale
 * Description: Graceful API layer with environment flexibility and silent offline handling.
 */

import type { ApiResponse } from "../types";

// ✅ Dynamic base URL: supports both local and hosted environments
const API_BASE_URL =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== "undefined"
    ? `${window.location.origin.replace(/\/$/, "")}/api`
    : "http://localhost:5001/api");

const DEBUG = import.meta.env.VITE_DEBUG_LOGS === "true" || false;
const log = (...args: any[]) => DEBUG && console.log(...args);
const warn = (...args: any[]) => DEBUG && console.warn(...args);
const error = (...args: any[]) => DEBUG && console.error(...args);

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      log(`🌐 API Request: ${options.method || "GET"} ${url}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      return result.data as T;
    } catch (err: any) {
      // Handle backend offline or unreachable
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        if (DEBUG) warn("⚠️ Backend unreachable — returning fallback error");
        throw new Error(
          "Cannot connect to backend. Please ensure it’s running or check network settings."
        );
      }

      // Other network or server errors
      error("❌ API Error:", err.message || err);
      throw new Error(err.message || "Unknown API error occurred.");
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // ✅ Health check with safe fallback
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      return await this.get<{ status: string; service: string }>("/health");
    } catch {
      if (DEBUG) warn("⚠️ Backend health check failed");
      return { status: "offline", service: "FirewallX Backend" };
    }
  }
}

export const apiClient = new ApiClient();
