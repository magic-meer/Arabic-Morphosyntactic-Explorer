// Arabic Morphosyntactic Explorer - Main App Entry Point

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useAppSettings } from './context/AppContext';
import { AppNavigator } from './navigation/AppNavigator';
import './i18n'; // Initialize i18n
import { setDirection } from './utils/rtl';

function AppContent() {
  const { settings } = useAppSettings();

  useEffect(() => {
    setDirection();
  }, [settings.language]);

  return (
    <>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}