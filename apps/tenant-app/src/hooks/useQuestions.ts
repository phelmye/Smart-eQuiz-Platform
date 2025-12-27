import { useState, useEffect } from 'react';
import { apiLogger } from '@/lib/logger';
import { apiClient } from '../lib/apiClient';

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
}

export interface QuestionFilters {
  categoryId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  isActive?: boolean;
}

export function useQuestions(filters?: QuestionFilters) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getQuestions(filters);
      setQuestions(data);
    } catch (err: any) {
      apiLogger.error('/api fetch questions:', err);
      setError(err.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters?.categoryId, filters?.difficulty, filters?.isActive]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err: any) {
      apiLogger.error('/api fetch categories:', err);
      setError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

