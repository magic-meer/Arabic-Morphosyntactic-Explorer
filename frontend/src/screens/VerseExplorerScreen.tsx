// Arabic Morphosyntactic Explorer - VerseExplorerScreen

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useApi } from '../services/api';
import { VerseCard, LoadingSpinner } from '../components';
import { COLORS } from '../utils/constants';
import type { Verse } from '../types';

type RouteParams = {
  VerseExplorer: { query?: string; chapter?: number };
};

export function VerseExplorerScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RouteParams, 'VerseExplorer'>>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const api = useApi();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapters] = useState(Array.from({ length: 114 }, (_, i) => i + 1));

  useEffect(() => {
    if (route.params?.query) {
      searchVerses(route.params.query);
    } else if (route.params?.chapter) {
      loadChapter(route.params.chapter);
    } else {
      setLoading(false);
    }
  }, [route.params]);

  const searchVerses = async (query: string) => {
    setLoading(true);
    try {
      const results = await api.searchVerses({ query, n_results: 20 });
      // Transform search results to verses - they have different structure
      setVerses(
        results.map((r) => ({
          chapter: r.chapter,
          verse: r.verse,
          verse_text: r.arabic_text,
          words: [],
        }))
      );
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (chapter: number) => {
    setLoading(true);
    try {
      const data = await api.getChapterVerses(chapter, 50, 0);
      setVerses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersePress = (verse: Verse) => {
    navigation.navigate('Morphology', {
      chapter: verse.chapter,
      verse: verse.verse,
    });
  };

  const renderChapterItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => loadChapter(item)}
    >
      <Text style={styles.chapterNumber}>{item}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (verses.length === 0) {
    return (
      <View style={styles.chaptersContainer}>
        <Text style={styles.sectionTitle}>{t('verses.chapter')}</Text>
        <FlatList
          data={chapters}
          renderItem={renderChapterItem}
          keyExtractor={(item) => item.toString()}
          numColumns={6}
          contentContainerStyle={styles.chaptersGrid}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={verses}
      keyExtractor={(item) => `${item.chapter}:${item.verse}`}
      renderItem={({ item }) => (
        <VerseCard verse={item} onPress={handleVersePress} />
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('verses.noResults')}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  chaptersContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  chaptersGrid: {
    paddingBottom: 16,
  },
  chapterItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '15%',
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.secondary,
    padding: 16,
  },
});