import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Patient Pages (will be created next)
import PatientLogin from './pages/patient/PatientLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import RequestHelp from './pages/patient/RequestHelp';
import TestResults from './pages/patient/TestResults';
import TestResultDetail from './pages/patient/TestResultDetail';
import Schedule from './pages/patient/Schedule';
import Messages from './pages/patient/Messages';

// Staff Pages (will be created next)
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';
import AlertList from './pages/staff/AlertList';
import AlertDetail from './pages/staff/AlertDetail';
import PatientList from './pages/staff/PatientList';
import PatientDetail from './pages/staff/PatientDetail';
import RequestList from './pages/staff/RequestList';
import StaffMessages from './pages/staff/StaffMessages';
import StaffAppointments from './pages/staff/StaffAppointments';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/patient/login" replace />} />

          {/* Patient Routes */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/help" element={<RequestHelp />} />
          <Route path="/patient/test-results" element={<TestResults />} />
          <Route path="/patient/test-results/:id" element={<TestResultDetail />} />
          <Route path="/patient/schedule" element={<Schedule />} />
          <Route path="/patient/messages" element={<Messages />} />

          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/alerts" element={<AlertList />} />
          <Route path="/staff/alerts/:id" element={<AlertDetail />} />
          <Route path="/staff/patients" element={<PatientList />} />
          <Route path="/staff/patients/:id" element={<PatientDetail />} />
          <Route path="/staff/requests" element={<RequestList />} />
          <Route path="/staff/messages" element={<StaffMessages />} />
          <Route path="/staff/appointments" element={<StaffAppointments />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
