import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyzeWord, WordAnalysisResponse } from '@/services/api';
import { theme } from '@/constants/theme';

const FEATURE_LABELS: Record<string, string> = {
  diac: 'Diacritized / مُشَكَّل',
  root: 'Root / الجذر',
  lex: 'Lemma / المصدر',
  pos: 'POS / نوع الكلمة',
  pattern: 'Pattern / الوزن',
  gloss: 'Meaning / المعنى',
  gen: 'Gender / الجنس',
  num: 'Number / العدد',
  cas: 'Case / الحالة',
  mod: 'Mood / الصيغة',
  vox: 'Voice / المبني',
  asp: 'Aspect / الزمن',
  per: 'Person / الشخص',
  d3seg: 'Segmentation / التقطيع',
  bw: 'Buckwalter',
};

export default function HomeScreen() {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WordAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setResult(null);
    Keyboard.dismiss();
    try {
      const response = await analyzeWord(word.trim());
      setResult(response);
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Analysis failed. Please check the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const firstAnalysis = result?.analyses?.[0];
  const hasError = firstAnalysis && 'error' in firstAnalysis;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Arabic Explorer</Text>
        <Text style={styles.subtitle}>مستكشف الصرف والنحو العربي</Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Enter an Arabic word / أدخل كلمة عربية</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. كتب"
          placeholderTextColor={theme.colors.textSecondary}
          value={word}
          onChangeText={setWord}
          onSubmitEditing={handleAnalyze}
          textAlign="right"
        />
        <TouchableOpacity
          style={[styles.analyzeButton, (!word.trim() || loading) && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={loading || !word.trim()}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.black} />
          ) : (
            <>
              <Ionicons name="flask" size={20} color={theme.colors.black} />
              <Text style={styles.analyzeButtonText}>Analyze / حلّل</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Analyzing with CAMeL Tools & AI...</Text>
        </View>
      )}

      {result && !hasError && firstAnalysis && (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Morphological Analysis (صرف)</Text>
            </View>
            {Object.entries(FEATURE_LABELS).map(([key, label]) => {
              const value = firstAnalysis[key];
              if (!value || value === 'na' || value === 'N/A') return null;
              return (
                <View key={key} style={styles.featureRow}>
                  <Text style={styles.featureLabel}>{label}</Text>
                  <Text style={[
                    styles.featureValue,
                    (key === 'diac' || key === 'root' || key === 'd3seg') && styles.arabicValue,
                  ]}>
                    {value}
                  </Text>
                </View>
              );
            })}

            {result.analyses.length > 1 && (
              <Text style={styles.candidateCount}>
                +{result.analyses.length - 1} more analysis candidate(s)
              </Text>
            )}
          </View>

          {result.ai_explanation ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>AI Explanation (شرح)</Text>
              </View>
              <Text style={styles.aiText}>{result.ai_explanation}</Text>
            </View>
          ) : null}
        </>
      )}

      {result && hasError && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
          <Text style={styles.errorText}>{firstAnalysis?.error || 'Analysis failed'}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 60,
  },
  header: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilies.englishBold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilies.arabic,
  },
  inputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamilies.english,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilies.arabic,
    fontSize: theme.typography.sizes.xxl,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: theme.colors.black,
    fontFamily: theme.typography.fontFamilies.englishBold,
    fontSize: theme.typography.sizes.md,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamilies.english,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  featureLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
    flex: 1,
  },
  featureValue: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilies.englishBold,
    flex: 1,
    textAlign: 'right',
  },
  arabicValue: {
    fontFamily: theme.typography.fontFamilies.arabic,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
  },
  candidateCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilies.english,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  aiText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilies.english,
    lineHeight: 22,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: theme.typography.fontFamilies.english,
    fontSize: theme.typography.sizes.sm,
    flex: 1,
  },
});
