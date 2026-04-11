// Arabic Morphosyntactic Explorer - SettingsScreen

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '../context/AppContext';
import { COLORS } from '../utils/constants';
import type { Language, Theme } from '../types';

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { settings, dispatch } = useAppSettings();

  const handleLanguageChange = (language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
    i18n.changeLanguage(language);
  };

  const handleThemeChange = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity
          style={[
            styles.option,
            settings.language === 'en' && styles.optionSelected,
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={styles.optionText}>{t('settings.english')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.option,
            settings.language === 'ar' && styles.optionSelected,
          ]}
          onPress={() => handleLanguageChange('ar')}
        >
          <Text style={styles.optionText}>{t('settings.arabic')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <TouchableOpacity
          style={[
            styles.option,
            settings.theme === 'light' && styles.optionSelected,
          ]}
          onPress={() => handleThemeChange('light')}
        >
          <Text style={styles.optionText}>{t('settings.light')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.option,
            settings.theme === 'dark' && styles.optionSelected,
          ]}
          onPress={() => handleThemeChange('dark')}
        >
          <Text style={styles.optionText}>{t('settings.dark')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.about}>
          <Text style={styles.aboutText}>{t('app.title')}</Text>
          <Text style={styles.versionText}>
            {t('settings.version')}: 1.0.0
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  option: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  about: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
  },
  aboutText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 4,
  },
});