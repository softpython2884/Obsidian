export type UserStatus = 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE' | 'INVISIBLE';

export interface StatusData {
  userId: string;
  status: UserStatus;
  lastSeen: Date;
}

export class StatusManager {
  private static instance: StatusManager;
  private statusMap: Map<string, StatusData> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private idleCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes of inactivity
  private readonly OFFLINE_TIMEOUT = 15 * 60 * 1000; // 15 minutes without heartbeat

  static getInstance(): StatusManager {
    if (!StatusManager.instance) {
      StatusManager.instance = new StatusManager();
    }
    return StatusManager.instance;
  }

  // Register a user for status tracking
  registerUser(userId: string, initialStatus: UserStatus = 'ONLINE'): void {
    const statusData: StatusData = {
      userId,
      status: initialStatus,
      lastSeen: new Date()
    };

    this.statusMap.set(userId, statusData);
    this.startHeartbeat(userId);
    this.startIdleCheck(userId);
  }

  // Unregister a user (when they disconnect)
  unregisterUser(userId: string): void {
    this.stopHeartbeat(userId);
    this.stopIdleCheck(userId);
    this.updateStatus(userId, 'OFFLINE');
  }

  // Update user status manually
  updateStatus(userId: string, status: UserStatus): void {
    const current = this.statusMap.get(userId);
    if (current) {
      current.status = status;
      current.lastSeen = new Date();
      this.statusMap.set(userId, current);
    }
  }

  // Record user activity (for idle detection)
  recordActivity(userId: string): void {
    const current = this.statusMap.get(userId);
    if (current && current.status !== 'DND' && current.status !== 'INVISIBLE') {
      current.status = 'ONLINE';
      current.lastSeen = new Date();
      this.statusMap.set(userId, current);
    }
  }

  // Get user status
  getStatus(userId: string): UserStatus | null {
    const statusData = this.statusMap.get(userId);
    if (!statusData) return null;

    // Check if user should be marked as offline
    const timeSinceLastSeen = Date.now() - statusData.lastSeen.getTime();
    if (timeSinceLastSeen > this.OFFLINE_TIMEOUT && statusData.status !== 'INVISIBLE') {
      statusData.status = 'OFFLINE';
      this.statusMap.set(userId, statusData);
    }

    return statusData.status;
  }

  // Get all user statuses
  getAllStatuses(): Map<string, UserStatus> {
    const result = new Map<string, UserStatus>();
    this.statusMap.forEach((statusData, userId) => {
      result.set(userId, this.getStatus(userId) || 'OFFLINE');
    });
    return result;
  }

  // Start heartbeat for a user
  private startHeartbeat(userId: string): void {
    this.stopHeartbeat(userId); // Clear any existing interval

    const interval = setInterval(() => {
      this.updateStatus(userId, this.getStatus(userId) || 'OFFLINE');
    }, this.HEARTBEAT_INTERVAL);

    this.heartbeatIntervals.set(userId, interval);
  }

  // Stop heartbeat for a user
  private stopHeartbeat(userId: string): void {
    const interval = this.heartbeatIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(userId);
    }
  }

  // Start idle checking for a user
  private startIdleCheck(userId: string): void {
    this.stopIdleCheck(userId); // Clear any existing interval

    const interval = setInterval(() => {
      const current = this.statusMap.get(userId);
      if (current && current.status === 'ONLINE') {
        const timeSinceLastSeen = Date.now() - current.lastSeen.getTime();
        if (timeSinceLastSeen > this.IDLE_TIMEOUT) {
          current.status = 'IDLE';
          this.statusMap.set(userId, current);
        }
      }
    }, 60 * 1000); // Check every minute

    this.idleCheckIntervals.set(userId, interval);
  }

  // Stop idle checking for a user
  private stopIdleCheck(userId: string): void {
    const interval = this.idleCheckIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.idleCheckIntervals.delete(userId);
    }
  }

  // Clean up all intervals (for server shutdown)
  cleanup(): void {
    this.heartbeatIntervals.forEach(interval => clearInterval(interval));
    this.idleCheckIntervals.forEach(interval => clearInterval(interval));
    this.heartbeatIntervals.clear();
    this.idleCheckIntervals.clear();
    this.statusMap.clear();
  }
}
