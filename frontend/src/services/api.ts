import axios from 'axios';
import { MorphologyResponse, VerseResponse } from '@/types/morphology';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  context_used: boolean;
}

// Replace with your local machine's IP address if testing on a physical device
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
console.log('API Base URL:', BASE_URL);


export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to log outgoing requests
apiClient.interceptors.request.use(config => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  return config;
});

// Add a response interceptor to log errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const analyzeVerse = async (text: string): Promise<MorphologyResponse> => {
  try {
    const response = await apiClient.post<MorphologyResponse>('/morphology/analyze', { text });
    return response.data;
  } catch (error) {
    console.error('Morphology analysis failed', error);
    throw error;
  }
};

export interface WordAnalysisResponse {
  word: string;
  analyses: Record<string, string>[];
  ai_explanation: string;
}

export const analyzeWord = async (word: string, model?: string): Promise<WordAnalysisResponse> => {
   try {
     const response = await apiClient.post<WordAnalysisResponse>('/morphology/analyze-word', { 
       word,
       model: model || 'gemini-3.1-flash-lite-preview'
     });
     return response.data;
   } catch (error) {
     console.error('Word analysis failed', error);
     throw error;
   }
 };

export const sendChatMessage = async (
   message: string,
   history: ChatMessage[],
   verseContext?: string,
   model?: string
 ): Promise<ChatResponse> => {
   try {
     // If backend doesn't natively support message history arrays, we format the latest query
     // Since the backend expects: message, context_verses, include_verses
     // We optionally convert verseContext to the expected context_verses schema if provided.
     // For now we just send the message to avoid 422 Payload Errors.
     const response = await apiClient.post('/chat', {
       message: message,
       context_verses: [],
       model: model || 'gemini-3.1-flash-lite-preview'
     });
     return response.data;
   } catch (error) {
     console.error('Chat request failed', error);
     throw error;
   }
 };

export const getVerse = async (chapter: number, verse: number): Promise<VerseResponse> => {
  try {
    const response = await apiClient.get<VerseResponse>(`/verses/${chapter}/${verse}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch verse ${chapter}:${verse}`, error);
    throw error;
  }
};

export const getChapterVerses = async (chapter: number, limit = 50, offset = 0): Promise<{
  chapter: number;
  verse_count: number;
  verses: VerseResponse[];
  limit: number;
  offset: number;
  has_more: boolean;
}> => {
  try {
    const response = await apiClient.get(`/verses/${chapter}`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch chapter ${chapter} verses`, error);
    throw error;
  }
}

export default apiClient;
