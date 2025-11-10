import { apiClient } from './client';
import type { LoginResponse } from '../types/index';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  resetDemoData: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-demo');
    return response.data;
  },
};

