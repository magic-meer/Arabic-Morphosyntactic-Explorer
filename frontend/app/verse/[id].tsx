import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Word } from '@/components/Word';
import { ChatTutor } from '@/components/ChatTutor';
import { analyzeVerse } from '@/services/api';
import { MorphologyAnalysis, MorphologyWord } from '@/types/morphology';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VerseDetailScreen() {
  const { id, text, reference } = useLocalSearchParams<{ id: string, text: string, reference: string }>();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MorphologyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [verseAnalysis, setVerseAnalysis] = useState<MorphologyAnalysis[]>([]);

  // Split verse into words
  const words = text ? text.split(' ') : [];

  const handleWordPress = (wordText: string) => {
    setSelectedWord(wordText);
    const found = verseAnalysis.find(a => a.word === wordText);
    setAnalysis(found || null);
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!text) return;
      setLoading(true);
      try {
        const result = await analyzeVerse(text);
        setVerseAnalysis(result.words);
      } catch (error) {
        console.error('Failed to load verse analysis', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [text]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: reference || 'Verse Detail' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.verseContainer}>
          <View style={styles.wordsWrapper}>
            {words.map((word, index) => (
              <Word 
                key={`${word}-${index}`} 
                text={word} 
                onPress={handleWordPress}
                isSelected={selectedWord === word}
              />
            ))}
          </View>
        </View>

        {loading && <ActivityIndicator color="#ffd33d" style={styles.loader} />}

        {selectedWord && (
          <View style={styles.analysisPanel}>
            <Text style={styles.analysisTitle}>Analysis / تحليل: {selectedWord}</Text>
            {analysis ? (
              <View style={styles.detailsContainer}>
                <DetailRow label="Root / الجذر" value={analysis.top_analysis.root} isArabic />
                <DetailRow label="Lemma / اللمة" value={analysis.top_analysis.lemma} isArabic />
                <DetailRow label="POS Tag / نوع الكلمة" value={analysis.top_analysis.pos} />
                <DetailRow label="Grammar / الإعراب" value={analysis.top_analysis.tag} />
              </View>
            ) : (
              <Text style={styles.noAnalysisText}>
                {loading ? 'Analyzing... / جارٍ التحليل' : 'No detailed analysis found / لا يوجد تحليل مفصل'}
              </Text>
            )}
          </View>
        )}

        <ChatTutor 
          verseContext={text} 
          reference={reference} 
        />
      </ScrollView>
    </View>
  );
}

const DetailRow = ({ label, value, isArabic }: { label: string, value: string, isArabic?: boolean }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, isArabic && styles.arabicValue]}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
  },
  verseContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  wordsWrapper: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  analysisPanel: {
    backgroundColor: 'rgba(31, 31, 31, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 61, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  analysisTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  detailLabel: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  arabicValue: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 20,
    color: '#ffd33d',
  },
  loader: {
    marginVertical: 20,
  },
  noAnalysisText: {
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});
