import api from './api';
import { ChatSession, ChatMessage } from '@/types';

export const interviewService = {
  async createSession(data: {
    interview_type: string;
    difficulty: string;
    job_role?: string;
    technology_stack?: string;
  }): Promise<ChatSession> {
    const res = await api.post<ChatSession>('/interview/sessions', data);
    return res.data;
  },

  async sendMessage(sessionId: number, content: string): Promise<ChatMessage> {
    const res = await api.post<ChatMessage>(`/interview/sessions/${sessionId}/message`, { content }, { timeout: 90000 });
    return res.data;
  },

  async endSession(sessionId: number): Promise<any> {
    const res = await api.post(`/interview/sessions/${sessionId}/end`);
    return res.data;
  },

  async getSessions(): Promise<ChatSession[]> {
    const res = await api.get<ChatSession[]>('/interview/sessions');
    return res.data;
  },

  async getSession(id: number): Promise<ChatSession> {
    const res = await api.get<ChatSession>(`/interview/sessions/${id}`);
    return res.data;
  },
};
