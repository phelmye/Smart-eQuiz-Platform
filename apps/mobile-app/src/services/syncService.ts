import { apiClient } from '../api/client';
import { offlineStorage, PendingAnswer } from './offlineStorage';
import { networkService } from './networkService';

class SyncService {
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  // Start automatic sync when online
  startAutoSync(intervalMs: number = 60000) {
    this.stopAutoSync();
    
    this.syncInterval = setInterval(async () => {
      if (networkService.getConnectionStatus() && !this.isSyncing) {
        await this.syncPendingAnswers();
      }
    }, intervalMs);

    // Also sync when connection is restored
    networkService.addListener((isConnected) => {
      if (isConnected && !this.isSyncing) {
        setTimeout(() => this.syncPendingAnswers(), 2000);
      }
    });
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingAnswers(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    if (!networkService.getConnectionStatus()) {
      return { success: false, synced: 0, failed: 0, errors: ['No internet connection'] };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const pendingAnswers = await offlineStorage.getUnsyncedAnswers();

      if (pendingAnswers.length === 0) {
        await offlineStorage.setLastSync(Date.now());
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      console.log(`Starting sync of ${pendingAnswers.length} pending answers...`);

      for (const answer of pendingAnswers) {
        try {
          // Skip if too many failed attempts (max 5)
          if (answer.syncAttempts >= 5) {
            console.warn(`Skipping answer ${answer.id} - too many failed attempts`);
            errors.push(`Answer ${answer.id}: Max retry attempts reached`);
            failed++;
            continue;
          }

          // Attempt to submit
          await apiClient.submitQuizAnswers(answer.quizId, answer.answers);
          
          // Mark as synced
          await offlineStorage.markAnswerSynced(answer.id);
          synced++;
          console.log(`Successfully synced answer ${answer.id}`);
        } catch (error: any) {
          console.error(`Failed to sync answer ${answer.id}:`, error);
          
          // Increment sync attempts
          await offlineStorage.incrementSyncAttempts(answer.id);
          
          failed++;
          errors.push(
            `Answer ${answer.id}: ${error.response?.data?.message || error.message || 'Unknown error'}`
          );
        }
      }

      // Clean up successfully synced answers
      await offlineStorage.removeSyncedAnswers();
      await offlineStorage.setLastSync(Date.now());

      console.log(`Sync complete: ${synced} synced, ${failed} failed`);

      return {
        success: failed === 0,
        synced,
        failed,
        errors,
      };
    } catch (error: any) {
      console.error('Sync process error:', error);
      return {
        success: false,
        synced,
        failed,
        errors: [...errors, error.message || 'Unknown sync error'],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  async getSyncStatus(): Promise<{
    lastSync: Date | null;
    pendingCount: number;
    isSyncing: boolean;
  }> {
    const lastSyncTime = await offlineStorage.getLastSync();
    const pending = await offlineStorage.getUnsyncedAnswers();

    return {
      lastSync: lastSyncTime ? new Date(lastSyncTime) : null,
      pendingCount: pending.length,
      isSyncing: this.isSyncing,
    };
  }

  // Manual sync trigger
  async forceSyncNow(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    // Wait for connection if offline
    const isConnected = await networkService.waitForConnection(5000);
    
    if (!isConnected) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['No internet connection available'],
      };
    }

    return this.syncPendingAnswers();
  }
}

export const syncService = new SyncService();
