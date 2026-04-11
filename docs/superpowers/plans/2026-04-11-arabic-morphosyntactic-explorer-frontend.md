# Arabic Morphosyntactic Explorer - Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build React Native/Expo frontend with RTL support, bilingual UI, and full API integration for Quranic morphological analysis and AI tutoring

**Architecture:** Expo React Native app with TypeScript, React Navigation for routing, i18next for internationalization (Arabic + English), and axios for API calls

**Tech Stack:** React Native (Expo), TypeScript, React Navigation 6.x, i18next, axios, expo-localization

---

## File Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── VerseCard.tsx
│   │   ├── WordItem.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── screens/         # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── VerseExplorerScreen.tsx
│   │   ├── MorphologyScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── services/         # API client
│   │   └── api.ts
│   │
│   ├── hooks/           # Custom hooks
│   │   ├── useVerses.ts
│   │   ├── useMorphology.ts
│   │   ├── useChat.ts
│   │   └── useSettings.ts
│   │
│   ├── i18n/           # Internationalization
│   │   ├── index.ts
│   │   ├── en.json
│   │   └── ar.json
│   │
│   ├── utils/           # Utilities
│   │   ├── rtl.ts
│   │   └── constants.ts
│   │
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   │
│   ├── context/         # React Context
│   │   └── AppContext.tsx
│   │
│   └── navigation/       # Navigation config
│       └── AppNavigator.tsx
│
├── app.json             # Expo config
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## Task 1: Project Setup

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/app.json`
- Create: `frontend/babel.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "arabic-morphosyntactic-explorer",
  "version": "1.0.0",
  "main": "src/navigation/AppNavigator.tsx",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/stack": "^7.0.0",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "~4.14.0",
    "axios": "^1.7.0",
    "i18next": "^24.0.0",
    "react-i18next": "^15.0.0",
    "expo-localization": "~16.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0"
  },
  "private": true
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

- [ ] **Step 3: Create app.json**

```json
{
  "expo": {
    "name": "Arabic Morphosyntactic Explorer",
    "slug": "arabic-morphosyntactic-explorer",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.arabicmorphosyntactic.explorer"
    },
    "android": {
      "package": "com.arabicmorphosyntactic.explorer",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "API_BASE_URL": "http://localhost:8000"
    }
  }
}
```

- [ ] **Step 4: Create babel.config.js**

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/tsconfig.json frontend/app.json frontend/babel.config.js
git commit -m "feat: Add Expo project configuration"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `frontend/src/types/index.ts`

- [ ] **Step 1: Create types/index.ts**

```typescript
// Verse types
export interface Verse {
  chapter: number;
  verse: number;
  words: Word[];
  verse_text?: string;
}

export interface Word {
  form: string;
  tag: string;
  lemma: string | null;
  root: string | null;
  features: WordFeatures;
}

export interface WordFeatures {
  pos: string | null;
  lemma: string | null;
  root: string | null;
  gender: string | null;
  number: string | null;
  case: string | null;
  mood: string | null;
  voice: string | null;
  aspect: string | null;
  person: string | null;
}

// Morphology types
export interface MorphologyResponse {
  chapter: number;
  verse: number;
  words: MorphologyWord[];
}

export interface MorphologyWord {
  form: string;
  tag: string;
  features: WordFeatures;
  original_features: Record<string, string>;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  context_verses?: ContextVerse[];
  timestamp: number;
}

export interface ContextVerse {
  chapter: number;
  verse: number;
  text: string;
  relevance: number;
}

export interface ChatRequest {
  message: string;
  include_verses?: boolean;
  context_verses?: ContextVerse[];
}

export interface ChatResponse {
  response: string;
  context_verses: ContextVerse[];
  cached: boolean;
}

// Search types
export interface SearchResult {
  chapter: number;
  verse: number;
  arabic_text: string;
  translation: string | null;
  similarity: number;
}

export interface VerseSearchRequest {
  query: string;
  n_results?: number;
  chapter?: number;
}

// Settings types
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: Theme;
  apiBaseUrl: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: Add TypeScript type definitions"
```

---

## Task 3: Context & State Management

**Files:**
- Create: `frontend/src/context/AppContext.tsx`

- [ ] **Step 1: Create AppContext.tsx**

```typescript
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Language, Theme, AppSettings } from '../types';

// Default settings
const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  apiBaseUrl: 'http://localhost:8000',
};

// Action types
type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_API_URL'; payload: string }
  | { type: 'RESET_SETTINGS' };

// Reducer
function settingsReducer(state: AppSettings, action: Action): AppSettings {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_API_URL':
      return { ...state, apiBaseUrl: action.payload };
    case 'RESET_SETTINGS':
      return defaultSettings;
    default:
      return state;
  }
}

// Context
interface AppContextType {
  settings: AppSettings;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);

  return (
    <AppContext.Provider value={{ settings, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppSettings() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/context/AppContext.tsx
git commit -m "feat: Add App Context for state management"
```

---

## Task 4: API Service

**Files:**
- Create: `frontend/src/services/api.ts`

- [ ] **Step 1: Create api.ts**

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Verse,
  MorphologyResponse,
  ChatRequest,
  ChatResponse,
  VerseSearchRequest,
  SearchResult,
} from '../types';
import { useAppSettings } from '../context/AppContext';

class ApiService {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setBaseUrl(url: string) {
    this.client.defaults.baseURL = url;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await this.client.get('/api/v1/health');
    return response.data;
  }

  // Get verse
  async getVerse(chapter: number, verse: number): Promise<Verse> {
    const response = await this.client.get(`/api/v1/verses/${chapter}/${verse}`);
    return response.data;
  }

  // Get chapter verses
  async getChapterVerses(chapter: number, limit?: number, offset?: number): Promise<any> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const response = await this.client.get(`/api/v1/verses/${chapter}?${params}`);
    return response.data;
  }

  // Search verses
  async searchVerses(request: VerseSearchRequest): Promise<SearchResult[]> {
    const response = await this.client.post('/api/v1/verses/search', request);
    return response.data.results;
  }

  // Get morphology
  async getMorphology(chapter: number, verse: number): Promise<MorphologyResponse> {
    const response = await this.client.get(`/api/v1/morphology/${chapter}/${verse}`);
    return response.data;
  }

  // Analyze text
  async analyzeText(text: string): Promise<any> {
    const response = await this.client.post('/api/v1/morphology/analyze', { text });
    return response.data;
  }

  // Chat
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/api/v1/chat', request);
    return response.data;
  }
}

// Create API instance (will be configured with settings)
let apiService: ApiService | null = null;

export function useApi(): ApiService {
  const { settings } = useAppSettings();
  
  if (!apiService || apiService['client'].defaults.baseURL !== settings.apiBaseUrl) {
    apiService = new ApiService(settings.apiBaseUrl);
  }
  
  return apiService;
}

export default ApiService;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/api.ts
git commit -m "feat: Add API service for backend communication"
```

---

## Task 5: i18n Setup

**Files:**
- Create: `frontend/src/i18n/index.ts`
- Create: `frontend/src/i18n/en.json`
- Create: `frontend/src/i18n/ar.json`

- [ ] **Step 1: Create i18n/index.ts**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import ar from './ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
```

- [ ] **Step 2: Create i18n/en.json**

```json
{
  "app": {
    "title": "Arabic Morphosyntactic Explorer",
    "subtitle": "Quranic Learning Assistant"
  },
  "home": {
    "search": "Search verses...",
    "browseChapters": "Browse Chapters",
    "randomVerse": "Random Verse",
    "aiTutor": "AI Tutor"
  },
  "verses": {
    "chapter": "Chapter",
    "verse": "Verse",
    "search": "Search",
    "noResults": "No verses found"
  },
  "morphology": {
    "title": "Morphology Analysis",
    "word": "Word",
    "pos": "Part of Speech",
    "root": "Root",
    "lemma": "Lemma",
    "gender": "Gender",
    "number": "Number",
    "case": "Case"
  },
  "chat": {
    "title": "AI Tutor",
    "placeholder": "Ask about Arabic...",
    "send": "Send",
    "thinking": "Thinking..."
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "english": "English",
    "arabic": "Arabic",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "about": "About",
    "version": "Version"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "cancel": "Cancel",
    "confirm": "Confirm"
  }
}
```

- [ ] **Step 3: Create i18n/ar.json**

```json
{
  "app": {
    "title": "مستكشف الصرف العربي",
    "subtitle": "مساعد تعلم القرآن"
  },
  "home": {
    "search": "البحث في الآيات...",
    "browseChapters": "تصفح السور",
    "randomVerse": "آية عشوائية",
    "aiTutor": "المعلم الذكي"
  },
  "verses": {
    "chapter": "السورة",
    "verse": "الآية",
    "search": "بحث",
    "noResults": "لم يتم العثور على آيات"
  },
  "morphology": {
    "title": "تحليل الصرف",
    "word": "كلمة",
    "pos": "الكلمة",
    "root": "الجذر",
    "lemma": "المصدر",
    "gender": "الجنس",
    "number": "العدد",
    "case": "الحالة"
  },
  "chat": {
    "title": "المعلم الذكي",
    "placeholder": "اسأل عن العربية...",
    "send": "إرسال",
    "thinking": "جارٍ التفكير..."
  },
  "settings": {
    "title": "الإعدادات",
    "language": "اللغة",
    "english": "الإنجليزية",
    "arabic": "العربية",
    "theme": "المظهر",
    "light": "فاتح",
    "dark": "داكن",
    "about": "حول",
    "version": "الإصدار"
  },
  "common": {
    "loading": "جارٍ التحميل...",
    "error": "حدث خطأ",
    "retry": "إعادة المحاولة",
    "cancel": "إلغاء",
    "confirm": "تأكيد"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/i18n/
git commit -m "feat: Add i18n setup with English and Arabic locales"
```

---

## Task 6: Utility Functions

**Files:**
- Create: `frontend/src/utils/rtl.ts`
- Create: `frontend/src/utils/constants.ts`

- [ ] **Step 1: Create utils/rtl.ts**

```typescript
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
```

- [ ] **Step 2: Create utils/constants.ts**

```typescript
// API
export const DEFAULT_API_URL = 'http://localhost:8000';

// Navigation
export const SCREENS = {
  HOME: 'Home',
  VERSE_EXPLORER: 'VerseExplorer',
  MORPHOLOGY: 'Morphology',
  CHAT: 'Chat',
  SETTINGS: 'Settings',
} as const;

// Colors
export const COLORS = {
  primary: '#1E3A5F',
  secondary: '#4A90A4',
  background: '#FFFFFF',
  backgroundDark: '#121212',
  surface: '#F5F5F5',
  text: '#333333',
  textDark: '#FFFFFF',
  error: '#D32F2F',
  success: '#388E3C',
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/utils/
git commit -m "feat: Add RTL utilities and constants"
```

---

## Task 7: Reusable Components

**Files:**
- Create: `frontend/src/components/VerseCard.tsx`
- Create: `frontend/src/components/WordItem.tsx`
- Create: `frontend/src/components/SearchBar.tsx`
- Create: `frontend/src/components/ChatBubble.tsx`
- Create: `frontend/src/components/LoadingSpinner.tsx`

- [ ] **Step 1: Create VerseCard.tsx**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Verse } from '../types';
import { COLORS, getTextAlignment } from '../utils/constants';

interface VerseCardProps {
  verse: Verse;
  onPress: (verse: Verse) => void;
}

export function VerseCard({ verse, onPress }: VerseCardProps) {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(verse)}
    >
      <View style={styles.header}>
        <Text style={styles.reference}>
          {t('verses.chapter')} {verse.chapter}:{verse.verse}
        </Text>
      </View>
      <Text 
        style={[styles.preview, { textAlign: getTextAlignment() }]}
        numberOfLines={2}
      >
        {verse.words.map(w => w.form).join(' ')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  preview: {
    fontSize: 16,
    color: COLORS.text,
  },
});
```

- [ ] **Step 2: Create other components similarly**

- [ ] **Step 3: Create index.ts to export all components**

```typescript
export { VerseCard } from './VerseCard';
export { WordItem } from './WordItem';
export { SearchBar } from './SearchBar';
export { ChatBubble } from './ChatBubble';
export { LoadingSpinner } from './LoadingSpinner';
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: Add reusable UI components"
```

---

## Task 8: Screens

**Files:**
- Create: `frontend/src/screens/HomeScreen.tsx`
- Create: `frontend/src/screens/VerseExplorerScreen.tsx`
- Create: `frontend/src/screens/MorphologyScreen.tsx`
- Create: `frontend/src/screens/ChatScreen.tsx`
- Create: `frontend/src/screens/SettingsScreen.tsx`

- [ ] **Step 1: Create HomeScreen.tsx**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../utils/constants';
import { SearchBar } from '../components/SearchBar';
import { SCREENS } from '../utils/constants';

type HomeScreenNavigationProp = StackNavigationProp<any, 'Home'>;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleSearch = (query: string) => {
    // Navigate to search results
  };

  const navigateTo = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.title')}</Text>
        <Text style={styles.subtitle}>{t('app.subtitle')}</Text>
      </View>

      <SearchBar onSearch={handleSearch} />

      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateTo(SCREENS.VERSE_EXPLORER)}
        >
          <Text style={styles.menuText}>{t('home.browseChapters')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateTo(SCREENS.MORPHOLOGY)}
        >
          <Text style={styles.menuText}>{t('home.randomVerse')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateTo(SCREENS.CHAT)}
        >
          <Text style={styles.menuText}>{t('home.aiTutor')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 8,
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Create remaining screens with similar structure**

- [ ] **Step 3: Create screens index.ts**

```typescript
export { HomeScreen } from './HomeScreen';
export { VerseExplorerScreen } from './VerseExplorerScreen';
export { MorphologyScreen } from './MorphologyScreen';
export { ChatScreen } from './ChatScreen';
export { SettingsScreen } from './SettingsScreen';
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/screens/
git commit -m "feat: Add all 5 screens"
```

---

## Task 9: Navigation Setup

**Files:**
- Create: `frontend/src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Create AppNavigator.tsx**

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import {
  HomeScreen,
  VerseExplorerScreen,
  MorphologyScreen,
  ChatScreen,
  SettingsScreen,
} from '../screens';
import { SCREENS } from '../utils/constants';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.HOME}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E3A5F',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name={SCREENS.HOME} 
          component={HomeScreen}
          options={{ title: t('app.title') }}
        />
        <Stack.Screen 
          name={SCREENS.VERSE_EXPLORER} 
          component={VerseExplorerScreen}
          options={{ title: t('verses.chapter') }}
        />
        <Stack.Screen 
          name={SCREENS.MORPHOLOGY} 
          component={MorphologyScreen}
          options={{ title: t('morphology.title') }}
        />
        <Stack.Screen 
          name={SCREENS.CHAT} 
          component={ChatScreen}
          options={{ title: t('chat.title') }}
        />
        <Stack.Screen 
          name={SCREENS.SETTINGS} 
          component={SettingsScreen}
          options={{ title: t('settings.title') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/navigation/AppNavigator.tsx
git commit -m "feat: Add navigation configuration"
```

---

## Task 10: Main App Entry

**Files:**
- Create: `frontend/src/App.tsx`

- [ ] **Step 1: Create App.tsx**

```typescript
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useAppSettings } from './context/AppContext';
import { AppNavigator } from './navigation/AppNavigator';
import './i18n'; // Initialize i18n
import { setDirection } from './utils/rtl';

function AppContent() {
  const { settings } = useAppSettings();

  useEffect(() => {
    setDirection();
  }, [settings.language]);

  return (
    <>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Update app.json main entry**

```json
{
  "main": "src/App.tsx"
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: Add main App entry point"
```

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-11-arabic-morphosyntactic-explorer-frontend.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?