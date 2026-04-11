// Arabic Morphosyntactic Explorer - API Service for Backend Communication

import axios, { type AxiosInstance } from 'axios';
import type {
  Verse,
  MorphologyResponse,
  ChatRequest,
  ChatResponse,
  VerseSearchRequest,
  SearchResult,
} from '@/types';
import { useAppSettings } from '@/context/AppContext';

// ============================================================================
// API Service Class
// ============================================================================

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

  setBaseUrl(url: string): void {
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
  async getChapterVerses(
    chapter: number,
    limit?: number,
    offset?: number
  ): Promise<unknown> {
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
  async getMorphology(
    chapter: number,
    verse: number
  ): Promise<MorphologyResponse> {
    const response = await this.client.get(
      `/api/v1/morphology/${chapter}/${verse}`
    );
    return response.data;
  }

  // Analyze text
  async analyzeText(text: string): Promise<unknown> {
    const response = await this.client.post('/api/v1/morphology/analyze', {
      text,
    });
    return response.data;
  }

  // Chat
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/api/v1/chat', request);
    return response.data;
  }
}

// ============================================================================
// Singleton API Instance (configured with settings)
// ============================================================================

let apiService: ApiService | null = null;

export function useApi(): ApiService {
  const { settings } = useAppSettings();

  if (
    !apiService ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiService as any).client.defaults.baseURL !== settings.apiBaseUrl
  ) {
    apiService = new ApiService(settings.apiBaseUrl);
  }

  return apiService;
}

export default ApiService;