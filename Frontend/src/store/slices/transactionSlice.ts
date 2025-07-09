import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Transaction, SearchFilters, PaginatedResponse } from '../../types';
import { transactionService } from '../../services/transaction.service';

interface TransactionState {
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
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  },
  filters: {
    query: '',
    filters: {},
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
};

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (filters: SearchFilters, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(filters);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transaction/fetchTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionById(id);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch transaction');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch transaction');
    }
  }
);

export const updateTransactionStatus = createAsyncThunk(
  'transaction/updateStatus',
  async (
    { id, status, notes }: { id: string; status: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await transactionService.updateTransactionStatus(id, status, notes);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to update transaction status');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update transaction status');
    }
  }
);

export const flagTransaction = createAsyncThunk(
  'transaction/flag',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await transactionService.flagTransaction(id, reason);
      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Failed to flag transaction');
      }
      // Fetch updated transaction after flagging
      const updatedTransaction = await transactionService.getTransactionById(id);
      return updatedTransaction.data;
    } catch (error) {
      return rejectWithValue('Failed to flag transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page || 1,
      };
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        const response = action.payload as PaginatedResponse<Transaction>;
        state.isLoading = false;
        state.transactions = response.results;
        state.pagination = {
          total: response.count,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Transaction Status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        );
        if (state.selectedTransaction?.id === action.payload.id) {
          state.selectedTransaction = action.payload;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Flag Transaction
      .addCase(flagTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(flagTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.transactions = state.transactions.map((transaction) =>
            transaction.id === action.payload.id ? action.payload : transaction
          );
          if (state.selectedTransaction?.id === action.payload.id) {
            state.selectedTransaction = action.payload;
          }
        }
      })
      .addCase(flagTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearSelectedTransaction, clearError } = transactionSlice.actions;
export default transactionSlice.reducer; 