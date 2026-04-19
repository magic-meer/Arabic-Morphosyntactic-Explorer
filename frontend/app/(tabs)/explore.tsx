import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient, getChapterVerses } from '@/services/api';
import { theme } from '@/constants/theme';
import { buckwalterToArabic } from '@/utils/buckwalter';

interface Verse {
  chapter: number;
  verse: number;
  arabic_text?: string;   // For Search
  verse_text?: string;    // Arabic text from Browse via quran_dataset
  text?: string;          // If mapped differently
  translation?: string;
  transliteration?: string;
  similarity?: number;
  words?: any[];          // For Browse which returns VerseResponse
}

export default function ExploreScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'search' | 'browse'>('browse');
  
  // Search State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  
  // Browse State
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [browseResults, setBrowseResults] = useState<Verse[]>([]);
  
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
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Search failed', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrowse = async (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setLoading(true);
    try {
      // 286 is the max verses in a Surah, fetching all
      const response = await getChapterVerses(surahNumber, 286, 0); 
      setBrowseResults(response.verses);
    } catch (error) {
      console.error('Browse failed', error);
      alert('Failed to load Surah.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial (First surah) on load if mode is browse
  React.useEffect(() => {
    if (mode === 'browse' && browseResults.length === 0) {
      handleBrowse(1);
    }
  }, [mode]);

  const renderVerseItem = ({ item }: { item: Verse }) => {
    // Search returns arabic_text, Browse returns verse_text
    const uthmaniText = item.arabic_text || item.verse_text || '';
    const transliteration = item.transliteration || '';
    const translation = item.translation || '';
    
    // For verse/[id], keep the behavior that splits text by space to construct Words. 
    const navigationText = item.words ? item.words.map(w => buckwalterToArabic(w.form)).join(' ') : uthmaniText;

    return (
      <TouchableOpacity 
        style={styles.verseCard}
        onPress={() => router.push({
          pathname: "/verse/[id]" as any,
          params: { 
            id: `${item.chapter}:${item.verse}`,
            text: navigationText, 
            reference: `${item.chapter}:${item.verse}` 
          }
        })}
      >
        <View style={styles.verseHeader}>
          <Text style={styles.verseReference}>
            Surah {item.chapter}, Ayah {item.verse}
          </Text>
        </View>
        <Text style={styles.arabicText}>{uthmaniText}</Text>
        {transliteration ? <Text style={styles.transliterationText}>{transliteration}</Text> : null}
        {translation ? <Text style={styles.translationText}>{translation}</Text> : null}
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.modeSelector}>
        <TouchableOpacity 
          style={[styles.modeButton, mode === 'browse' && styles.modeButtonActive]} 
          onPress={() => setMode('browse')}
        >
          <Text style={[styles.modeText, mode === 'browse' && styles.modeTextActive]}>Browse / تصفح</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeButton, mode === 'search' && styles.modeButtonActive]} 
          onPress={() => setMode('search')}
        >
          <Text style={[styles.modeText, mode === 'search' && styles.modeTextActive]}>Search / بحث</Text>
        </TouchableOpacity>
      </View>

      {mode === 'search' && (
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
            <Ionicons name="arrow-forward" size={24} color={theme.colors.black} />
          </TouchableOpacity>
        </View>
      )}

      {mode === 'browse' && (
        <View style={styles.browseContainer}>
           <Text style={styles.browseLabel}>Select Surah:</Text>
           <FlatList
             horizontal
             showsHorizontalScrollIndicator={false}
             data={Array.from({ length: 114 }, (_, i) => i + 1)}
             keyExtractor={(item) => item.toString()}
             renderItem={({ item }) => (
               <TouchableOpacity 
                 style={[styles.surahBadge, selectedSurah === item && styles.surahBadgeActive]}
                 onPress={() => handleBrowse(item)}
               >
                 <Text style={[styles.surahBadgeText, selectedSurah === item && styles.surahBadgeTextActive]}>
                   {item}
                 </Text>
               </TouchableOpacity>
             )}
             contentContainerStyle={styles.surahList}
           />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={mode === 'search' ? searchResults : browseResults}
          keyExtractor={(item) => `${item.chapter}:${item.verse}`}
          renderItem={renderVerseItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={theme.colors.surfaceBorder} />
              <Text style={styles.emptyText}>No verses to display</Text>
            </View>
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
  modeSelector: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 211, 61, 0.1)',
  },
  modeText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  modeTextActive: {
    color: theme.colors.primary,
  },
  searchContainer: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  browseContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  browseLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamilies.english,
  },
  surahList: {
    gap: theme.spacing.sm,
  },
  surahBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahBadgeActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  surahBadgeText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  surahBadgeTextActive: {
    color: theme.colors.black,
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
  transliterationText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.english,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  translationText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.english,
    textAlign: 'center',
    fontStyle: 'italic',
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
