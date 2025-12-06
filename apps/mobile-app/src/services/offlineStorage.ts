import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  CACHED_QUIZZES: 'cached_quizzes',
  PENDING_ANSWERS: 'pending_answers',
  OFFLINE_MODE: 'offline_mode',
  LAST_SYNC: 'last_sync',
};

export interface CachedQuiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit?: number;
  passingScore: number;
  cachedAt: number;
  questionCount?: number;
  duration?: number;
  difficulty?: string;
  category?: string;
}

export interface PendingAnswer {
  id: string;
  quizId: string;
  answers: Array<{ questionId: string; selectedOption: number }>;
  completedAt: number;
  synced: boolean;
  syncAttempts: number;
}

class OfflineStorageService {
  // Quiz Caching
  async cacheQuiz(quiz: any): Promise<void> {
    try {
      const cachedQuizzes = await this.getCachedQuizzes();
      
      const cachedQuiz: CachedQuiz = {
        ...quiz,
        cachedAt: Date.now(),
        questionCount: quiz.questionCount || quiz.questions?.length || 0,
        duration: quiz.duration || quiz.timeLimit || 30,
        difficulty: quiz.difficulty || 'medium',
        category: quiz.category || 'general',
      };

      // Update or add quiz
      const index = cachedQuizzes.findIndex((q) => q.id === quiz.id);
      if (index >= 0) {
        cachedQuizzes[index] = cachedQuiz;
      } else {
        cachedQuizzes.push(cachedQuiz);
      }

      await AsyncStorage.setItem(
        KEYS.CACHED_QUIZZES,
        JSON.stringify(cachedQuizzes)
      );
    } catch (error) {
      console.error('Failed to cache quiz:', error);
      throw error;
    }
  }

  async getCachedQuizzes(): Promise<CachedQuiz[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CACHED_QUIZZES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cached quizzes:', error);
      return [];
    }
  }

  async getCachedQuiz(quizId: string): Promise<CachedQuiz | null> {
    try {
      const quizzes = await this.getCachedQuizzes();
      return quizzes.find((q) => q.id === quizId) || null;
    } catch (error) {
      console.error('Failed to get cached quiz:', error);
      return null;
    }
  }

  async clearQuizCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.CACHED_QUIZZES);
    } catch (error) {
      console.error('Failed to clear quiz cache:', error);
    }
  }

  // Pending Answers Management
  async savePendingAnswers(
    quizId: string,
    answers: Array<{ questionId: string; selectedOption: number }>
  ): Promise<string> {
    try {
      const pendingAnswers = await this.getPendingAnswers();
      
      const pendingAnswer: PendingAnswer = {
        id: `${quizId}_${Date.now()}`,
        quizId,
        answers,
        completedAt: Date.now(),
        synced: false,
        syncAttempts: 0,
      };

      pendingAnswers.push(pendingAnswer);

      await AsyncStorage.setItem(
        KEYS.PENDING_ANSWERS,
        JSON.stringify(pendingAnswers)
      );

      return pendingAnswer.id;
    } catch (error) {
      console.error('Failed to save pending answers:', error);
      throw error;
    }
  }

  async getPendingAnswers(): Promise<PendingAnswer[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PENDING_ANSWERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get pending answers:', error);
      return [];
    }
  }

  async getUnsyncedAnswers(): Promise<PendingAnswer[]> {
    try {
      const answers = await this.getPendingAnswers();
      return answers.filter((a) => !a.synced);
    } catch (error) {
      console.error('Failed to get unsynced answers:', error);
      return [];
    }
  }

  async markAnswerSynced(answerId: string): Promise<void> {
    try {
      const answers = await this.getPendingAnswers();
      const index = answers.findIndex((a) => a.id === answerId);
      
      if (index >= 0) {
        answers[index].synced = true;
        await AsyncStorage.setItem(
          KEYS.PENDING_ANSWERS,
          JSON.stringify(answers)
        );
      }
    } catch (error) {
      console.error('Failed to mark answer as synced:', error);
    }
  }

  async incrementSyncAttempts(answerId: string): Promise<void> {
    try {
      const answers = await this.getPendingAnswers();
      const index = answers.findIndex((a) => a.id === answerId);
      
      if (index >= 0) {
        answers[index].syncAttempts += 1;
        await AsyncStorage.setItem(
          KEYS.PENDING_ANSWERS,
          JSON.stringify(answers)
        );
      }
    } catch (error) {
      console.error('Failed to increment sync attempts:', error);
    }
  }

  async removeSyncedAnswers(): Promise<void> {
    try {
      const answers = await this.getPendingAnswers();
      const unsynced = answers.filter((a) => !a.synced);
      
      await AsyncStorage.setItem(
        KEYS.PENDING_ANSWERS,
        JSON.stringify(unsynced)
      );
    } catch (error) {
      console.error('Failed to remove synced answers:', error);
    }
  }

  // Offline Mode Management
  async setOfflineMode(isOffline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.OFFLINE_MODE, JSON.stringify(isOffline));
    } catch (error) {
      console.error('Failed to set offline mode:', error);
    }
  }

  async getOfflineMode(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(KEYS.OFFLINE_MODE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Failed to get offline mode:', error);
      return false;
    }
  }

  // Last Sync Time
  async setLastSync(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_SYNC, JSON.stringify(timestamp));
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  }

  async getLastSync(): Promise<number | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.LAST_SYNC);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  // Statistics
  async getStorageStats(): Promise<{
    cachedQuizzes: number;
    pendingAnswers: number;
    unsyncedAnswers: number;
    totalSize: string;
  }> {
    try {
      const quizzes = await this.getCachedQuizzes();
      const answers = await this.getPendingAnswers();
      const unsynced = answers.filter((a) => !a.synced);

      // Calculate approximate size
      const quizzesSize = JSON.stringify(quizzes).length;
      const answersSize = JSON.stringify(answers).length;
      const totalBytes = quizzesSize + answersSize;
      const totalKB = (totalBytes / 1024).toFixed(2);

      return {
        cachedQuizzes: quizzes.length,
        pendingAnswers: answers.length,
        unsyncedAnswers: unsynced.length,
        totalSize: `${totalKB} KB`,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        cachedQuizzes: 0,
        pendingAnswers: 0,
        unsyncedAnswers: 0,
        totalSize: '0 KB',
      };
    }
  }

  // Clear All Offline Data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.CACHED_QUIZZES,
        KEYS.PENDING_ANSWERS,
        KEYS.OFFLINE_MODE,
        KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('Failed to clear all offline data:', error);
    }
  }
}

export const offlineStorage = new OfflineStorageService();
