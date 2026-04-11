// Arabic Morphosyntactic Explorer - App Context for State Management

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Language, Theme, AppSettings } from '@/types';

// ============================================================================
// Default Settings
// ============================================================================

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  apiBaseUrl: 'http://localhost:8000',
};

// ============================================================================
// Action Types
// ============================================================================

type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_API_URL'; payload: string }
  | { type: 'RESET_SETTINGS' };

// ============================================================================
// Reducer
// ============================================================================

function settingsReducer(state: AppSettings, action: Action): AppSettings {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_API_URL':
      return { ...state, apiBaseUrl: action.payload };
    case 'RESET_SETTINGS':
      return defaultSettings;
    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface AppContextType {
  settings: AppSettings;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);

  return (
    <AppContext.Provider value={{ settings, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================================
// Hook
export function useAppSettings(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppProvider');
  }
  return context;
}