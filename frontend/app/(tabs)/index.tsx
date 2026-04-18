import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  const handleQuickAction = (route: string) => {
    // Navigation to tabs
    router.push(`/(tabs)/${route}` as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Arabic Explorer</Text>
        <Text style={styles.subtitle}>مستكشف الصرف والنحو العربي</Text>
      </View>

      <View style={styles.verseOfTheDayContainer}>
        <View style={styles.verseHeader}>
          <Ionicons name="book" size={20} color={theme.colors.primary} />
          <Text style={styles.verseTitle}>Verse of the Day</Text>
        </View>
        <Text style={styles.arabicText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <Text style={styles.translationText}>In the name of Allah, the Entirely Merciful, the Especially Merciful.</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => handleQuickAction('analyzer')}>
          <Ionicons name="search" size={32} color={theme.colors.primary} />
          <Text style={styles.actionTitle}>Analyze Text</Text>
          <Text style={styles.actionDescription}>Parse morphology and syntax</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => handleQuickAction('chat')}>
          <Ionicons name="chatbubbles" size={32} color={theme.colors.primary} />
          <Text style={styles.actionTitle}>AI Tutor</Text>
          <Text style={styles.actionDescription}>Ask questions about Arabic</Text>
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
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.arabic,
  },
  verseOfTheDayContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  verseTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  arabicText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamilies.arabic,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  translationText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
    textAlign: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginTop: theme.spacing.sm,
  },
  actionDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilies.english,
    textAlign: 'center',
  },
});
