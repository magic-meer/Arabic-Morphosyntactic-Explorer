import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyzeVerse } from '@/services/api';
import { MorphologyWord } from '@/types/morphology';
import { theme } from '@/constants/theme';
import { Word } from '@/components/Word';

export default function AnalyzerScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MorphologyWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<MorphologyWord | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    Keyboard.dismiss();
    setAnalysisResult([]);
    setSelectedWord(null);

    try {
      const response = await analyzeVerse(text);
      setAnalysisResult(response.words);
    } catch (error) {
      console.error('Failed to analyze text', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWordPress = (wordText: string) => {
    const normalizedTarget = wordText.replace(/[﴿﴾\s.,!؟]/g, '');
    const found = analysisResult.find(a => 
      a.form.replace(/[﴿﴾\s.,!؟]/g, '') === normalizedTarget
    );
    setSelectedWord(found || null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Text Analyzer</Text>
        <Text style={styles.subtitle}>محلل النصوص</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Arabic text here... / أدخل النص العربي هنا..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          value={text}
          onChangeText={setText}
          textAlign="right"
        />
        <TouchableOpacity 
          style={styles.analyzeButton} 
          onPress={handleAnalyze} 
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.black} />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze / تحليل</Text>
          )}
        </TouchableOpacity>
      </View>

      {analysisResult.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Tokens / الكلمات</Text>
          <View style={styles.wordsWrapper}>
            {analysisResult.map((wordObj, index) => (
              <Word 
                key={`${wordObj.form}-${index}`} 
                text={wordObj.form} 
                onPress={handleWordPress}
                isSelected={selectedWord?.form === wordObj.form}
              />
            ))}
          </View>

          {selectedWord && (
            <View style={styles.analysisPanel}>
              <Text style={styles.analysisTitle}>Analysis / تحليل: {selectedWord.form}</Text>
              <View style={styles.detailsContainer}>
                <DetailRow label="Root / الجذر" value={selectedWord.features.root || ''} isArabic />
                <DetailRow label="Lemma / اللمة" value={selectedWord.features.lemma || ''} isArabic />
                <DetailRow label="POS Tag / نوع الكلمة" value={selectedWord.features.pos || selectedWord.tag} />
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
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
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.arabic,
    marginTop: theme.spacing.xs,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilies.arabic,
    fontSize: theme.typography.sizes.lg,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
  },
  analyzeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: theme.colors.black,
    fontFamily: theme.typography.fontFamilies.englishBold,
    fontSize: theme.typography.sizes.md,
  },
  resultsContainer: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.md,
  },
  wordsWrapper: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.lg,
  },
  analysisPanel: {
    backgroundColor: 'rgba(31, 31, 31, 0.8)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 61, 0.2)',
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
});
