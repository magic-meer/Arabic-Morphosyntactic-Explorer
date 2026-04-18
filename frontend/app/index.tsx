import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { apiClient } from '@/services/api';

interface Verse {
  chapter: number;
  verse: number;
  arabic_text: string;
  translation?: string;
  similarity: number;
}

export default function SearchScreen() {
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
        pathname: "/verse/[id]",
        params: { 
          id: `${item.chapter}:${item.verse}`,
          text: item.arabic_text, 
          reference: `${item.chapter}:${item.verse}` 
        }
      })}
    >
      <View style={styles.verseHeader}>
        <Text style={styles.verseReference}>
          {item.chapter}:{item.verse}
        </Text>
      </View>
      <Text style={styles.arabicText}>{item.arabic_text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Explorer / مستكشف' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>
          Arabic Morphosyntactic Explorer
        </Text>
        <Text style={styles.subtitle}>
          مستكشف الصرف والنحو العربي
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search verse or Surah:Ayah / ابحث عن آية"
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.searchButtonText}>Search / بحث</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ffd33d" style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.chapter}:${item.verse}`}
          renderItem={renderVerseItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            query && !loading ? (
              <Text style={styles.emptyText}>No results found</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontFamily: 'Amiri_400Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  searchContainer: {
    padding: 20,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  searchButton: {
    backgroundColor: '#ffd33d',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd33d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  listContent: {
    padding: 16,
  },
  verseCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verseReference: {
    color: '#ffd33d',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  arabicText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Amiri_400Regular',
    textAlign: 'right',
    lineHeight: 36,
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Inter_400Regular',
  },
});
