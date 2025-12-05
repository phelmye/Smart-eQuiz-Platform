# Frontend-Backend Integration Guide

## Overview

This guide walks through integrating the React frontend with the NestJS backend API.

---

## 1. Create API Client Layer

### Install Dependencies

```bash
cd workspace/shadcn-ui
npm install axios
```

### Create API Client (`src/lib/apiClient.ts`)

```typescript
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
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
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
```

---

## 2. Update Environment Variables

### Create `.env` file

```bash
VITE_API_URL=http://localhost:3000/api
```

---

## 3. Update Components

### AuthSystem.tsx

Replace localStorage login with API:

```typescript
import { apiClient } from '@/lib/apiClient';
import { useState } from 'react';

export function AuthSystem({ onLogin }: { onLogin: (user: User) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.login(email, password);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
}
```

### PracticeMode.tsx

Replace mock data with API calls:

```typescript
import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';

export function PracticeMode() {
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadLeaderboard();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.getPracticeStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiClient.getPracticeLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  const startPractice = async (categoryId?: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.startPractice(categoryId);
      setSession(data);
    } catch (err) {
      console.error('Failed to start practice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, selectedOption: string, isCorrect: boolean, timeSpent: number) => {
    try {
      const result = await apiClient.answerPracticeQuestion(session.progress.id, {
        questionId,
        selectedOption,
        isCorrect,
        timeSpent,
      });
      
      // Update UI with result
      if (result.leveledUp) {
        // Show level-up animation
      }
      
      // Refresh stats
      await loadStats();
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  // ... rest of component
}
```

### TournamentEngine.tsx

Replace mock tournaments with API:

```typescript
import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';

export function TournamentEngine() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enterTournament = async (tournamentId: string) => {
    try {
      await apiClient.enterTournament(tournamentId);
      await loadTournaments(); // Refresh list
    } catch (err) {
      console.error('Failed to enter tournament:', err);
    }
  };

  // ... rest of component
}
```

### QuestionBank.tsx

Replace mock questions with API:

```typescript
import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';

export function QuestionBank() {
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadQuestions(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadQuestions = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.getQuestions({ categoryId });
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createQuestion = async (questionData: any) => {
    try {
      await apiClient.createQuestion(questionData);
      await loadQuestions(selectedCategory!);
    } catch (err) {
      console.error('Failed to create question:', err);
    }
  };

  // ... rest of component
}
```

### LiveMatch.tsx

Replace mock matches with API:

```typescript
import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';

export function LiveMatch({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadMatches();
    loadLeaderboard();
  }, [tournamentId]);

  const loadMatches = async () => {
    try {
      const data = await apiClient.getMatches(tournamentId);
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiClient.getMatchLeaderboard(tournamentId);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  const joinMatch = async (matchId: string) => {
    try {
      await apiClient.joinMatch(matchId);
      const match = await apiClient.getMatch(matchId);
      setCurrentMatch(match);
    } catch (err) {
      console.error('Failed to join match:', err);
    }
  };

  const submitScore = async (matchId: string, score: number, answersCorrect: number, answersWrong: number, totalTime: number) => {
    try {
      await apiClient.recordScore({
        matchId,
        score,
        answersCorrect,
        answersWrong,
        totalTimeTaken: totalTime,
      });
      
      // Refresh match details and leaderboard
      await loadMatches();
      await loadLeaderboard();
    } catch (err) {
      console.error('Failed to submit score:', err);
    }
  };

  // ... rest of component
}
```

---

## 4. Add Loading States

Create a loading component (`src/components/ui/spinner.tsx`):

```typescript
export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

Use in components:

```typescript
{isLoading ? <Spinner /> : <YourContent />}
```

---

## 5. Add Error Handling

Create an error toast hook:

```typescript
import { useToast } from '@/hooks/use-toast';

export function useApiError() {
  const { toast } = useToast();

  const handleError = (error: any) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    toast({
      variant: 'destructive',
      title: 'Error',
      description: message,
    });
  };

  return { handleError };
}
```

Use in components:

```typescript
const { handleError } = useApiError();

try {
  await apiClient.login(email, password);
} catch (err) {
  handleError(err);
}
```

---

## 6. Testing the Integration

### Start Backend
```bash
cd services/api
npm run start:dev
```

### Start Frontend
```bash
cd workspace/shadcn-ui
npm run dev
```

### Test Flow
1. Open `http://localhost:5173`
2. Login with `admin@demo.local` / `password123`
3. Navigate to Practice Mode → Should load real categories
4. Start practice → Should load real questions
5. Answer questions → Should earn XP and update stats
6. Check leaderboard → Should show real rankings
7. Navigate to Tournaments → Should load real tournaments
8. Enter tournament → Should successfully register

---

## 7. Deployment Considerations

### Environment Variables
- **Development:** `VITE_API_URL=http://localhost:3000/api`
- **Production:** `VITE_API_URL=https://api.yourapp.com/api`

### CORS Configuration
Backend needs to allow frontend origin:

```typescript
// services/api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

### Security
- Use HTTPS in production
- Set secure cookie flags for tokens (consider httpOnly cookies instead of localStorage)
- Implement rate limiting
- Add CSRF protection

---

## Next Steps

1. ✅ Create `apiClient.ts`
2. ✅ Update all components to use API
3. ✅ Add loading states
4. ✅ Add error handling
5. Test all features end-to-end
6. Add optimistic UI updates
7. Implement retry logic for failed requests
8. Add request caching (React Query recommended)
