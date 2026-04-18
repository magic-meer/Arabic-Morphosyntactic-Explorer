import React, { useEffect } from 'react';
import { Stack } from "expo-router";
import { I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  Amiri_400Regular, 
  Amiri_700Bold 
} from '@expo-google-fonts/amiri';
import { 
  Inter_400Regular, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    // Force RTL for Arabic support
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      // Note: In a real app, you might want to reload here if it's the first time
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Inter_700Bold',
        },
        contentStyle: {
          backgroundColor: '#121212',
        }
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}
