import { api } from './api';
import type {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationChannel,
  NotificationStats,
} from '../types/notification';

class NotificationService {
  private readonly BASE_PATH = '/api/notifications';

  // Notifications
  async getNotifications(filters?: Record<string, any>): Promise<Notification[]> {
    const response = await api.get<Notification[]>(this.BASE_PATH, { params: filters });
    return response.data;
  }

  async getNotification(id: string): Promise<Notification> {
    const response = await api.get<Notification>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await api.put(`${this.BASE_PATH}/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put(`${this.BASE_PATH}/read-all`);
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>(`${this.BASE_PATH}/preferences`);
    return response.data;
  }

  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await api.put<NotificationPreferences>(
      `${this.BASE_PATH}/preferences`,
      preferences
    );
    return response.data;
  }

  // Templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get<NotificationTemplate[]>(`${this.BASE_PATH}/templates`);
    return response.data;
  }

  async createTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.post<NotificationTemplate>(`${this.BASE_PATH}/templates`, template);
    return response.data;
  }

  async updateTemplate(
    id: string,
    template: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate> {
    const response = await api.put<NotificationTemplate>(
      `${this.BASE_PATH}/templates/${id}`,
      template
    );
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/templates/${id}`);
  }

  // Channels
  async getChannels(): Promise<NotificationChannel[]> {
    const response = await api.get<NotificationChannel[]>(`${this.BASE_PATH}/channels`);
    return response.data;
  }

  async updateChannel(
    id: string,
    channel: Partial<NotificationChannel>
  ): Promise<NotificationChannel> {
    const response = await api.put<NotificationChannel>(
      `${this.BASE_PATH}/channels/${id}`,
      channel
    );
    return response.data;
  }

  async testChannel(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `${this.BASE_PATH}/channels/${id}/test`
    );
    return response.data;
  }

  // Stats
  async getStats(timeframe?: string): Promise<NotificationStats> {
    const response = await api.get<NotificationStats>(`${this.BASE_PATH}/stats`, {
      params: { timeframe },
    });
    return response.data;
  }

  // Actions
  async executeAction(notificationId: string, actionId: string): Promise<void> {
    await api.post(`${this.BASE_PATH}/${notificationId}/actions/${actionId}`);
  }

  // Subscription
  async subscribeToWebPush(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
    });

    await api.post(`${this.BASE_PATH}/push-subscription`, subscription);
  }

  async unsubscribeFromWebPush(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await api.delete(`${this.BASE_PATH}/push-subscription`);
    }
  }
}

export const notificationService = new NotificationService(); 