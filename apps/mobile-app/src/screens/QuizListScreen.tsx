import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../api/client';
import { tenantConfig } from '../config/tenant-config';
import { offlineStorage } from '../services/offlineStorage';
import { networkService } from '../services/networkService';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  difficulty: string;
  category: string;
}

export default function QuizListScreen() {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      
      // Try to load from API if online
      if (networkService.getConnectionStatus()) {
        try {
          const data = await apiClient.getQuizzes();
          setQuizzes(data);
          
          // Cache each quiz for offline use
          for (const quiz of data) {
            // Fetch full quiz details to cache
            const fullQuiz = await apiClient.getQuiz(quiz.id);
            await offlineStorage.cacheQuiz(fullQuiz);
          }
          return;
        } catch (apiError) {
          console.log('API failed, loading from cache...', apiError);
        }
      }
      
      // Fall back to cached quizzes
      const cachedQuizzes = await offlineStorage.getCachedQuizzes();
      if (cachedQuizzes.length > 0) {
        setQuizzes(cachedQuizzes as any);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQuizzes();
    setRefreshing(false);
  };

  const handleQuizPress = (quiz: Quiz) => {
    // @ts-expect-error - Navigation typing issue with React Navigation
    navigation.navigate('QuizTaking', { quizId: quiz.id });
  };

  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => handleQuizPress(item)}
    >
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{item.title}</Text>
        <View
          style={[
            styles.difficultyBadge,
            {
              backgroundColor:
                item.difficulty === 'easy'
                  ? '#10B981'
                  : item.difficulty === 'medium'
                  ? '#F59E0B'
                  : '#EF4444',
            },
          ]}
        >
          <Text style={styles.difficultyText}>
            {item.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.quizDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.quizMeta}>
        <Text style={styles.metaText}>
          📝 {item.questionCount} questions
        </Text>
        <Text style={styles.metaText}>⏱️ {item.duration} min</Text>
        <Text style={styles.metaText}>📚 {item.category}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          { backgroundColor: tenantConfig.branding.primaryColor },
        ]}
        onPress={() => handleQuizPress(item)}
      >
        <Text style={styles.startButtonText}>Start Quiz</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={tenantConfig.branding.primaryColor}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tenantConfig.branding.primaryColor}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quizzes available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new quizzes
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quizTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  quizDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  startButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});
