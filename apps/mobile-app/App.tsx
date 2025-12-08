import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineBanner from './src/components/OfflineBanner';
import { syncService } from './src/services/syncService';
import { notificationService } from './src/services/notificationService';

// Error Boundary Component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
      <ScrollView style={styles.errorScroll}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Text style={styles.errorStack}>{error.stack}</Text>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Start automatic sync service (every 60 seconds)
      syncService.startAutoSync(60000);
      
      // Initialize notification service (don't block app startup)
      notificationService.initialize().catch((error) => {
        console.warn('Notification service initialization failed:', error);
        // Don't crash the app if notifications fail
      });
      
      return () => {
        syncService.stopAutoSync();
      };
    } catch (e) {
      console.error('App initialization error:', e);
      setError(e as Error);
    }
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <OfflineBanner />
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorScroll: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  errorStack: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
});
