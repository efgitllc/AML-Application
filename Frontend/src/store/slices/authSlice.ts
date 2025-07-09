import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { authService } from '../../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaUserId: string | null;
}

const initialState: AuthState = {
  user: authService.getUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  mfaRequired: false,
  mfaUserId: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; remember_me?: boolean }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Login failed');
      }
      
      // Check if MFA is required
      if (response.meta?.mfa_required) {
        return {
          mfaRequired: true,
          userId: response.meta.user_id,
        };
      }

      if (!response.data) {
        return rejectWithValue('No data received from server');
      }
      
      return {
        ...response.data,
        mfaRequired: false,
      };
    } catch (error: any) {
      console.error('Login error in slice:', error);
      return rejectWithValue(error?.message || 'Login failed');
    }
  }
);

export const verifyMFA = createAsyncThunk(
  'auth/verifyMFA',
  async ({ code, userId }: { code: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyMFA(code, userId);
      if (response.status === 'error') {
        return rejectWithValue(response.message || 'MFA verification failed');
      }
      if (!response.data) {
        return rejectWithValue('No data received from server');
      }
      return response.data;
    } catch (error: any) {
      console.error('MFA verification error in slice:', error);
      return rejectWithValue(error?.message || 'MFA verification failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string;
    password: string;
    confirm_password: string;
    phone_number?: string;
    emirates_id?: string;
    preferred_language?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Registration failed');
      }
      if (!response.data) {
        return rejectWithValue('No data received from server');
      }
      return {
        user: response.data,
        token: authService.getToken(), // Get token from service after registration
      };
    } catch (error: any) {
      console.error('Registration error in slice:', error);
      return rejectWithValue(error?.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      if (response.status === 'error' || !response.data) {
        return rejectWithValue(response.message || 'Failed to get current user');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to get current user');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Logout failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: { old_password: string; new_password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Password change failed');
      }
      return 'Password changed successfully';
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Password change failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Password reset request failed');
      }
      return 'Password reset email sent';
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Password reset request failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.mfaRequired = false;
      state.mfaUserId = null;
      // Auth service handles localStorage cleanup
    },
    clearMFA: (state) => {
      state.mfaRequired = false;
      state.mfaUserId = null;
    },
    initializeAuth: (state) => {
      // Initialize auth state from localStorage on app start
      state.user = authService.getUser();
      state.token = authService.getToken();
      state.isAuthenticated = authService.isAuthenticated();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.mfaRequired = false;
        state.mfaUserId = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.mfaRequired) {
          // MFA is required
          state.mfaRequired = true;
          state.mfaUserId = action.payload.userId;
          state.isAuthenticated = false;
        } else {
          // Normal login success
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.mfaRequired = false;
          state.mfaUserId = null;
        }
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.mfaRequired = false;
        state.mfaUserId = null;
        state.error = action.payload as string || 'Login failed';
      })
      // MFA Verification
      .addCase(verifyMFA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.mfaRequired = false;
        state.mfaUserId = null;
        state.error = null;
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'MFA verification failed';
        // Keep MFA state for retry
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string || 'Registration failed';
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.mfaRequired = false;
        state.mfaUserId = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Still clear auth data even if logout API fails
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.mfaRequired = false;
        state.mfaUserId = null;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAuth, clearMFA, initializeAuth } = authSlice.actions;
export default authSlice.reducer; 