import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { tenantConfig } from '../config/tenant-config';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;
type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
  points: number;
}

interface Answer {
  questionId: string;
  selectedOption: number;
}

export default function ResultsScreen() {
  const route = useRoute<ResultsScreenRouteProp>();
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  
  const {
    quizId,
    score,
    totalQuestions,
    correctAnswers,
    answers,
    questions,
  } = route.params;

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = percentage >= 70; // Assuming 70% is passing

  const getResultColor = () => {
    if (percentage >= 90) return '#34C759'; // Green
    if (percentage >= 70) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  };

  const getResultMessage = () => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 70) return 'Good Job!';
    if (percentage >= 50) return 'Keep Practicing!';
    return 'Try Again!';
  };

  const getAnswerForQuestion = (questionId: string): number | undefined => {
    return answers.find((a) => a.questionId === questionId)?.selectedOption;
  };

  const handleBackToQuizzes = () => {
    navigation.navigate('Main');
  };

  const handleRetakeQuiz = () => {
    navigation.replace('QuizTaking', { quizId });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Results Summary */}
      <View style={styles.summaryCard}>
        <View
          style={[
            styles.scoreCircle,
            { borderColor: getResultColor() },
          ]}
        >
          <Text style={[styles.scorePercentage, { color: getResultColor() }]}>
            {percentage}%
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <Text style={[styles.resultMessage, { color: getResultColor() }]}>
          {getResultMessage()}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalQuestions - correctAnswers}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View
          style={[
            styles.passFailBadge,
            { backgroundColor: isPassed ? '#34C759' : '#FF3B30' },
          ]}
        >
          <Text style={styles.passFailText}>
            {isPassed ? '✓ PASSED' : '✗ FAILED'}
          </Text>
        </View>
      </View>

      {/* Question Review */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Review Answers</Text>
        
        {questions.map((question, index) => {
          const userAnswer = getAnswerForQuestion(question.id);
          const isCorrect = userAnswer === question.correctAnswer;
          const wasAnswered = userAnswer !== undefined;

          return (
            <View key={question.id} style={styles.questionReviewCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                <View
                  style={[
                    styles.resultBadge,
                    {
                      backgroundColor: !wasAnswered
                        ? '#999'
                        : isCorrect
                        ? '#34C759'
                        : '#FF3B30',
                    },
                  ]}
                >
                  <Text style={styles.resultBadgeText}>
                    {!wasAnswered ? 'SKIPPED' : isCorrect ? 'CORRECT' : 'WRONG'}
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewQuestionText}>{question.text}</Text>

              <View style={styles.reviewOptionsContainer}>
                {question.options.map((option: string, optionIndex: number) => {
                  const isUserAnswer = userAnswer === optionIndex;
                  const isCorrectAnswer = question.correctAnswer === optionIndex;

                  let optionStyle: any = styles.reviewOption;
                  let optionTextStyle: any = styles.reviewOptionText;

                  if (isCorrectAnswer) {
                    optionStyle = [styles.reviewOption, styles.reviewOptionCorrect];
                    optionTextStyle = [styles.reviewOptionText, styles.reviewOptionTextCorrect];
                  } else if (isUserAnswer && !isCorrect) {
                    optionStyle = [styles.reviewOption, styles.reviewOptionWrong];
                    optionTextStyle = [styles.reviewOptionText, styles.reviewOptionTextWrong];
                  }

                  return (
                    <View key={optionIndex} style={optionStyle}>
                      <Text style={optionTextStyle}>
                        {isCorrectAnswer && '✓ '}
                        {isUserAnswer && !isCorrect && '✗ '}
                        {option}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.retakeButton,
            { borderColor: tenantConfig.branding.colors.primary },
          ]}
          onPress={handleRetakeQuiz}
        >
          <Text
            style={[
              styles.actionButtonText,
              { color: tenantConfig.branding.colors.primary },
            ]}
          >
            Retake Quiz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            { backgroundColor: tenantConfig.branding.colors.primary },
          ]}
          onPress={handleBackToQuizzes}
        >
          <Text style={styles.primaryButtonText}>Back to Quizzes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scorePercentage: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resultMessage: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  passFailBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  passFailText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewSection: {
    padding: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  questionReviewCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewQuestionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  reviewOptionsContainer: {
    gap: 8,
  },
  reviewOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewOptionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  reviewOptionWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  reviewOptionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  reviewOptionTextCorrect: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  reviewOptionTextWrong: {
    color: '#C62828',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
