import { apiClient } from './client';
import type {
  PatientDashboard,
  TestResult,
  Appointment,
  HelpRequest,
  Message,
  AvailabilitySlot,
} from '../types/index';

export const patientApi = {
  // Dashboard
  getDashboard: async (): Promise<PatientDashboard> => {
    const response = await apiClient.get<PatientDashboard>('/patients/me/dashboard');
    return response.data;
  },

  // Test Results
  getTestResults: async (): Promise<TestResult[]> => {
    const response = await apiClient.get<TestResult[]>('/patients/me/test-results');
    return response.data;
  },

  getTestResultDetail: async (id: string): Promise<TestResult> => {
    const response = await apiClient.get<TestResult>(`/patients/me/test-results/${id}`);
    return response.data;
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>('/patients/me/appointments');
    return response.data;
  },

  getAvailability: async (
    staffId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AvailabilitySlot[]> => {
    const params = new URLSearchParams();
    if (staffId) params.append('staffId', staffId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/appointments/availability${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<AvailabilitySlot[]>(url);
    return response.data;
  },

  bookAppointment: async (data: {
    staffId: string;
    dateTime: string;
    type: string;
    notes?: string;
  }): Promise<any> => {
    const response = await apiClient.post('/appointments/book', data);
    return response.data;
  },

  // Help Requests
  getRequests: async (): Promise<HelpRequest[]> => {
    const response = await apiClient.get<HelpRequest[]>('/patients/me/requests');
    return response.data;
  },

  createRequest: async (data: { type: string; notes?: string }): Promise<HelpRequest> => {
    const response = await apiClient.post<HelpRequest>('/patients/me/requests', data);
    return response.data;
  },

  // Messages
  getMessages: async (): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>('/patients/me/messages');
    return response.data;
  },

  getAvailableStaff: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/patients/me/available-staff');
    return response.data;
  },

  sendMessage: async (data: { subject?: string; content: string; receiverId?: string }): Promise<Message> => {
    const response = await apiClient.post<Message>('/patients/me/messages', data);
    return response.data;
  },

  replyToMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/patients/me/messages/${messageId}/reply`, {
      content,
    });
    return response.data;
  },
};

