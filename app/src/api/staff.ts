import { apiClient } from './client';
import type {
  StaffDashboard,
  Alert,
  AlertDetail,
  PatientListItem,
  PatientDetail,
  StaffRequest,
  Message,
} from '../types/index';

export const staffApi = {
  // Dashboard
  getDashboard: async (): Promise<StaffDashboard> => {
    const response = await apiClient.get<StaffDashboard>('/staff/dashboard');
    return response.data;
  },

  // Alerts
  getAlerts: async (status?: string): Promise<Alert[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<Alert[]>('/staff/alerts', { params });
    return response.data;
  },

  getAlertDetail: async (id: string): Promise<AlertDetail> => {
    const response = await apiClient.get<AlertDetail>(`/staff/alerts/${id}`);
    return response.data;
  },

  acknowledgeAlert: async (id: string, notes?: string): Promise<Alert> => {
    const response = await apiClient.post<Alert>(`/staff/alerts/${id}/acknowledge`, { notes });
    return response.data;
  },

  escalateAlert: async (id: string, reason?: string): Promise<Alert> => {
    const response = await apiClient.post<Alert>(`/staff/alerts/${id}/escalate`, { reason });
    return response.data;
  },

  // Patients
  getPatients: async (): Promise<PatientListItem[]> => {
    const response = await apiClient.get<PatientListItem[]>('/staff/patients');
    return response.data;
  },

  getPatientDetail: async (id: string): Promise<PatientDetail> => {
    const response = await apiClient.get<PatientDetail>(`/staff/patients/${id}`);
    return response.data;
  },

  // Requests
  getRequests: async (status?: string): Promise<StaffRequest[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<StaffRequest[]>('/staff/requests', { params });
    return response.data;
  },

  completeRequest: async (id: string, notes?: string): Promise<StaffRequest> => {
    const response = await apiClient.post<StaffRequest>(`/staff/requests/${id}/complete`, {
      notes,
    });
    return response.data;
  },

  // Messages
  getMessages: async (): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>('/staff/messages');
    return response.data;
  },

  sendMessage: async (
    patientId: string,
    data: { subject?: string; content: string }
  ): Promise<Message> => {
    const response = await apiClient.post<Message>(`/staff/messages/${patientId}`, data);
    return response.data;
  },

  replyToMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/staff/messages/${messageId}/reply`, {
      content,
    });
    return response.data;
  },

  // Appointments
  getMyAppointments: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/staff/appointments');
    return response.data;
  },

  confirmAppointment: async (appointmentId: string): Promise<any> => {
    const response = await apiClient.post(`/staff/appointments/${appointmentId}/confirm`);
    return response.data;
  },

  cancelAppointment: async (appointmentId: string, reason?: string): Promise<any> => {
    const response = await apiClient.post(`/staff/appointments/${appointmentId}/cancel`, {
      reason,
    });
    return response.data;
  },

  rescheduleAppointment: async (
    appointmentId: string,
    newDateTime: string,
  ): Promise<any> => {
    const response = await apiClient.post(`/staff/appointments/${appointmentId}/reschedule`, {
      newDateTime,
    });
    return response.data;
  },
};

