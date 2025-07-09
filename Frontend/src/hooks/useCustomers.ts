import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  setFilters,
  clearSelectedCustomer,
} from '../store/slices/customerSlice';
import type { Customer, SearchFilters } from '../types';
import type { RootState } from '../store';

interface UseCustomersReturn {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  filters: SearchFilters;
  getCustomers: (filters: SearchFilters) => Promise<void>;
  getCustomerById: (id: string) => Promise<void>;
  addCustomer: (data: Partial<Customer>) => Promise<void>;
  editCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  clearCustomer: () => void;
}

export const useCustomers = (): UseCustomersReturn => {
  const dispatch = useAppDispatch();
  const {
    customers,
    selectedCustomer,
    isLoading,
    error,
    pagination,
    filters,
  } = useAppSelector((state: RootState) => state.customer);

  const getCustomers = useCallback(
    async (filters: SearchFilters) => {
      try {
        await dispatch(fetchCustomers(filters)).unwrap();
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getCustomerById = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchCustomerById(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const addCustomer = useCallback(
    async (data: Partial<Customer>) => {
      try {
        await dispatch(createCustomer(data)).unwrap();
      } catch (error) {
        console.error('Failed to create customer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const editCustomer = useCallback(
    async (id: string, data: Partial<Customer>) => {
      try {
        await dispatch(updateCustomer({ id, data })).unwrap();
      } catch (error) {
        console.error('Failed to update customer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const clearCustomer = useCallback(() => {
    dispatch(clearSelectedCustomer());
  }, [dispatch]);

  return {
    customers,
    selectedCustomer,
    isLoading,
    error,
    pagination,
    filters,
    getCustomers,
    getCustomerById,
    addCustomer,
    editCustomer,
    updateFilters,
    clearCustomer,
  };
}; 