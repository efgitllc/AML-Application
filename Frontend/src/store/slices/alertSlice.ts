import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Alert, Case, SearchFilters, PaginatedResponse } from '../../types';
import { alertService } from '../../services/alert.service';

interface AlertState {
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
}

const initialState: AlertState = {
  alerts: [],
  selectedAlert: null,
  cases: [],
  selectedCase: null,
  isLoading: false,
  error: null,
  alertPagination: {
    total: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  },
  casePagination: {
    total: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  },
  alertFilters: {
    query: '',
    filters: {},
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
  caseFilters: {
    query: '',
    filters: {},
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
};

// Alert Actions
export const fetchAlerts = createAsyncThunk(
  'alert/fetchAlerts',
  async (filters: SearchFilters, { rejectWithValue }) => {
    try {
      const response = await alertService.getAlerts(filters);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch alerts');
    }
  }
);

export const fetchAlertById = createAsyncThunk(
  'alert/fetchAlertById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await alertService.getAlertById(id);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch alert');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch alert');
    }
  }
);

export const updateAlertStatus = createAsyncThunk(
  'alert/updateStatus',
  async (
    { id, status, notes }: { id: string; status: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await alertService.updateAlertStatus(id, status, notes);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to update alert status');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update alert status');
    }
  }
);

// Case Actions
export const fetchCases = createAsyncThunk(
  'alert/fetchCases',
  async (filters: SearchFilters, { rejectWithValue }) => {
    try {
      const response = await alertService.getCases(filters);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch cases');
    }
  }
);

export const fetchCaseById = createAsyncThunk(
  'alert/fetchCaseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await alertService.getCaseById(id);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch case');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch case');
    }
  }
);

export const createCase = createAsyncThunk(
  'alert/createCase',
  async (data: {
    title: string;
    description: string;
    priority: string;
    type: string;
    relatedAlerts: string[];
    customerId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await alertService.createCase(data);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to create case');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create case');
    }
  }
);

export const updateCaseStatus = createAsyncThunk(
  'alert/updateCaseStatus',
  async (
    { id, status, notes }: { id: string; status: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await alertService.updateCaseStatus(id, status, notes);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to update case status');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update case status');
    }
  }
);

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlertFilters: (state, action) => {
      state.alertFilters = {
        ...state.alertFilters,
        ...action.payload,
        page: action.payload.page || 1,
      };
    },
    setCaseFilters: (state, action) => {
      state.caseFilters = {
        ...state.caseFilters,
        ...action.payload,
        page: action.payload.page || 1,
      };
    },
    clearSelectedAlert: (state) => {
      state.selectedAlert = null;
    },
    clearSelectedCase: (state) => {
      state.selectedCase = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        const response = action.payload as PaginatedResponse<Alert>;
        state.isLoading = false;
        state.alerts = response.results;
        state.alertPagination = {
          total: response.count,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        };
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Alert by ID
      .addCase(fetchAlertById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlertById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAlert = action.payload;
      })
      .addCase(fetchAlertById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Alert Status
      .addCase(updateAlertStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAlertStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts = state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        );
        if (state.selectedAlert?.id === action.payload.id) {
          state.selectedAlert = action.payload;
        }
      })
      .addCase(updateAlertStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Cases
      .addCase(fetchCases.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        const response = action.payload as PaginatedResponse<Case>;
        state.isLoading = false;
        state.cases = response.results;
        state.casePagination = {
          total: response.count,
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
        };
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Case by ID
      .addCase(fetchCaseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCase = action.payload;
      })
      .addCase(fetchCaseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Case
      .addCase(createCase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cases = [action.payload, ...state.cases];
        state.casePagination.total += 1;
      })
      .addCase(createCase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Case Status
      .addCase(updateCaseStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cases = state.cases.map((case_) =>
          case_.id === action.payload.id ? action.payload : case_
        );
        if (state.selectedCase?.id === action.payload.id) {
          state.selectedCase = action.payload;
        }
      })
      .addCase(updateCaseStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAlertFilters,
  setCaseFilters,
  clearSelectedAlert,
  clearSelectedCase,
  clearError,
} = alertSlice.actions;
export default alertSlice.reducer; 