// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'NURSE' | 'PHYSICIAN' | 'ADMIN';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// Patient Types
export interface Vitals {
  heartRate: number | null;
  bloodPressure: string | null;
  temperature: number | null;
  oxygenLevel: number | null;
  timestamp: string;
}

export interface PatientDashboard {
  welcome: string;
  patient: {
    name: string;
    roomNumber: string;
    status: string;
  };
  vitals: Vitals | null;
  nextAppointment: {
    id: string;
    dateTime: string;
    type: string;
    doctorName: string;
    status: string;
  } | null;
  counts: {
    unreadMessages: number;
    abnormalTestResults: number;
    activeRequests: number;
  };
  recentRequests: any[];
}

export interface TestResult {
  id: string;
  name: string;
  date: string;
  status: 'NORMAL' | 'ABNORMAL' | 'PENDING' | 'CRITICAL';
  summary: string;
  detailedExplanation?: string;
}

export interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  status: string;
  doctor: {
    name: string;
    role: string;
  };
}

export interface HelpRequest {
  id: string;
  type: 'WATER' | 'BLANKET' | 'RESTROOM' | 'PAIN_MEDICATION' | 'NURSE' | 'OTHER';
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  threadId?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

// Staff Types
export interface StaffDashboard {
  staffMember: {
    name: string;
    role: string;
    department: string;
    shift?: string;
  };
  summary: {
    totalPatients: number;
    activeAlerts: number;
    criticalAlerts: number;
    activeRequests: number;
    unreadMessages: number;
  };
  alerts: {
    counts: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    recent: Alert[];
  };
  requests: {
    counts: {
      queued: number;
      inProgress: number;
    };
    recent: StaffRequest[];
  };
}

export interface Alert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED';
  reason: string;
  patientName?: string;
  roomNumber?: string;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    roomNumber: string;
  };
}

export interface AlertDetail extends Alert {
  vitalsSnapshot: any;
  acknowledgedBy?: string;
  escalatedBy?: string;
  patient: {
    id: string;
    name: string;
    email: string;
    roomNumber: string;
    status: string;
    currentVitals: Vitals | null;
  };
}

export interface PatientListItem {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  status: string;
  latestVitals: Vitals | null;
}

export interface PatientDetail {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  status: string;
  demographics: {
    dateOfBirth: string | null;
    gender: string | null;
    bloodType: string | null;
    allergies: string | null;
  };
  vitals: Vitals[];
  recentAlerts: Alert[];
  recentRequests: HelpRequest[];
  recentTestResults: TestResult[];
  appointments: Appointment[];
}

export interface StaffRequest {
  id: string;
  type: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  patient: {
    id: string;
    name: string;
    roomNumber: string;
  };
  createdAt: string;
  processedAt?: string;
}

export interface AvailabilitySlot {
  staffId: string;
  staffName: string;
  role: string;
  department: string;
  slots: {
    dateTime: string;
    available: boolean;
  }[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'NURSE' | 'PHYSICIAN' | 'ADMIN';
  staff?: {
    department: string | null;
    shift: string | null;
  } | null;
}

