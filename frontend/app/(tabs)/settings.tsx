import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isArabicUI, setIsArabicUI] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>الإعدادات</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color={theme.colors.text} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="language" size={24} color={theme.colors.text} />
            <Text style={styles.settingLabel}>Arabic Interface</Text>
          </View>
          <Switch
            value={isArabicUI}
            onValueChange={setIsArabicUI}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle" size={24} color={theme.colors.text} />
            <Text style={styles.settingLabel}>Version Info</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text" size={24} color={theme.colors.text} />
            <Text style={styles.settingLabel}>Terms of Service</Text>
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
});
