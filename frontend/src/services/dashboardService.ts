import api from './api';
import { DashboardStats } from '@/types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/users/me/dashboard');
    return res.data;
  },
};
