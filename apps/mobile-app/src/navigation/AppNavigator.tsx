import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { tenantConfig } from '../config/tenant-config';

// Screens
import LoginScreen from '../screens/LoginScreen';
import QuizListScreen from '../screens/QuizListScreen';
import QuizTakingScreen from '../screens/QuizTakingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  QuizTaking: { quizId: string };
  Results: {
    quizId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    answers: Array<{ questionId: string; selectedOption: number }>;
    questions: Array<any>;
  };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: tenantConfig.branding.primaryColor,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: tenantConfig.branding.primaryColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Quizzes"
        component={QuizListScreen}
        options={{
          title: 'Available Quizzes',
          tabBarLabel: 'Quizzes',
          tabBarIcon: () => <Text>📝</Text>,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: () => <Text>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

import { View, Text, ActivityIndicator } from 'react-native';

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator
          size="large"
          color={tenantConfig.branding.primaryColor}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="QuizTaking"
              component={QuizTakingScreen}
              options={{
                headerShown: true,
                title: 'Take Quiz',
                headerStyle: {
                  backgroundColor: tenantConfig.branding.primaryColor,
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                headerShown: true,
                title: 'Quiz Results',
                headerStyle: {
                  backgroundColor: tenantConfig.branding.primaryColor,
                },
                headerTintColor: '#fff',
                headerLeft: () => null, // Prevent going back
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
