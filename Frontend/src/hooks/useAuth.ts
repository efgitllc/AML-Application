import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '.';
import { 
  login, 
  logout, 
  register,
  getCurrentUser, 
  verifyMFA,
  changePassword,
  forgotPassword,
  clearError,
  clearMFA,
  initializeAuth
} from '../store/slices/authSlice';
import type { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaUserId: string | null;
  loginUser: (credentials: { email: string; password: string; remember_me?: boolean }) => Promise<void>;
  registerUser: (userData: {
    email: string;
    password: string;
    confirm_password: string;
    phone_number?: string;
    emirates_id?: string;
    preferred_language?: string;
  }) => Promise<void>;
  logoutUser: () => Promise<void>;
  verifyMFACode: (code: string, userId: string) => Promise<void>;
  changeUserPassword: (passwordData: { old_password: string; new_password: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearAuthError: () => void;
  clearMFARequirement: () => void;
  initializeAuthState: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    mfaRequired, 
    mfaUserId 
  } = useAppSelector((state) => state.auth);

  const loginUser = useCallback(
    async (credentials: { email: string; password: string; remember_me?: boolean }) => {
      try {
        await dispatch(login(credentials)).unwrap();
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const registerUser = useCallback(
    async (userData: {
      email: string;
      password: string;
      confirm_password: string;
      phone_number?: string;
      emirates_id?: string;
      preferred_language?: string;
    }) => {
      try {
        await dispatch(register(userData)).unwrap();
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [dispatch]);

  const verifyMFACode = useCallback(
    async (code: string, userId: string) => {
      try {
        await dispatch(verifyMFA({ code, userId })).unwrap();
      } catch (error) {
        console.error('MFA verification failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const changeUserPassword = useCallback(
    async (passwordData: { old_password: string; new_password: string }) => {
      try {
        await dispatch(changePassword(passwordData)).unwrap();
      } catch (error) {
        console.error('Password change failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        await dispatch(forgotPassword(email)).unwrap();
      } catch (error) {
        console.error('Password reset request failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearMFARequirement = useCallback(() => {
    dispatch(clearMFA());
  }, [dispatch]);

  const initializeAuthState = useCallback(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    mfaRequired,
    mfaUserId,
    loginUser,
    registerUser,
    logoutUser,
    verifyMFACode,
    changeUserPassword,
    requestPasswordReset,
    fetchCurrentUser,
    clearAuthError,
    clearMFARequirement,
    initializeAuthState,
  };
}; 