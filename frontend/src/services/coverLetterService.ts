import api from './api';
import { CoverLetter } from '@/types';

export const coverLetterService = {
  async generate(data: {
    company_name?: string;
    job_title?: string;
    job_description?: string;
    applicant_name?: string;
    tone?: string;
    additional_context?: string;
  }): Promise<CoverLetter> {
    const res = await api.post<CoverLetter>('/cover-letter/generate', data, { timeout: 90000 });
    return res.data;
  },

  async getAll(): Promise<CoverLetter[]> {
    const res = await api.get<CoverLetter[]>('/cover-letter/letters');
    return res.data;
  },

  async getOne(id: number): Promise<CoverLetter> {
    const res = await api.get<CoverLetter>(`/cover-letter/letters/${id}`);
    return res.data;
  },

  async update(id: number, data: Partial<CoverLetter>): Promise<CoverLetter> {
    const res = await api.put<CoverLetter>(`/cover-letter/letters/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/cover-letter/letters/${id}`);
  },
};
