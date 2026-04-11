// Arabic Morphosyntactic Explorer - LoadingSpinner Component

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
}

export function LoadingSpinner({ size = 'large', message }: LoadingSpinnerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message !== undefined ? (
        <Text style={styles.message}>{message}</Text>
      ) : (
        <Text style={styles.message}>{t('common.loading')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.secondary,
  },
});