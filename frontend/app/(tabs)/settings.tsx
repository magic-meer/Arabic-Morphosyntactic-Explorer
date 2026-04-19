import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { usePreferences } from '@/context/PreferencesContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, isArabicUI, toggleArabicUI, aiModel, setAiModel } = usePreferences();

  return (
    <ScrollView style={[styles.container, !isDarkMode && styles.containerLight]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, !isDarkMode && styles.textLight]}>Settings</Text>
        <Text style={styles.subtitle}>الإعدادات</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={[styles.settingRow, !isDarkMode && styles.surfaceLight]}>
          <View style={styles.settingInfo}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={isDarkMode ? theme.colors.text : '#000'} />
            <Text style={[styles.settingLabel, !isDarkMode && styles.textLight]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>

        <View style={[styles.settingRow, !isDarkMode && styles.surfaceLight]}>
          <View style={styles.settingInfo}>
            <Ionicons name="language" size={24} color={isDarkMode ? theme.colors.text : '#000'} />
            <Text style={[styles.settingLabel, !isDarkMode && styles.textLight]}>Arabic Interface (RTL)</Text>
          </View>
          <Switch
            value={isArabicUI}
            onValueChange={toggleArabicUI}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Model</Text>
        <Text style={styles.sectionDescription}>Select the Gemini engine for analysis</Text>
        
        {[
          { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite', note: 'Balanced & Fast (Default)' },
          { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'Stable Performance' },
          { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', note: 'Ultra Low Latency' }
        ].map((model) => (
          <TouchableOpacity 
            key={model.id}
            style={[
              styles.modelRow, 
              !isDarkMode && styles.surfaceLight,
              aiModel === model.id && styles.modelSelected
            ]}
            onPress={() => setAiModel(model.id)}
          >
            <View style={styles.modelInfo}>
              <Text style={[
                styles.modelLabel, 
                !isDarkMode && styles.textLight,
                aiModel === model.id && styles.modelLabelSelected
              ]}>
                {model.label}
              </Text>
              <Text style={styles.modelNote}>{model.note}</Text>
            </View>
            {aiModel === model.id && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={[styles.settingRow, !isDarkMode && styles.surfaceLight]}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle" size={24} color={isDarkMode ? theme.colors.text : '#000'} />
            <Text style={[styles.settingLabel, !isDarkMode && styles.textLight]}>Version Info</Text>
          </View>
          <Text style={styles.settingValue}>1.0.1</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, !isDarkMode && styles.surfaceLight]}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text" size={24} color={isDarkMode ? theme.colors.text : '#000'} />
            <Text style={[styles.settingLabel, !isDarkMode && styles.textLight]}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  surfaceLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
  },
  textLight: {
    color: '#000000',
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.arabic,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.english,
  },
  settingValue: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
  },
  sectionDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
    marginBottom: theme.spacing.md,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  modelSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10', // 10% opacity
  },
  modelInfo: {
    flex: 1,
  },
  modelLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  modelLabelSelected: {
    color: theme.colors.primary,
  },
  modelNote: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilies.english,
    marginTop: 2,
  },
});
