import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

export const isRTL = I18nManager.isRTL;

export const setRTL = async (shouldBeRTL: boolean) => {
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    
    // Restarting the app to apply changes
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Failed to reload app for RTL changes', error);
    }
  }
};
