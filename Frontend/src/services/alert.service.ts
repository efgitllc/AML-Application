import { api } from './api';
import type { Alert } from '../types';

interface AlertsResponse {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
}

class AlertService {
  private readonly BASE_PATH = '/api/alerts';

  async getAlerts(params: { limit: number; status: string }): Promise<Alert[]> {
    const { data } = await api.get<AlertsResponse>(this.BASE_PATH, { params });
    return data.data;
  }
}

export const alertService = new AlertService(); 