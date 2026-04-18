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
const BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeVerse = async (text: string): Promise<MorphologyResponse> => {
  try {
    const response = await apiClient.post('/morphology/analyze', { text });
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
