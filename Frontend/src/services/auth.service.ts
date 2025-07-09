import type { User, ApiResponse, UserRole } from '../types';
import { apiService } from './api';

interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  phone_number?: string;
  emirates_id?: string;
  preferred_language?: string;
}

interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  confirm_password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    role: string;
    mfa_enabled: boolean;
  };
  mfa_required?: boolean;
  user_id?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login/', credentials);
      
      if (response.status === 'error') {
        return {
          status: 'error',
          data: { token: '', user: {} as User },
          message: response.message || 'Login failed',
          errors: response.errors || ['Invalid email or password'],
        };
      }

      const { access, refresh, user: userData, mfa_required, user_id } = response.data!;

      // Handle MFA requirement
      if (mfa_required && user_id) {
        return {
          status: 'success',
          data: { token: '', user: {} as User },
          message: 'MFA verification required',
          meta: { mfa_required: true, user_id },
        };
      }

      // Transform backend user data to frontend format
      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.email.split('@')[0], // Extract username from email
        firstName: '', // Will be populated from profile
        lastName: '', // Will be populated from profile
        role: userData.role as UserRole || 'customer_service',
        isActive: true,
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        mfaEnabled: userData.mfa_enabled,
        accessLevel: 'full',
        twoFactorEnabled: userData.mfa_enabled,
        lastPasswordChange: new Date().toISOString(),
        failedLoginAttempts: 0,
      };

      // Store authentication data
      this.setToken(access);
      this.setRefreshToken(refresh);
      this.setUser(user);

      return {
        status: 'success',
        data: { token: access, user },
        message: 'Login successful',
      };

    } catch (error: any) {
      this.clearAuth();
      console.error('Login error:', error);
      return {
        status: 'error',
        data: { token: '', user: {} as User },
        message: error?.response?.data?.error || error?.message || 'An error occurred during login',
        errors: [error?.response?.data?.error || error?.message || 'Invalid email or password'],
      };
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/register/', data);
      
      if (response.status === 'error') {
        return {
          status: 'error',
          data: {} as User,
          message: response.message || 'Registration failed',
          errors: response.errors || ['Registration failed'],
        };
      }

      const { access, refresh, user: userData } = response.data!;

      // Transform backend user data to frontend format
      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.email.split('@')[0],
        firstName: '',
        lastName: '',
        role: userData.role as UserRole || 'customer_service',
        isActive: true,
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        mfaEnabled: userData.mfa_enabled,
        accessLevel: 'full',
        twoFactorEnabled: userData.mfa_enabled,
        lastPasswordChange: new Date().toISOString(),
        failedLoginAttempts: 0,
      };

      // Store authentication data
      this.setToken(access);
      this.setRefreshToken(refresh);
      this.setUser(user);

      return {
        status: 'success',
        data: user,
        message: 'Registration successful',
      };

    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        status: 'error',
        data: {} as User,
        message: error?.response?.data?.message || error?.message || 'Registration failed',
        errors: error?.response?.data?.errors || [error?.message || 'Registration failed'],
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await apiService.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear auth data even if API call fails
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const token = this.getToken();
      const storedUser = this.getUser();
      
      if (!token || !storedUser) {
        throw new Error('No authenticated user');
      }

      // For now, return stored user. Later we can add API call to get fresh user data
      // const response = await apiService.get<User>('/auth/user/');
      
      return {
        status: 'success',
        data: storedUser,
        message: 'User retrieved successfully',
      };

    } catch (error: any) {
      this.clearAuth();
      return {
        status: 'error',
        data: {} as User,
        message: error?.message || 'Failed to get current user',
        errors: [error?.message || 'Authentication required'],
      };
    }
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/change-password/', data);
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/password/reset/', { email });
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/password/reset/confirm/', data);
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/verify-email/', { token });
  }

  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/resend-verification/');
  }

  // MFA related methods
  async verifyMFA(code: string, userId: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/mfa/verify/', {
        code,
        user_id: userId,
      });

      if (response.status === 'error') {
        return {
          status: 'error',
          data: { token: '', user: {} as User },
          message: response.message || 'MFA verification failed',
          errors: response.errors || ['Invalid verification code'],
        };
      }

      const { access, refresh, user: userData } = response.data!;

      // Transform backend user data to frontend format
      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.email.split('@')[0],
        firstName: '',
        lastName: '',
        role: userData.role as UserRole || 'customer_service',
        isActive: true,
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        mfaEnabled: userData.mfa_enabled,
        accessLevel: 'full',
        twoFactorEnabled: userData.mfa_enabled,
        lastPasswordChange: new Date().toISOString(),
        failedLoginAttempts: 0,
      };

      // Store authentication data
      this.setToken(access);
      this.setRefreshToken(refresh);
      this.setUser(user);

      return {
        status: 'success',
        data: { token: access, user },
        message: 'MFA verification successful',
      };

    } catch (error: any) {
      console.error('MFA verification error:', error);
      return {
        status: 'error',
        data: { token: '', user: {} as User },
        message: error?.response?.data?.message || error?.message || 'MFA verification failed',
        errors: [error?.response?.data?.message || error?.message || 'Invalid verification code'],
      };
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.clearAuth();
      return null;
    }
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }
}

export const authService = new AuthService(); 