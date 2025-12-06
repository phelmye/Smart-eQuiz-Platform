import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { networkService } from '../services/networkService';
import { syncService } from '../services/syncService';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    // Check initial connection
    networkService.checkConnection().then(setIsOnline);

    // Listen for connection changes
    const unsubscribe = networkService.addListener((connected) => {
      setIsOnline(connected);
      
      if (connected) {
        // Slide out after 3 seconds when back online
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 3000);
      } else {
        // Slide in when offline
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    // Update pending count periodically
    const updatePending = async () => {
      const status = await syncService.getSyncStatus();
      setPendingCount(status.pendingCount);
    };

    updatePending();
    const interval = setInterval(updatePending, 10000); // Every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: isOnline ? '#34C759' : '#FF9500',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>
        {isOnline
          ? pendingCount > 0
            ? `✓ Online - Syncing ${pendingCount} pending ${pendingCount === 1 ? 'quiz' : 'quizzes'}...`
            : '✓ Back Online'
          : '⚠ Offline Mode - Answers will sync when online'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40, // Account for status bar
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
