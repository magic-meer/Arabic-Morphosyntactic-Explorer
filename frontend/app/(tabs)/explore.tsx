import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '@/services/api';
import { theme } from '@/constants/theme';

interface Verse {
  chapter: number;
  verse: number;
  arabic_text: string;
  translation?: string;
  similarity: number;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const response = await apiClient.post('/verses/search', {
        query: query,
        n_results: 10
      });
      setResults(response.data.results);
    } catch (error) {
      console.error('Search failed', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVerseItem = ({ item }: { item: Verse }) => (
    <TouchableOpacity 
      style={styles.verseCard}
      onPress={() => router.push({
        pathname: "/verse/[id]" as any,
        params: { 
          id: `${item.chapter}:${item.verse}`,
          text: item.arabic_text, 
          reference: `${item.chapter}:${item.verse}` 
        }
      })}
    >
      <View style={styles.verseHeader}>
        <Text style={styles.verseReference}>
          Surah {item.chapter}, Ayah {item.verse}
        </Text>
      </View>
      <Text style={styles.arabicText}>{item.arabic_text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search Quran..."
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.black} />
          ) : (
            <Ionicons name="arrow-forward" size={24} color={theme.colors.black} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.chapter}:${item.verse}`}
          renderItem={renderVerseItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            query && !loading ? (
              <Text style={styles.emptyText}>No verses found</Text>
            ) : (
               <View style={styles.emptyContainer}>
                  <Ionicons name="book-outline" size={48} color={theme.colors.surfaceBorder} />
                  <Text style={styles.emptyText}>Search for a verse or Surah:Ayah</Text>
               </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilies.english,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    width: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  verseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  verseHeader: {
    marginBottom: theme.spacing.sm,
  },
  verseReference: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilies.englishBold,
    fontSize: theme.typography.sizes.sm,
  },
  arabicText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilies.arabic,
    textAlign: 'center',
    lineHeight: 36,
  },
  loader: {
    marginTop: theme.spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamilies.english,
    fontSize: theme.typography.sizes.md,
  },
});
