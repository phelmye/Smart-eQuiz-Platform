import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { tenantConfig } from '../config/tenant-config';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiClient {
  private client: AxiosInstance;
  private tenantId: string;

  constructor() {
    this.tenantId = tenantConfig.api.tenantId;
    
    this.client = axios.create({
      baseURL: tenantConfig.api.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              await this.setToken(response.accessToken);
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token Management
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  // Auth Endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
      tenantId: this.tenantId,
    });
    
    if (response.data.accessToken) {
      await this.setToken(response.data.accessToken);
      await this.setRefreshToken(response.data.refreshToken);
    }
    
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  // Quiz Endpoints
  async getQuizzes() {
    const response = await this.client.get('/quizzes');
    return response.data;
  }

  async getQuiz(quizId: string) {
    const response = await this.client.get(`/quizzes/${quizId}`);
    return response.data;
  }

  async submitQuizAnswers(quizId: string, answers: any[]) {
    const response = await this.client.post(`/quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  }

  // Leaderboard Endpoints
  async getLeaderboard(tournamentId?: string) {
    const url = tournamentId 
      ? `/leaderboard?tournamentId=${tournamentId}`
      : '/leaderboard';
    const response = await this.client.get(url);
    return response.data;
  }

  // User Profile
  async getProfile() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.patch('/users/me', data);
    return response.data;
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
