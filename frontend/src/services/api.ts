import axios from 'axios';
import { MorphologyResponse } from '@/types/morphology';

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

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[],
  verseContext?: string
): Promise<ChatResponse> => {
  try {
    const response = await apiClient.post('/chat', {
      message,
      history,
      verse_context: verseContext
    });
    return response.data;
  } catch (error) {
    console.error('Chat request failed', error);
    throw error;
  }
};

export default apiClient;
