import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardStats, ChartData, ApiResponse } from '../../types';
import { analyticsService } from '../../services/analytics.service';

interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  type?: string;
  groupBy?: string;
  customerId?: string;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  transactionTrends: ChartData | null;
  alertDistribution: ChartData | null;
  riskScoreDistribution: ChartData | null;
  customerSegmentation: {
    segments: Array<{
      name: string;
      count: number;
      riskProfile: string;
      averageTransactionValue: number;
    }>;
  } | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  transactionTrends: null,
  alertDistribution: null,
  riskScoreDistribution: null,
  customerSegmentation: null,
  isLoading: false,
  error: null,
  filters: {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
};

export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDashboardStats();
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch dashboard stats');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard stats');
    }
  }
);

export const fetchTransactionTrends = createAsyncThunk(
  'analytics/fetchTransactionTrends',
  async (filters: AnalyticsFilters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getTransactionTrends(filters);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch transaction trends');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch transaction trends');
    }
  }
);

export const fetchAlertDistribution = createAsyncThunk(
  'analytics/fetchAlertDistribution',
  async (filters: AnalyticsFilters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getAlertDistribution(filters);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch alert distribution');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch alert distribution');
    }
  }
);

export const fetchRiskScoreDistribution = createAsyncThunk(
  'analytics/fetchRiskScoreDistribution',
  async (filters: AnalyticsFilters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getRiskScoreDistribution(filters);
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch risk score distribution');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch risk score distribution');
    }
  }
);

export const fetchCustomerSegmentation = createAsyncThunk(
  'analytics/fetchCustomerSegmentation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCustomerSegmentation();
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to fetch customer segmentation');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch customer segmentation');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Transaction Trends
      .addCase(fetchTransactionTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactionTrends = action.payload;
      })
      .addCase(fetchTransactionTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Alert Distribution
      .addCase(fetchAlertDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlertDistribution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alertDistribution = action.payload;
      })
      .addCase(fetchAlertDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Risk Score Distribution
      .addCase(fetchRiskScoreDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiskScoreDistribution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.riskScoreDistribution = action.payload;
      })
      .addCase(fetchRiskScoreDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Customer Segmentation
      .addCase(fetchCustomerSegmentation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerSegmentation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerSegmentation = action.payload;
      })
      .addCase(fetchCustomerSegmentation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer; 