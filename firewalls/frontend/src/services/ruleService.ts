/**
 * ruleService.ts
 * Firewall rule CRUD service layer
 * Author: Edwin Bwambale
 */

import { apiClient } from "./api";
import type { FirewallRule } from "../types";

export const ruleService = {
  async getAllRules(): Promise<FirewallRule[]> {
    return apiClient.get<FirewallRule[]>("/rules");
  },

  async getRuleById(id: number): Promise<FirewallRule> {
    return apiClient.get<FirewallRule>(`/rules/${id}`);
  },

  async createRule(rule: Omit<FirewallRule, "id" | "created_at">): Promise<FirewallRule> {
    return apiClient.post<FirewallRule>("/rules", rule);
  },

  async updateRule(id: number, updates: Partial<FirewallRule>): Promise<FirewallRule> {
    return apiClient.put<FirewallRule>(`/rules/${id}`, updates);
  },

  async deleteRule(id: number): Promise<void> {
    await apiClient.delete(`/rules/${id}`);
  },

  async validateRule(rule: Partial<FirewallRule>): Promise<string[]> {
    const errors: string[] = [];

    if (!rule.src_ip?.trim()) errors.push("Source IP is required");
    if (!rule.dest_ip?.trim()) errors.push("Destination IP is required");
    if (rule.port && (rule.port < 1 || rule.port > 65535)) {
      errors.push("Port must be between 1 and 65535");
    }

    return errors;
  },
};
