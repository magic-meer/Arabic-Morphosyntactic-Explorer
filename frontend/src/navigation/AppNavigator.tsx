// Arabic Morphosyntactic Explorer - AppNavigator

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import {
  HomeScreen,
  VerseExplorerScreen,
  MorphologyScreen,
  ChatScreen,
  SettingsScreen,
} from '../screens';
import { SCREENS } from '../utils/constants';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.HOME}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E3A5F',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name={SCREENS.HOME}
          component={HomeScreen}
          options={{ title: t('app.title') }}
        />
        <Stack.Screen
          name={SCREENS.VERSE_EXPLORER}
          component={VerseExplorerScreen}
          options={{ title: t('verses.chapter') }}
        />
        <Stack.Screen
          name={SCREENS.MORPHOLOGY}
          component={MorphologyScreen}
          options={{ title: t('morphology.title') }}
        />
        <Stack.Screen
          name={SCREENS.CHAT}
          component={ChatScreen}
          options={{ title: t('chat.title') }}
        />
        <Stack.Screen
          name={SCREENS.SETTINGS}
          component={SettingsScreen}
          options={{ title: t('settings.title') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}