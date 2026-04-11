// Arabic Morphosyntactic Explorer - WordItem Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Word } from '@/types';
import { COLORS, getTextAlignment } from '../utils/constants';

interface WordItemProps {
  word: Word;
  onPress: (word: Word) => void;
}

export function WordItem({ word, onPress }: WordItemProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(word)}
    >
      <View style={styles.row}>
        <Text style={[styles.form, { textAlign: getTextAlignment() }]}>
          {word.form}
        </Text>
        <Text style={styles.tag}>{word.tag}</Text>
      </View>
      <View style={styles.features}>
        {word.features.pos && (
          <Text style={styles.feature}>
            {t('morphology.pos')}: {word.features.pos}
          </Text>
        )}
        {word.features.root && (
          <Text style={styles.feature}>
            {t('morphology.root')}: {word.features.root}
          </Text>
        )}
        {word.features.lemma && (
          <Text style={styles.feature}>
            {t('morphology.lemma')}: {word.features.lemma}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  form: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  tag: {
    fontSize: 12,
    color: COLORS.secondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feature: {
    fontSize: 12,
    color: COLORS.text,
  },
});