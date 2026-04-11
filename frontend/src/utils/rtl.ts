// Arabic Morphosyntactic Explorer - RTL Utilities

import { I18nManager } from 'react-native';
import i18n from '../i18n';

/**
 * Check if current language is RTL (Arabic)
 */
export function isRTL(): boolean {
  return i18n.language === 'ar';
}

/**
 * Set app direction (RTL/LTR)
 */
export function setDirection(): void {
  const isArabic = i18n.language === 'ar';

  if (I18nManager.isRTL !== isArabic) {
    I18nManager.allowRTL(isArabic);
    I18nManager.forceRTL(isArabic);
  }
}

/**
 * Get text alignment based on language
 */
export function getTextAlignment(): 'left' | 'right' {
  return isRTL() ? 'right' : 'left';
}

/**
 * Get flex direction based on language
 */
export function getFlexDirection(): 'row' | 'row-reverse' {
  return isRTL() ? 'row-reverse' : 'row';
}