import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';
import type {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationChannel,
  NotificationStats,
} from '../types/notification';

interface UseNotificationsReturn {
  // Notifications
  notifications: Notification[];
  loadNotifications: (filters?: Record<string, any>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Preferences
  preferences: NotificationPreferences | null;
  loadPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;

  // Templates
  templates: NotificationTemplate[];
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Partial<NotificationTemplate>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<NotificationTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Channels
  channels: NotificationChannel[];
  loadChannels: () => Promise<void>;
  updateChannel: (id: string, channel: Partial<NotificationChannel>) => Promise<void>;
  testChannel: (id: string) => Promise<{ success: boolean; message: string }>;

  // Stats
  stats: NotificationStats | null;
  loadStats: (timeframe?: string) => Promise<void>;

  // Push Notifications
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;

  loading: boolean;
  error: string | null;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications(filters);
      setNotifications(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setLoading(true);
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setLoading(true);
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getPreferences();
      setPreferences(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    try {
      setLoading(true);
      const result = await notificationService.updatePreferences(prefs);
      setPreferences(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getTemplates();
      setTemplates(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Partial<NotificationTemplate>) => {
    try {
      setLoading(true);
      const result = await notificationService.createTemplate(template);
      setTemplates((prev) => [...prev, result]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, template: Partial<NotificationTemplate>) => {
    try {
      setLoading(true);
      const result = await notificationService.updateTemplate(id, template);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? result : t))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      await notificationService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getChannels();
      setChannels(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const updateChannel = async (id: string, channel: Partial<NotificationChannel>) => {
    try {
      setLoading(true);
      const result = await notificationService.updateChannel(id, channel);
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? result : c))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update channel');
    } finally {
      setLoading(false);
    }
  };

  const testChannel = async (id: string) => {
    try {
      setLoading(true);
      const result = await notificationService.testChannel(id);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test channel');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (timeframe?: string) => {
    try {
      setLoading(true);
      const result = await notificationService.getStats(timeframe);
      setStats(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      setLoading(true);
      await notificationService.subscribeToWebPush();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to push notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      setLoading(true);
      await notificationService.unsubscribeFromWebPush();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadPreferences();
    loadStats();
  }, []);

  return {
    notifications,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
    loadPreferences,
    updatePreferences,
    templates,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    channels,
    loadChannels,
    updateChannel,
    testChannel,
    stats,
    loadStats,
    subscribeToPush,
    unsubscribeFromPush,
    loading,
    error
  };
};
