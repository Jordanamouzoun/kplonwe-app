import { apiClient } from './api.service';
import type { ApiResponse, User, AuthResponse, LoginCredentials, RegisterData } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data.data;
  }

  async register(userData: RegisterData): Promise<{ userId: string; email: string }> {
    const { data } = await apiClient.post<ApiResponse<{ userId: string; email: string }>>('/auth/register', userData);
    return data.data;
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { email, code });
  }

  async resendVerificationCode(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(data: any): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  }

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/profile');
    
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    
    return data.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
