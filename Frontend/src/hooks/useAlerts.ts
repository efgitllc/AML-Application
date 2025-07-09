import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  fetchAlerts,
  fetchAlertById,
  updateAlertStatus,
  fetchCases,
  fetchCaseById,
  createCase,
  updateCaseStatus,
  setAlertFilters,
  setCaseFilters,
  clearSelectedAlert,
  clearSelectedCase,
} from '../store/slices/alertSlice';
import type { Alert, Case, SearchFilters } from '../types';
import type { RootState } from '../store';

interface UseAlertsReturn {
  alerts: Alert[];
  selectedAlert: Alert | null;
  cases: Case[];
  selectedCase: Case | null;
  isLoading: boolean;
  error: string | null;
  alertPagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  casePagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  alertFilters: SearchFilters;
  caseFilters: SearchFilters;
  getAlerts: (filters: SearchFilters) => Promise<void>;
  getAlertById: (id: string) => Promise<void>;
  updateAlertStatusById: (params: { id: string; status: string; notes?: string }) => Promise<void>;
  getCases: (filters: SearchFilters) => Promise<void>;
  getCaseById: (id: string) => Promise<void>;
  createNewCase: (data: {
    title: string;
    description: string;
    priority: string;
    type: string;
    relatedAlerts: string[];
    customerId?: string;
  }) => Promise<void>;
  updateCaseStatusById: (params: { id: string; status: string; notes?: string }) => Promise<void>;
  updateAlertFilters: (newFilters: Partial<SearchFilters>) => void;
  updateCaseFilters: (newFilters: Partial<SearchFilters>) => void;
  clearAlert: () => void;
  clearCase: () => void;
}

export const useAlerts = (): UseAlertsReturn => {
  const dispatch = useAppDispatch();
  const {
    alerts,
    selectedAlert,
    cases,
    selectedCase,
    isLoading,
    error,
    alertPagination,
    casePagination,
    alertFilters,
    caseFilters,
  } = useAppSelector((state: RootState) => state.alert);

  const getAlerts = useCallback(
    async (filters: SearchFilters) => {
      try {
        await dispatch(fetchAlerts(filters)).unwrap();
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getAlertById = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchAlertById(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch alert:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateAlertStatusById = useCallback(
    async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      try {
        await dispatch(updateAlertStatus({ id, status, notes })).unwrap();
      } catch (error) {
        console.error('Failed to update alert status:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getCases = useCallback(
    async (filters: SearchFilters) => {
      try {
        await dispatch(fetchCases(filters)).unwrap();
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getCaseById = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchCaseById(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch case:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const createNewCase = useCallback(
    async (data: {
      title: string;
      description: string;
      priority: string;
      type: string;
      relatedAlerts: string[];
      customerId?: string;
    }) => {
      try {
        await dispatch(createCase(data)).unwrap();
      } catch (error) {
        console.error('Failed to create case:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateCaseStatusById = useCallback(
    async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      try {
        await dispatch(updateCaseStatus({ id, status, notes })).unwrap();
      } catch (error) {
        console.error('Failed to update case status:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateAlertFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      dispatch(setAlertFilters(newFilters));
    },
    [dispatch]
  );

  const updateCaseFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      dispatch(setCaseFilters(newFilters));
    },
    [dispatch]
  );

  const clearAlert = useCallback(() => {
    dispatch(clearSelectedAlert());
  }, [dispatch]);

  const clearCase = useCallback(() => {
    dispatch(clearSelectedCase());
  }, [dispatch]);

  return {
    alerts,
    selectedAlert,
    cases,
    selectedCase,
    isLoading,
    error,
    alertPagination,
    casePagination,
    alertFilters,
    caseFilters,
    getAlerts,
    getAlertById,
    updateAlertStatusById,
    getCases,
    getCaseById,
    createNewCase,
    updateCaseStatusById,
    updateAlertFilters,
    updateCaseFilters,
    clearAlert,
    clearCase,
  };
}; 