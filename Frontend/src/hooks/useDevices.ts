import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '../services/device.service';
import type { Device, CreateDeviceData, UpdateDeviceData, DeviceLog } from '../services/device.service';

interface UseDevicesReturn {
  devices: Device[];
  loading: boolean;
  error: string | null;
  success: boolean;
  selectedDevice: Device | null;
  deviceLogs: DeviceLog[];
  fetchDevices: () => Promise<void>;
  createDevice: (data: CreateDeviceData) => Promise<void>;
  updateDevice: (id: string, data: UpdateDeviceData) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  refreshDeviceStatus: (id: string) => Promise<void>;
  bulkRefreshDevices: () => Promise<void>;
  getDeviceLogs: (id: string, startDate?: string, endDate?: string) => Promise<void>;
  selectDevice: (device: Device | null) => void;
  resetState: () => void;
}

export const useDevices = (): UseDevicesReturn => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedDevices = await deviceService.getDevices();
      setDevices(fetchedDevices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError('Failed to fetch devices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const createDevice = async (data: CreateDeviceData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const newDevice = await deviceService.createDevice(data);
      setDevices([...devices, newDevice]);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to create device:', err);
      setError('Failed to create device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateDevice = async (id: string, data: UpdateDeviceData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedDevice = await deviceService.updateDevice(id, data);
      setDevices(devices.map(device =>
        device.id === id ? updatedDevice : device
      ));
      setSuccess(true);
    } catch (err) {
      console.error('Failed to update device:', err);
      setError('Failed to update device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await deviceService.deleteDevice(id);
      setDevices(devices.filter(device => device.id !== id));
      setSuccess(true);
    } catch (err) {
      console.error('Failed to delete device:', err);
      setError('Failed to delete device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshDeviceStatus = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedDevice = await deviceService.refreshDeviceStatus(id);
      setDevices(devices.map(device =>
        device.id === id ? updatedDevice : device
      ));
    } catch (err) {
      console.error('Failed to refresh device status:', err);
      setError('Failed to refresh device status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bulkRefreshDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedDevices = await deviceService.bulkRefreshDevices();
      setDevices(updatedDevices);
    } catch (err) {
      console.error('Failed to refresh devices:', err);
      setError('Failed to refresh devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceLogs = async (id: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      const logs = await deviceService.getDeviceLogs(id, startDate, endDate);
      setDeviceLogs(logs);
    } catch (err) {
      console.error('Failed to fetch device logs:', err);
      setError('Failed to fetch device logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectDevice = (device: Device | null) => {
    setSelectedDevice(device);
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    devices,
    loading,
    error,
    success,
    selectedDevice,
    deviceLogs,
    fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    refreshDeviceStatus,
    bulkRefreshDevices,
    getDeviceLogs,
    selectDevice,
    resetState,
  };
}; 