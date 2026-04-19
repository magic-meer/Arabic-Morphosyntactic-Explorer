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
import { getVerse, analyzeWord } from '@/services/api';
import { WordInfo } from '@/types/morphology';
import { theme } from '@/constants/theme';
import { formatFeatureValue, FEATURE_LABELS } from '@/utils/morphology';
import { usePreferences } from '@/context/PreferencesContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VerseDetailScreen() {
  const { id, text, reference } = useLocalSearchParams<{ id: string, text: string, reference: string }>();
  const { aiModel } = usePreferences();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WordInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [verseAnalysis, setVerseAnalysis] = useState<WordInfo[]>([]);

  // Split verse into words
  const words = text ? text.split(' ') : [];

  const normalizeForMatch = (t: string) => {
    // Remove common Quranic signs and non-essential chars
    return t.replace(/[﴿﴾\s\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
  };

  const handleWordPress = async (wordText: string) => {
    setSelectedWord(wordText);
    const normalizedTarget = normalizeForMatch(wordText);
    
    // Try exact match first, then normalized match
    const found = verseAnalysis.find(a => 
      a.form === wordText || normalizeForMatch(a.form) === normalizedTarget
    );
    setAnalysis(found || null);

    // Call API for AI explanation (Sarf is already pre-fetched in getVerse)
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const response = await analyzeWord(wordText, aiModel);
      setAiExplanation(response.ai_explanation || null);
    } catch (error) {
      console.error('AI analysis failed', error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      
      const [chapterStr, verseStr] = id.split(':');
      if (!chapterStr || !verseStr) return;

      setLoading(true);
      try {
        const result = await getVerse(parseInt(chapterStr, 10), parseInt(verseStr, 10));
        setVerseAnalysis(result.words);
      } catch (error) {
        console.error('Failed to load verse analysis', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

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
                {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                  const value = analysis.features[key as keyof typeof analysis.features];
                  if (!value || value === 'na' || value === 'N/A') return null;
                  return (
                    <DetailRow 
                      key={key} 
                      label={label} 
                      value={formatFeatureValue(key, value)} 
                      isArabic={key === 'diac' || key === 'root' || key === 'd3seg' || key === 'lex'} 
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noAnalysisText}>
                {loading ? 'Analyzing... / جارٍ التحليل' : 'No detailed analysis found / لا يوجد تحليل مفصل'}
              </Text>
            )}

            {aiLoading ? (
              <View style={styles.aiLoadingContainer}>
                <ActivityIndicator color={theme.colors.primary} size="small" />
                <Text style={styles.aiLoadingText}>AI is thinking...</Text>
              </View>
            ) : aiExplanation ? (
              <View style={styles.explanationSection}>
                <View style={styles.divider} />
                <Text style={styles.explanationTitle}>AI Insight / شرح الذكاء:</Text>
                <Text style={styles.explanationText}>{aiExplanation}</Text>
              </View>
            ) : null}
          </View>
        )}

        <ChatTutor 
          verseContext={text || ''} 
          reference={reference || ''} 
          verseAnalysis={verseAnalysis}
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
  aiLoadingContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  aiLoadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilies.english,
  },
  explanationSection: {
    marginTop: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: theme.spacing.md,
  },
  explanationTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.xs,
  },
  explanationText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
    lineHeight: 20,
  },
});
