import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { access_token, refresh_token, user } = response.data;
    
    localStorage.setItem('accessToken', access_token);
    if (refresh_token) {
      localStorage.setItem('refreshToken', refresh_token);
    }
    localStorage.setItem('user', JSON.stringify(user));
    
    return { accessToken: access_token, refreshToken: refresh_token, user };
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await this.client.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  // Categories
  async getCategories() {
    const response = await this.client.get('/questions/categories');
    return response.data;
  }

  async createCategory(data: { name: string; description?: string; icon?: string }) {
    const response = await this.client.post('/questions/categories', data);
    return response.data;
  }

  // Questions
  async getQuestions(params?: { categoryId?: string; difficulty?: string; isActive?: boolean }) {
    const response = await this.client.get('/questions', { params });
    return response.data;
  }

  async getQuestion(id: string) {
    const response = await this.client.get(`/questions/${id}`);
    return response.data;
  }

  async createQuestion(data: {
    categoryId: string;
    prompt: string;
    correctAnswer: string;
    wrongAnswers: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    points: number;
    timeLimit: number;
    explanation?: string;
  }) {
    const response = await this.client.post('/questions', data);
    return response.data;
  }

  async updateQuestion(id: string, data: Partial<any>) {
    const response = await this.client.patch(`/questions/${id}`, data);
    return response.data;
  }

  async deleteQuestion(id: string) {
    await this.client.delete(`/questions/${id}`);
  }

  // Tournaments
  async getTournaments() {
    const response = await this.client.get('/tournaments');
    return response.data;
  }

  async getTournament(id: string) {
    const response = await this.client.get(`/tournaments/${id}`);
    return response.data;
  }

  async createTournament(data: {
    name: string;
    description?: string;
    entryFee: number;
    prizePool: number;
    maxParticipants: number;
    startDate: string;
    endDate: string;
    questionIds: string[];
  }) {
    const response = await this.client.post('/tournaments', data);
    return response.data;
  }

  async updateTournament(id: string, data: Partial<any>) {
    const response = await this.client.patch(`/tournaments/${id}`, data);
    return response.data;
  }

  async deleteTournament(id: string) {
    await this.client.delete(`/tournaments/${id}`);
  }

  async enterTournament(id: string) {
    const response = await this.client.post(`/tournaments/${id}/enter`);
    return response.data;
  }

  // Practice Mode
  async startPractice(categoryId?: string) {
    const response = await this.client.post('/practice/start', { categoryId });
    return response.data;
  }

  async answerPracticeQuestion(progressId: string, answer: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
  }) {
    const response = await this.client.post('/practice/answer', {
      progressId,
      answer,
    });
    return response.data;
  }

  async getPracticeStats(categoryId?: string) {
    const response = await this.client.get('/practice/stats', {
      params: { categoryId },
    });
    return response.data;
  }

  async getPracticeLeaderboard(categoryId?: string, limit = 10) {
    const response = await this.client.get('/practice/leaderboard', {
      params: { categoryId, limit },
    });
    return response.data;
  }

  // Matches
  async getMatches(tournamentId?: string) {
    const response = await this.client.get('/matches', {
      params: { tournamentId },
    });
    return response.data;
  }

  async getMatch(id: string) {
    const response = await this.client.get(`/matches/${id}`);
    return response.data;
  }

  async createMatch(data: {
    tournamentId: string;
    roundNumber: number;
    scheduledStartTime?: string;
  }) {
    const response = await this.client.post('/matches', data);
    return response.data;
  }

  async joinMatch(matchId: string) {
    const response = await this.client.post('/matches/join', { matchId });
    return response.data;
  }

  async recordScore(data: {
    matchId: string;
    score: number;
    answersCorrect: number;
    answersWrong: number;
    totalTimeTaken: number;
  }) {
    const response = await this.client.post('/matches/score', data);
    return response.data;
  }

  async completeMatch(id: string) {
    const response = await this.client.patch(`/matches/${id}/complete`);
    return response.data;
  }

  async getMatchLeaderboard(tournamentId: string) {
    const response = await this.client.get(`/matches/leaderboard/${tournamentId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
