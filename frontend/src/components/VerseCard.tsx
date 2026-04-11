// Arabic Morphosyntactic Explorer - VerseCard Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Verse } from '@/types';
import { COLORS, getTextAlignment } from '../utils/constants';

interface VerseCardProps {
  verse: Verse;
  onPress: (verse: Verse) => void;
}

export function VerseCard({ verse, onPress }: VerseCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(verse)}
    >
      <View style={styles.header}>
        <Text style={styles.reference}>
          {t('verses.chapter')} {verse.chapter}:{verse.verse}
        </Text>
      </View>
      <Text
        style={[styles.preview, { textAlign: getTextAlignment() }]}
        numberOfLines={2}
      >
        {verse.words?.map((w) => w.form).join(' ') || verse.verse_text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  preview: {
    fontSize: 16,
    color: COLORS.text,
  },
});