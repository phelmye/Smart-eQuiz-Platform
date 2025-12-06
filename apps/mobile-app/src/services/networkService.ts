import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkStatusCallback = (isConnected: boolean | null) => void;

class NetworkService {
  private listeners: Set<NetworkStatusCallback> = new Set();
  private isConnected: boolean | null = true;

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      
      if (connected !== this.isConnected) {
        this.isConnected = connected;
        this.notifyListeners(connected);
      }
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected && state.isInternetReachable !== false;
      return this.isConnected;
    } catch (error) {
      console.error('Failed to check network connection:', error);
      return false;
    }
  }

  getConnectionStatus(): boolean | null {
    return this.isConnected;
  }

  addListener(callback: NetworkStatusCallback): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(isConnected: boolean | null) {
    this.listeners.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((isConnected) => {
        if (isConnected) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

export const networkService = new NetworkService();
