import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineBanner from './src/components/OfflineBanner';
import { syncService } from './src/services/syncService';
import { notificationService } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Start automatic sync service (every 60 seconds)
    syncService.startAutoSync(60000);
    
    // Initialize notification service
    notificationService.initialize().catch((error) => {
      console.error('Failed to initialize notifications:', error);
    });
    
    return () => {
      syncService.stopAutoSync();
    };
  }, []);

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
});
