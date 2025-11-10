import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor } from '../../utils/formatters';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => staffApi.getPatientDetail(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (!patient) return <div>Patient not found</div>;

  return (
    <>
      <PageLayout showBack title="Patient Detail" className="pb-20">
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{patient.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Room</p>
                <p className="font-semibold text-gray-900">{patient.roomNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{patient.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Blood Type</p>
                <p className="font-semibold text-gray-900">{patient.demographics.bloodType || 'N/A'}</p>
              </div>
            </div>

            {patient.demographics.allergies && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800">Allergies:</p>
                <p className="text-sm text-red-700">{patient.demographics.allergies}</p>
              </div>
            )}
          </Card>

          {/* Latest Vitals */}
          {patient.vitals && patient.vitals.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vitals</h3>
              <div className="grid grid-cols-2 gap-4">
                {patient.vitals[0].heartRate && (
                  <div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-xl font-bold text-gray-900">{patient.vitals[0].heartRate} bpm</p>
                  </div>
                )}
                {patient.vitals[0].bloodPressure && (
                  <div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-xl font-bold text-gray-900">{patient.vitals[0].bloodPressure}</p>
                  </div>
                )}
                {patient.vitals[0].oxygenLevel && (
                  <div>
                    <p className="text-sm text-gray-600">Oxygen Level</p>
                    <p className="text-xl font-bold text-gray-900">{patient.vitals[0].oxygenLevel}%</p>
                  </div>
                )}
                {patient.vitals[0].temperature && (
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="text-xl font-bold text-gray-900">{patient.vitals[0].temperature}°C</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recent Alerts */}
          {patient.recentAlerts && patient.recentAlerts.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-2">
                {patient.recentAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(alert.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-900">{alert.reason}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Test Results */}
          {patient.recentTestResults && patient.recentTestResults.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Results</h3>
              <div className="space-y-2">
                {patient.recentTestResults.slice(0, 3).map((result) => (
                  <div key={result.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-600">{formatDate(result.date)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default PatientDetail;

