import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';

interface PreferencesContextType {
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => void;
  isArabicUI: boolean;
  toggleArabicUI: (value: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isArabicUI, setIsArabicUI] = useState(I18nManager.isRTL);

  const toggleDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };

  const toggleArabicUI = (value: boolean) => {
    setIsArabicUI(value);
    
    // Changing RTL usually requires an app restart in React Native
    if (value !== I18nManager.isRTL) {
      I18nManager.allowRTL(value);
      I18nManager.forceRTL(value);
      alert('Language changed. Please restart the app for the RTL layout changes to fully take effect.');
    }
  };

  return (
    <PreferencesContext.Provider value={{ isDarkMode, toggleDarkMode, isArabicUI, toggleArabicUI }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
