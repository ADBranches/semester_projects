import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { FirewallRule } from '../types';
import { ruleService } from '../services/ruleService';

interface RuleState {
  rules: FirewallRule[];
  loading: boolean;
  error: string | null;
  selectedRule: FirewallRule | null;
}

type RuleAction =
  | { type: 'SET_RULES'; payload: FirewallRule[] }
  | { type: 'ADD_RULE'; payload: FirewallRule }
  | { type: 'UPDATE_RULE'; payload: FirewallRule }
  | { type: 'DELETE_RULE'; payload: number }
  | { type: 'SELECT_RULE'; payload: FirewallRule | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const ruleReducer = (state: RuleState, action: RuleAction): RuleState => {
  switch (action.type) {
    case 'SET_RULES':
      return { ...state, rules: action.payload, loading: false };
    case 'ADD_RULE':
      return { ...state, rules: [action.payload, ...state.rules] };
    case 'UPDATE_RULE':
      return { ...state, rules: state.rules.map(r => (r.id === action.payload.id ? action.payload : r)) };
    case 'DELETE_RULE':
      return { ...state, rules: state.rules.filter(r => r.id !== action.payload) };
    case 'SELECT_RULE':
      return { ...state, selectedRule: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
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

interface RuleContextType extends RuleState {
  fetchRules: () => Promise<void>;
  createRule: (rule: Omit<FirewallRule, 'id' | 'created_at'>) => Promise<void>;
  updateRule: (id: number, rule: Partial<FirewallRule>) => Promise<void>;
  deleteRule: (id: number) => Promise<void>;
  selectRule: (rule: FirewallRule | null) => void;
  clearError: () => void;
}

const RuleContext = createContext<RuleContextType | undefined>(undefined);

export const RuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(ruleReducer, initialState);

  // ✅ Memoized fetchRules to prevent re-creation on every render
  const fetchRules = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rules = await ruleService.getAllRules();
      dispatch({ type: 'SET_RULES', payload: rules });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch rules' });
    }
  }, []);

  const createRule = async (rule: Omit<FirewallRule, 'id' | 'created_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const validationErrors = await ruleService.validateRule(rule);
      if (validationErrors.length > 0) throw new Error(validationErrors.join(', '));

      const newRule = await ruleService.createRule(rule);
      dispatch({ type: 'ADD_RULE', payload: newRule });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to create rule',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteRule = async (id: number) => {
    try {
      await ruleService.deleteRule(id);
      dispatch({ type: 'DELETE_RULE', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete rule' });
    }
  };

  const selectRule = (rule: FirewallRule | null) => {
    dispatch({ type: 'SELECT_RULE', payload: rule });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // ✅ Only runs once — no infinite re-renders
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const value: RuleContextType = {
    ...state,
    fetchRules,
    createRule,
    deleteRule,
    selectRule,
    clearError,
    updateRule: async () => {},
  };

  return <RuleContext.Provider value={value}>{children}</RuleContext.Provider>;
};

export const useRule = (): RuleContextType => {
  const context = useContext(RuleContext);
  if (context === undefined) {
    throw new Error('useRule must be used within a RuleProvider');
  }
  return context;
};
