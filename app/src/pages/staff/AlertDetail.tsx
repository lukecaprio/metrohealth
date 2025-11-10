import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { getStatusColor } from '../../utils/formatters';

const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: alert, isLoading } = useQuery({
    queryKey: ['alert', id],
    queryFn: () => staffApi.getAlertDetail(id!),
    enabled: !!id,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: () => staffApi.acknowledgeAlert(id!, 'Alert acknowledged'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['staffDashboard'] });
      setTimeout(() => navigate('/staff/alerts'), 1000);
    },
  });

  const escalateMutation = useMutation({
    mutationFn: () => staffApi.escalateAlert(id!, 'Escalated to senior staff'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['staffDashboard'] });
      setTimeout(() => navigate('/staff/alerts'), 1000);
    },
  });

  if (isLoading) return <Loading />;
  if (!alert) return <div>Alert not found</div>;

  return (
    <>
      <PageLayout showBack title="Alert Detail" className="pb-20">
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex-1">
                {alert.reason}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="text-lg font-semibold text-gray-900">
                  {alert.patient?.name || 'Unknown Patient'}
                </p>
                <p className="text-sm text-gray-600">
                  Room {alert.patient?.roomNumber || 'N/A'} - {alert.patient?.status || 'Unknown'}
                </p>
              </div>
            </div>
          </Card>

          {/* Current Vitals */}
          {alert.patient?.currentVitals && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Vitals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Heart Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {alert.patient.currentVitals.heartRate} bpm
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="text-xl font-bold text-gray-900">
                    {alert.patient.currentVitals.bloodPressure}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Oxygen Level</p>
                  <p className="text-xl font-bold text-gray-900">
                    {alert.patient.currentVitals.oxygenLevel}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-xl font-bold text-gray-900">
                    {alert.patient.currentVitals.temperature}°C
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          {alert.status === 'ACTIVE' && (
            <div className="space-y-3">
              <Button
                onClick={() => acknowledgeMutation.mutate()}
                disabled={acknowledgeMutation.isPending}
                fullWidth
              >
                {acknowledgeMutation.isPending ? 'Processing...' : 'Acknowledge Alert'}
              </Button>

              <Button
                onClick={() => escalateMutation.mutate()}
                disabled={escalateMutation.isPending}
                variant="danger"
                fullWidth
              >
                {escalateMutation.isPending ? 'Processing...' : 'Escalate Alert'}
              </Button>
            </div>
          )}
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default AlertDetail;

