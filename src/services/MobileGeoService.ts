export interface GeolocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface OfflineData {
  id: string;
  type: 'collection_event' | 'processing_step' | 'quality_test';
  data: any;
  timestamp: string;
  synced: boolean;
}

export class MobileGeoService {
  private static offlineQueue: OfflineData[] = [];
  
  static async getCurrentLocation(): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
          });
        },
        (error) => {
          // Fallback to demo coordinates for development
          console.warn('Geolocation error, using demo coordinates:', error);
          resolve({
            lat: 26.5671,
            lng: 74.3571,
            accuracy: 10,
            timestamp: new Date().toISOString()
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  static async watchPosition(callback: (position: GeolocationData) => void): Promise<number> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        });
      },
      (error) => {
        console.error('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    );
  }

  static clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }

  // Offline-first data management
  static queueOfflineData(type: string, data: any): void {
    const offlineItem: OfflineData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    this.offlineQueue.push(offlineItem);
    this.saveOfflineQueue();
    console.log('📱 Data queued for offline sync:', offlineItem);
  }

  static async syncOfflineData(): Promise<void> {
    const unsynced = this.offlineQueue.filter(item => !item.synced);
    
    for (const item of unsynced) {
      try {
        // In real implementation, submit to blockchain
        console.log('🔄 Syncing offline data:', item);
        item.synced = true;
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
      }
    }
    
    this.saveOfflineQueue();
  }

  static getOfflineQueue(): OfflineData[] {
    return [...this.offlineQueue];
  }

  static getPendingSyncCount(): number {
    return this.offlineQueue.filter(item => !item.synced).length;
  }

  private static saveOfflineQueue(): void {
    try {
      localStorage.setItem('blockchain_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private static loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('blockchain_offline_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  // Initialize on module load
  static {
    this.loadOfflineQueue();
  }

  // SMS Gateway simulation for low-connectivity areas
  static async sendSMSNotification(phoneNumber: string, message: string): Promise<void> {
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
    // In real implementation, integrate with SMS gateway
  }

  static async validateConnectivity(): Promise<boolean> {
    try {
      await fetch('/api/health', { method: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  }
}