import api from './api';
import { SalaryPrediction } from '@/types';

export const salaryService = {
  async predict(data: {
    job_title: string;
    experience_years: number;
    country: string;
    city?: string;
    education_level?: string;
    skills?: string[];
    industry?: string;
    company_size?: string;
  }): Promise<SalaryPrediction> {
    const res = await api.post<SalaryPrediction>('/salary/predict', data, { timeout: 90000 });
    return res.data;
  },

  async getAll(): Promise<SalaryPrediction[]> {
    const res = await api.get<SalaryPrediction[]>('/salary/predictions');
    return res.data;
  },

  async getOne(id: number): Promise<SalaryPrediction> {
    const res = await api.get<SalaryPrediction>(`/salary/predictions/${id}`);
    return res.data;
  },
};
