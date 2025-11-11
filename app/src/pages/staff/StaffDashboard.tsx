import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import { useAuth } from '../../hooks/useAuth';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import AlertItem from '../../components/features/AlertItem';
import PatientCard from '../../components/features/PatientCard';
import Loading from '../../components/common/Loading';
import { getStatusColor } from '../../utils/formatters';

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['staffDashboard', user?.id], // Include user ID in query key
    queryFn: staffApi.getDashboard,
    enabled: !!user?.id, // Only fetch when user is loaded
    staleTime: 0, // Always refetch when user changes
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout className="pb-20">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {dashboard?.staffMember.name || user?.name}
            </h1>
            <p className="text-gray-600">
              {dashboard?.staffMember.role} - {dashboard?.staffMember.department}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard?.summary.totalPatients || 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">{dashboard?.summary.activeAlerts || 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-700">{dashboard?.summary.criticalAlerts || 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Active Requests</p>
              <p className="text-3xl font-bold text-blue-600">{dashboard?.summary.activeRequests || 0}</p>
            </Card>
          </div>

          {/* Messages Section */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboard?.summary.unreadMessages || 0} unread
                </p>
              </div>
              <Button onClick={() => navigate('/staff/messages')} variant="primary">
                View Messages
              </Button>
            </div>
          </Card>

          {/* Appointments Section */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-green-600">
                  Manage Schedule
                </p>
              </div>
              <Button onClick={() => navigate('/staff/appointments')} variant="primary">
                View Appointments
              </Button>
            </div>
          </Card>

          {/* Alerts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Alerts</h2>
              <button
                onClick={() => navigate('/staff/alerts')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboard?.alerts.recent.slice(0, 3).map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onClick={() => navigate(`/staff/alerts/${alert.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Requests Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request List</h2>
              <button
                onClick={() => navigate('/staff/requests')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboard?.requests.recent && dashboard.requests.recent.length > 0 ? (
                dashboard.requests.recent.slice(0, 3).map((req) => (
                  <Card key={req.id} hoverable onClick={() => navigate('/staff/requests')}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">{req.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">
                          {req.patient?.name || 'Unknown Patient'} - Room {req.patient?.roomNumber || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-gray-600 text-center">No active requests</p>
                </Card>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={() => {
              logout();
              navigate('/staff/login');
            }}
            variant="secondary"
            fullWidth
          >
            Logout
          </Button>
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default StaffDashboard;

