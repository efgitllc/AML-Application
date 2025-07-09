import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Customer, SearchFilters, PaginatedResponse } from '../../types';
import { customerService } from '../../services/customer.service';

interface CustomerState {
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
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
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
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
};

export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (filters: SearchFilters, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomers(filters);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customer/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerById(id);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch customer');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async (data: Partial<Customer>, { rejectWithValue }) => {
    try {
      const response = await customerService.createCustomer(data);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to create customer');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomer(id, data);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to update customer');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update customer');
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page || 1,
      };
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        const response = action.payload as PaginatedResponse<Customer>;
        state.isLoading = false;
        state.customers = response.results;
        state.pagination = {
          total: response.count,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = [action.payload, ...state.customers];
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer
        );
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearSelectedCustomer, clearError } = customerSlice.actions;
export default customerSlice.reducer; 