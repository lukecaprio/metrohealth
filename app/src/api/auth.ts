import { apiClient } from './client';
import type { LoginResponse } from '../types/index';

export interface RegisterPatientData {
  email: string;
  password: string;
  name: string;
  roomNumber?: string;
  status?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
}

export interface RegisterStaffData {
  email: string;
  password: string;
  name: string;
  role: 'NURSE' | 'PHYSICIAN' | 'ADMIN';
  department?: string;
  shift?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  message: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  registerPatient: async (data: RegisterPatientData): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register/patient', data);
    return response.data;
  },

  registerStaff: async (data: RegisterStaffData): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register/staff', data);
    return response.data;
  },

  resetDemoData: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-demo');
    return response.data;
  },
};

