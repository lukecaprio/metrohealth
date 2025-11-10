import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientApi } from '../../api/patient';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import PatientBottomNav from '../../components/layout/PatientBottomNav';
import Button from '../../components/common/Button';
import VitalsCard from '../../components/features/VitalsCard';
import Loading from '../../components/common/Loading';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['patientDashboard'],
    queryFn: patientApi.getDashboard,
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout className="pb-20">
        <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {dashboard?.welcome || `Welcome, ${user?.name}`}
          </h1>
          <p className="text-gray-600">
            Hello, {dashboard?.patient.name}! Here's a quick overview of your health today.
          </p>
        </div>

        {/* Vitals */}
        <VitalsCard vitals={dashboard?.vitals || null} />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/patient/help')}
            fullWidth
            className="h-24 flex items-center justify-center"
          >
            Request Help
          </Button>

          <Button
            onClick={() => navigate('/patient/test-results')}
            fullWidth
            className="h-24 flex items-center justify-center"
          >
            Test Results
          </Button>

          <Button
            onClick={() => navigate('/patient/schedule')}
            fullWidth
            className="h-24 flex items-center justify-center"
          >
            Book Appointment
          </Button>

          <Button
            onClick={() => navigate('/patient/messages')}
            fullWidth
            className="h-24 flex items-center justify-center"
          >
            View Messages
          </Button>
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => {
            logout();
            navigate('/patient/login');
          }}
          variant="secondary"
          fullWidth
        >
          Logout
        </Button>
        </div>
      </PageLayout>
      <PatientBottomNav />
    </>
  );
};

export default PatientDashboard;

