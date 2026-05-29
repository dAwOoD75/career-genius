import api from './api';
import { ATSReport } from '@/types';

export const cvService = {
  async analyzeCV(file: File, jobDescription?: string): Promise<ATSReport> {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) formData.append('job_description', jobDescription);

    const res = await api.post<ATSReport>('/cv-analyzer/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },

  async getReports(): Promise<ATSReport[]> {
    const res = await api.get<ATSReport[]>('/cv-analyzer/reports');
    return res.data;
  },

  async getReport(id: number): Promise<ATSReport> {
    const res = await api.get<ATSReport>(`/cv-analyzer/reports/${id}`);
    return res.data;
  },

  async deleteReport(id: number): Promise<void> {
    await api.delete(`/cv-analyzer/reports/${id}`);
  },

  async getSuggestions(reportId: number): Promise<string[]> {
    const res = await api.get<{ suggestions: string[] }>(`/cv-analyzer/reports/${reportId}/suggestions`);
    return res.data.suggestions;
  },

  async downloadImprovedCV(reportId: number): Promise<void> {
    const res = await api.post(`/cv-analyzer/reports/${reportId}/improve`, {}, { responseType: 'blob', timeout: 120000 });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `improved_cv_${reportId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
