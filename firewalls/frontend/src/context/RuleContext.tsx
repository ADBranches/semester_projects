/**
 * RuleContext.tsx
 * Firewall Rules Context with full CRUD support
 * Author: Edwin Bwambale
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { FirewallRule } from "../types";
import { ruleService } from "../services/ruleService";

// ---------------------------------------------------
// 🧱 State & Actions
// ---------------------------------------------------
interface RuleState {
  rules: FirewallRule[];
  loading: boolean;
  error: string | null;
  selectedRule: FirewallRule | null;
}

type RuleAction =
  | { type: "SET_RULES"; payload: FirewallRule[] }
  | { type: "ADD_RULE"; payload: FirewallRule }
  | { type: "UPDATE_RULE"; payload: FirewallRule }
  | { type: "DELETE_RULE"; payload: number }
  | { type: "SELECT_RULE"; payload: FirewallRule | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const ruleReducer = (state: RuleState, action: RuleAction): RuleState => {
  switch (action.type) {
    case "SET_RULES":
      return { ...state, rules: action.payload, loading: false };
    case "ADD_RULE":
      return { ...state, rules: [action.payload, ...state.rules] };
    case "UPDATE_RULE":
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case "DELETE_RULE":
      return { ...state, rules: state.rules.filter((r) => r.id !== action.payload) };
    case "SELECT_RULE":
      return { ...state, selectedRule: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState: RuleState = {
  rules: [],
  loading: false,
  error: null,
  selectedRule: null,
};

// ---------------------------------------------------
// 🧩 Context Type Definition
// ---------------------------------------------------
interface RuleContextType extends RuleState {
  fetchRules: () => Promise<void>;
  addRule: (rule: Omit<FirewallRule, "id" | "created_at">) => Promise<void>;
  updateRule: (id: number, rule: Partial<FirewallRule>) => Promise<void>;
  deleteRule: (id: number) => Promise<void>;
  selectRule: (rule: FirewallRule | null) => void;
  clearError: () => void;
}

// ---------------------------------------------------
// 🚀 Context Implementation
// ---------------------------------------------------
const RuleContext = createContext<RuleContextType | undefined>(undefined);

export const RuleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(ruleReducer, initialState);

  // 🧠 Fetch all rules
  const fetchRules = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const rules = await ruleService.getAllRules();
      dispatch({ type: "SET_RULES", payload: rules });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch rules" });
    }
  }, []);

  // ➕ Add new rule
  const addRule = async (rule: Omit<FirewallRule, "id" | "created_at">) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const validationErrors = await ruleService.validateRule(rule);
      if (validationErrors.length > 0)
        throw new Error(validationErrors.join(", "));

      const newRule = await ruleService.createRule(rule);
      dispatch({ type: "ADD_RULE", payload: newRule });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to create rule",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // ✏️ Update existing rule
  const updateRule = async (id: number, rule: Partial<FirewallRule>) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const updatedRule = await ruleService.updateRule(id, rule);
      dispatch({ type: "UPDATE_RULE", payload: updatedRule });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to update rule" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // ❌ Delete rule
  const deleteRule = async (id: number) => {
    try {
      await ruleService.deleteRule(id);
      dispatch({ type: "DELETE_RULE", payload: id });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete rule" });
    }
  };

  const selectRule = (rule: FirewallRule | null) => {
    dispatch({ type: "SELECT_RULE", payload: rule });
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const value: RuleContextType = {
    ...state,
    fetchRules,
    addRule,
    updateRule,
    deleteRule,
    selectRule,
    clearError,
  };

  return (
    <RuleContext.Provider value={value}>{children}</RuleContext.Provider>
  );
};

// ---------------------------------------------------
// 🔌 Hook Export
// ---------------------------------------------------
export const useRule = (): RuleContextType => {
  const context = useContext(RuleContext);
  if (!context)
    throw new Error("useRule must be used within a RuleProvider");
  return context;
};
