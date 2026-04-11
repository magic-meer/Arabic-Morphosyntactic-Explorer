// Arabic Morphosyntactic Explorer - MorphologyScreen

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useApi } from '../services/api';
import { WordItem, LoadingSpinner } from '../components';
import { COLORS } from '../utils/constants';
import type { MorphologyWord } from '../types';

type RouteParams = {
  Morphology: { chapter: number; verse: number };
};

export function MorphologyScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RouteParams, 'Morphology'>>();
  const api = useApi();

  const [words, setWords] = useState<MorphologyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [verseText, setVerseText] = useState<string>('');

  const { chapter, verse } = route.params;

  useEffect(() => {
    loadMorphology();
  }, [chapter, verse]);

  const loadMorphology = async () => {
    setLoading(true);
    try {
      const data = await api.getMorphology(chapter, verse);
      setWords(data.words || []);
      setVerseText(data.words?.map((w) => w.form).join(' ') || '');
    } catch (error) {
      console.error('Failed to load morphology:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWordPress = (word: MorphologyWord) => {
    // Could navigate to detailed word analysis
    console.log('Word pressed:', word);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.verseHeader}>
        <Text style={styles.reference}>
          {t('verses.chapter')} {chapter} {t('verses.verse')} {verse}
        </Text>
        <Text style={styles.verseText}>{verseText}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t('morphology.title')}</Text>

      <FlatList
        data={words}
        keyExtractor={(item, index) => `${item.form}-${index}`}
        renderItem={({ item }) => (
          <WordItem
            word={{
              form: item.form,
              tag: item.tag,
              lemma: item.features.lemma,
              root: item.features.root,
              features: item.features,
            }}
            onPress={handleWordPress}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  verseHeader: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  reference: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    padding: 16,
  },
  list: {
    paddingBottom: 16,
  },
});