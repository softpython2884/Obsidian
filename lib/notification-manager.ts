export type NotificationType = 
  | 'message' 
  | 'mention' 
  | 'reaction' 
  | 'thread' 
  | 'server_invite' 
  | 'friend_request'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  data?: {
    channelId?: string;
    messageId?: string;
    userId?: string;
    serverId?: string;
    threadId?: string;
  };
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
  }>;
}

export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  dndMode: DNDMode;
  serverSettings: Record<string, {
    enabled: boolean;
    mentionsOnly: boolean;
  }>;
  typeSettings: Record<NotificationType, {
    enabled: boolean;
    sound: string;
    priority: NotificationPriority;
  }>;
}

export type DNDMode = 'off' | 'all' | 'mentions' | 'custom';

export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Notification[] = [];
  private settings: NotificationSettings;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private audioContext: AudioContext | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.loadFromStorage();
    this.initializeAudio();
    this.requestNotificationPermission();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      pushEnabled: false,
      soundEnabled: true,
      desktopEnabled: true,
      dndMode: 'off',
      serverSettings: {},
      typeSettings: {
        message: { enabled: true, sound: 'default', priority: 'medium' },
        mention: { enabled: true, sound: 'mention', priority: 'high' },
        reaction: { enabled: true, sound: 'default', priority: 'low' },
        thread: { enabled: true, sound: 'default', priority: 'medium' },
        server_invite: { enabled: true, sound: 'default', priority: 'high' },
        friend_request: { enabled: true, sound: 'default', priority: 'medium' },
        system: { enabled: true, sound: 'default', priority: 'urgent' }
      }
    };
  }

  private async initializeAudio(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      this.settings.desktopEnabled = permission === 'granted';
      this.saveToStorage();
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
    } catch (error) {
      console.warn('Failed to initialize service worker:', error);
    }
  }

  /**
   * Ajoute une notification
   */
  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.shouldShowNotification(notification)) return;

    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notifyListeners();

    // Afficher la notification
    await this.showNotification(newNotification);
  }

  /**
   * Vérifie si une notification doit être affichée selon les paramètres
   */
  private shouldShowNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): boolean {
    if (!this.settings.enabled) return false;
    if (this.isDNDActive(notification.type)) return false;

    const typeSettings = this.settings.typeSettings[notification.type];
    if (!typeSettings.enabled) return false;

    // Vérifier les paramètres spécifiques au serveur
    if (notification.data?.serverId) {
      const serverSettings = this.settings.serverSettings[notification.data.serverId];
      if (serverSettings && !serverSettings.enabled) return false;
      
      if (serverSettings?.mentionsOnly && notification.type !== 'mention') {
        return false;
      }
    }

    return true;
  }

  /**
   * Vérifie si le mode DND est actif pour ce type de notification
   */
  private isDNDActive(type: NotificationType): boolean {
    switch (this.settings.dndMode) {
      case 'all':
        return true;
      case 'mentions':
        return type !== 'mention';
      case 'custom':
        // Logique personnalisée basée sur l'heure, etc.
        return this.isCustomDNDEnabled();
      default:
        return false;
    }
  }

  /**
   * Logique personnalisée pour le mode DND custom
   */
  private isCustomDNDEnabled(): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    // Exemple : pas de notifications entre 22h et 8h
    return hour >= 22 || hour <= 8;
  }

  /**
   * Affiche la notification (desktop + son)
   */
  private async showNotification(notification: Notification): Promise<void> {
    // Notification desktop
    if (this.settings.desktopEnabled && 'Notification' in window) {
      try {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.priority === 'urgent'
        });
      } catch (error) {
        console.warn('Failed to show desktop notification:', error);
      }
    }

    // Son de notification
    if (this.settings.soundEnabled) {
      await this.playNotificationSound(notification.type);
    }

    // Push notification (via service worker)
    if (this.settings.pushEnabled && this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.showNotification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico',
          tag: notification.id,
          data: notification.data
        });
      } catch (error) {
        console.warn('Failed to show push notification:', error);
      }
    }
  }

  /**
   * Joue un son de notification
   */
  private async playNotificationSound(type: NotificationType): Promise<void> {
    if (!this.audioContext) return;

    try {
      const typeSettings = this.settings.typeSettings[type];
      const soundFile = typeSettings.sound;

      // Créer un son simple avec Web Audio API
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Différents sons selon le type
      switch (soundFile) {
        case 'mention':
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.3;
          break;
        case 'default':
        default:
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.1;
          break;
      }

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Supprime une notification
   */
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Vide toutes les notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Met à jour les paramètres de notification
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
  }

  /**
   * Récupère les notifications non lues
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  /**
   * Récupère toutes les notifications
   */
  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Ajoute un écouteur de changements
   */
  addListener(listener: (notifications: Notification[]) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Supprime un écouteur
   */
  removeListener(listener: (notifications: Notification[]) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notifie tous les écouteurs
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.getAllNotifications());
    });
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sauvegarde les données dans localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('discord-clone-notifications', JSON.stringify({
        notifications: this.notifications.slice(0, 100), // Limiter à 100 notifications
        settings: this.settings
      }));
    } catch (error) {
      console.warn('Failed to save notifications:', error);
    }
  }

  /**
   * Charge les données depuis localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('discord-clone-notifications');
      if (stored) {
        const data = JSON.parse(stored);
        this.notifications = data.notifications || [];
        this.settings = { ...this.settings, ...data.settings };
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }

  /**
   * Initialise le service worker pour les push notifications
   */
  async initializePushNotifications(): Promise<void> {
    await this.initializeServiceWorker();
    
    if (!this.serviceWorkerRegistration) return;

    try {
      // Demander l'abonnement aux push notifications
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVAPIDPublicKey()
      });

      // Envoyer l'abonnement au serveur
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      this.settings.pushEnabled = true;
      this.saveToStorage();
    } catch (error) {
      console.warn('Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Clé VAPID pour les push notifications (à configurer)
   */
  private getVAPIDPublicKey(): string {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  /**
   * Récupère les paramètres actuels
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
}

/**
 * Hook React pour utiliser le gestionnaire de notifications
 */
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const manager = NotificationManager.getInstance();

  useEffect(() => {
    setNotifications(manager.getAllNotifications());

    const handleUpdate = (updatedNotifications: Notification[]) => {
      setNotifications(updatedNotifications);
    };

    manager.addListener(handleUpdate);
    return () => manager.removeListener(handleUpdate);
  }, [manager]);

  return {
    notifications,
    unreadNotifications: notifications.filter(n => !n.read),
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => 
      manager.addNotification(notification),
    markAsRead: (id: string) => manager.markAsRead(id),
    markAllAsRead: () => manager.markAllAsRead(),
    removeNotification: (id: string) => manager.removeNotification(id),
    clearAll: () => manager.clearAll(),
    updateSettings: (settings: Partial<NotificationSettings>) => manager.updateSettings(settings),
    settings: manager.getSettings(),
    initializePushNotifications: () => manager.initializePushNotifications()
  };
};
