import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  fetchTransactions,
  fetchTransactionById,
  updateTransactionStatus,
  flagTransaction,
  setFilters,
  clearSelectedTransaction,
} from '../store/slices/transactionSlice';
import type { Transaction, SearchFilters } from '../types';
import type { RootState } from '../store';

interface UseTransactionsReturn {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  filters: SearchFilters;
  getTransactions: (filters: SearchFilters) => Promise<void>;
  getTransactionById: (id: string) => Promise<void>;
  updateStatus: (params: { id: string; status: string; notes?: string }) => Promise<void>;
  flagTransactionById: (params: { id: string; reason: string }) => Promise<void>;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  clearTransaction: () => void;
}

export const useTransactions = (): UseTransactionsReturn => {
  const dispatch = useAppDispatch();
  const {
    transactions,
    selectedTransaction,
    isLoading,
    error,
    pagination,
    filters,
  } = useAppSelector((state: RootState) => state.transaction);

  const getTransactions = useCallback(
    async (filters: SearchFilters) => {
      try {
        await dispatch(fetchTransactions(filters)).unwrap();
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getTransactionById = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchTransactionById(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch transaction:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateStatus = useCallback(
    async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      try {
        await dispatch(updateTransactionStatus({ id, status, notes })).unwrap();
      } catch (error) {
        console.error('Failed to update transaction status:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const flagTransactionById = useCallback(
    async ({ id, reason }: { id: string; reason: string }) => {
      try {
        await dispatch(flagTransaction({ id, reason })).unwrap();
      } catch (error) {
        console.error('Failed to flag transaction:', error);
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

  const clearTransaction = useCallback(() => {
    dispatch(clearSelectedTransaction());
  }, [dispatch]);

  return {
    transactions,
    selectedTransaction,
    isLoading,
    error,
    pagination,
    filters,
    getTransactions,
    getTransactionById,
    updateStatus,
    flagTransactionById,
    updateFilters,
    clearTransaction,
  };
}; 