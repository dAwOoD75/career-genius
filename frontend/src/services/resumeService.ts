import api from './api';
import { Resume } from '@/types';

export const resumeService = {
  async createResume(data: Partial<Resume>): Promise<Resume> {
    const res = await api.post<Resume>('/resume-builder/resumes', data);
    return res.data;
  },

  async getResumes(): Promise<Resume[]> {
    const res = await api.get<Resume[]>('/resume-builder/resumes');
    return res.data;
  },

  async getResume(id: number): Promise<Resume> {
    const res = await api.get<Resume>(`/resume-builder/resumes/${id}`);
    return res.data;
  },

  async updateResume(id: number, data: Partial<Resume>): Promise<Resume> {
    const res = await api.put<Resume>(`/resume-builder/resumes/${id}`, data);
    return res.data;
  },

  async deleteResume(id: number): Promise<void> {
    await api.delete(`/resume-builder/resumes/${id}`);
  },

  async generateAISummary(data: {
    job_title: string;
    skills: string[];
    experience_years: number;
    key_achievements?: string[];
  }): Promise<string> {
    const res = await api.post<{ summary: string }>('/resume-builder/ai-summary', data);
    return res.data.summary;
  },
};
