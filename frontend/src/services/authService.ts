import api from './api';
import { AuthToken, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  async register(data: RegisterData): Promise<AuthToken> {
    const res = await api.post<AuthToken>('/auth/register', data);
    return res.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const res = await api.post<AuthToken>('/auth/login', credentials);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async getProfile(): Promise<User> {
    const res = await api.get<User>('/users/me');
    return res.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put<User>('/users/me', data);
    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
