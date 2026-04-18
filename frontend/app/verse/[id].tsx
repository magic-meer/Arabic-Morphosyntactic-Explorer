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
import { MorphologyWord } from '@/types/morphology';
import { theme } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VerseDetailScreen() {
  const { id, text, reference } = useLocalSearchParams<{ id: string, text: string, reference: string }>();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MorphologyWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [verseAnalysis, setVerseAnalysis] = useState<MorphologyWord[]>([]);

  // Split verse into words
  const words = text ? text.split(' ') : [];

  const handleWordPress = (wordText: string) => {
    setSelectedWord(wordText);
    // Remove punctuation for matching
    const normalizedTarget = wordText.replace(/[﴿﴾\s]/g, '');
    const found = verseAnalysis.find(a => 
      a.form.replace(/[﴿﴾\s]/g, '') === normalizedTarget
    );
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
      <Stack.Screen options={{ 
        title: reference || 'Verse Detail',
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontFamily: theme.typography.fontFamilies.englishBold }
      }} />
      
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

        {loading && <ActivityIndicator color={theme.colors.primary} style={styles.loader} />}

        {selectedWord && (
          <View style={styles.analysisPanel}>
            <Text style={styles.analysisTitle}>Analysis / تحليل: {selectedWord}</Text>
            {analysis ? (
              <View style={styles.detailsContainer}>
                <DetailRow label="Root / الجذر" value={analysis.features.root || ''} isArabic />
                <DetailRow label="Lemma / اللمة" value={analysis.features.lemma || ''} isArabic />
                <DetailRow label="POS Tag / نوع الكلمة" value={analysis.features.pos || analysis.tag} />
                <DetailRow label="Grammar / الإعراب" value={analysis.tag} />
              </View>
            ) : (
              <Text style={styles.noAnalysisText}>
                {loading ? 'Analyzing... / جارٍ التحليل' : 'No detailed analysis found / لا يوجد تحليل مفصل'}
              </Text>
            )}
          </View>
        )}

        <ChatTutor 
          verseContext={text || ''} 
          reference={reference || ''} 
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  verseContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wordsWrapper: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  analysisPanel: {
    backgroundColor: 'rgba(31, 31, 31, 0.8)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 61, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  analysisTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  detailsContainer: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  arabicValue: {
    fontFamily: theme.typography.fontFamilies.arabicBold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  noAnalysisText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamilies.english,
  },
});
