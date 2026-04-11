// Arabic Morphosyntactic Explorer - HomeScreen

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SCREENS } from '../utils/constants';
import { SearchBar } from '../components/SearchBar';

type HomeScreenNavigationProp = StackNavigationProp<any, 'Home'>;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleSearch = (query: string) => {
    navigation.navigate(SCREENS.VERSE_EXPLORER, { query });
  };

  const navigateTo = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.title')}</Text>
        <Text style={styles.subtitle}>{t('app.subtitle')}</Text>
      </View>

      <SearchBar onSearch={handleSearch} />

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo(SCREENS.VERSE_EXPLORER)}
        >
          <Text style={styles.menuText}>{t('home.browseChapters')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo(SCREENS.MORPHOLOGY)}
        >
          <Text style={styles.menuText}>{t('home.randomVerse')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo(SCREENS.CHAT)}
        >
          <Text style={styles.menuText}>{t('home.aiTutor')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 8,
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});