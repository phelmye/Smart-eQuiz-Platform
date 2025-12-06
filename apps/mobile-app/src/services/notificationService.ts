import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'quiz_available' | 'tournament_started' | 'leaderboard_update' | 'result_ready' | 'general';
  quizId?: string;
  tournamentId?: string;
  title: string;
  message: string;
}

type NotificationListener = (notification: Notifications.Notification) => void;
type ResponseListener = (response: Notifications.NotificationResponse) => void;

class NotificationService {
  private pushToken: string | null = null;
  private notificationListeners: Set<NotificationListener> = new Set();
  private responseListeners: Set<ResponseListener> = new Set();

  // Initialize notification service
  async initialize(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return false;
    }

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return false;
      }

      // Get push token
      const token = await this.registerForPushNotifications();
      if (!token) {
        console.log('Failed to get push token');
        return false;
      }

      this.pushToken = token;

      // Register token with backend
      await this.registerTokenWithBackend(token);

      // Set up listeners
      this.setupNotificationListeners();

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get push notification token
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Configure Android channel (required for Android 8.0+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('quiz', {
          name: 'Quiz Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          description: 'Notifications about new quizzes and quiz updates',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E40AF',
        });

        await Notifications.setNotificationChannelAsync('tournament', {
          name: 'Tournament Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          description: 'Notifications about tournaments',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#DC2626',
        });
      }

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Register token with backend
  async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.request({
        method: 'POST',
        url: '/notifications/register',
        data: {
          pushToken: token,
          platform: Platform.OS,
          deviceModel: Device.modelName,
          deviceOS: `${Platform.OS} ${Platform.Version}`,
        },
      });
      console.log('Push token registered with backend');
    } catch (error) {
      console.error('Failed to register push token:', error);
      // Don't throw - notifications can still work locally
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is foregrounded
    Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
      this.notificationListeners.forEach((listener) => {
        try {
          listener(notification);
        } catch (error) {
          console.error('Notification listener error:', error);
        }
      });
    });

    // Listener for notification tap/interaction
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification response:', response);
      this.responseListeners.forEach((listener) => {
        try {
          listener(response);
        } catch (error) {
          console.error('Response listener error:', error);
        }
      });
    });
  }

  // Add notification received listener
  addNotificationListener(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  // Add notification response listener (when user taps notification)
  addResponseListener(listener: ResponseListener): () => void {
    this.responseListeners.add(listener);
    return () => {
      this.responseListeners.delete(listener);
    };
  }

  // Schedule a local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger || null, // null = show immediately
      });
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  // Clear badge
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }

  // Get current push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Unregister from push notifications
  async unregister(): Promise<void> {
    try {
      if (this.pushToken) {
        await apiClient.request({
          method: 'DELETE',
          url: '/notifications/unregister',
          data: { pushToken: this.pushToken },
        });
      }
      
      await this.cancelAllNotifications();
      await this.clearBadge();
      
      this.pushToken = null;
      this.notificationListeners.clear();
      this.responseListeners.clear();
      
      console.log('Unregistered from push notifications');
    } catch (error) {
      console.error('Failed to unregister:', error);
    }
  }
}

export const notificationService = new NotificationService();
