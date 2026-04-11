// Arabic Morphosyntactic Explorer - TypeScript Type Definitions

// ============================================================================
// Verse Types
// ============================================================================

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

// ============================================================================
// Morphology Types
// ============================================================================

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

// ============================================================================
// Chat Types
// ============================================================================

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

// ============================================================================
// Search Types
// ============================================================================

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

// ============================================================================
// Settings Types
// ============================================================================

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: Theme;
  apiBaseUrl: string;
}