import { api } from './api';

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  lastSeen: string;
  location: string;
  ipAddress: string;
  macAddress: string;
}

export interface CreateDeviceData {
  name: string;
  type: string;
  location: string;
  ipAddress: string;
  macAddress: string;
}

export interface UpdateDeviceData extends Partial<CreateDeviceData> {
  status?: Device['status'];
}

class DeviceService {
  private readonly baseUrl = '/api/devices';

  async getDevices(): Promise<Device[]> {
    const response = await api.get<Device[]>(this.baseUrl);
    return response.data;
  }

  async getDevice(id: string): Promise<Device> {
    const response = await api.get<Device>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createDevice(data: CreateDeviceData): Promise<Device> {
    const response = await api.post<Device>(this.baseUrl, data);
    return response.data;
  }

  async updateDevice(id: string, data: UpdateDeviceData): Promise<Device> {
    const response = await api.put<Device>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteDevice(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async refreshDeviceStatus(id: string): Promise<Device> {
    const response = await api.post<Device>(`${this.baseUrl}/${id}/refresh`);
    return response.data;
  }

  async bulkRefreshDevices(): Promise<Device[]> {
    const response = await api.post<Device[]>(`${this.baseUrl}/refresh`);
    return response.data;
  }

  async getDeviceLogs(id: string, startDate?: string, endDate?: string): Promise<DeviceLog[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<DeviceLog[]>(`${this.baseUrl}/${id}/logs`, {
      params,
    });
    return response.data;
  }
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

export const deviceService = new DeviceService(); 