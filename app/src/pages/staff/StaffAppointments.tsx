import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDateTime } from '../../utils/formatters';

const StaffAppointments: React.FC = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['staffAppointments'],
    queryFn: staffApi.getMyAppointments,
  });

  const confirmMutation = useMutation({
    mutationFn: (appointmentId: string) => staffApi.confirmAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
      setSelectedAppointmentId(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason?: string }) =>
      staffApi.cancelAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
      setSelectedAppointmentId(null);
      setCancelReason('');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ appointmentId, newDateTime }: { appointmentId: string; newDateTime: string }) =>
      staffApi.rescheduleAppointment(appointmentId, newDateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
      setShowReschedule(null);
      setNewDateTime('');
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'text-red-600 font-semibold';
      case 'OBSERVATION':
        return 'text-orange-600 font-semibold';
      case 'STABLE':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout showBack title="Upcoming Appointments" className="pb-20">
        <div className="space-y-4">
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => {
              const isExpanded = selectedAppointmentId === appointment.id;
              const isRescheduling = showReschedule === appointment.id;

              return (
                <Card key={appointment.id}>
                  <div className="space-y-3">
                    {/* Appointment Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Room {appointment.patient.roomNumber || 'N/A'} •{' '}
                          <span className={getPatientStatusColor(appointment.patient.status)}>
                            {appointment.patient.status}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          appointment.status,
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 w-24">Date & Time:</span>
                          <span className="text-gray-900">
                            {formatDateTime(appointment.dateTime)}
                          </span>
                        </div>
                        {appointment.type && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium text-gray-700 w-24">Type:</span>
                            <span className="text-gray-900">{appointment.type}</span>
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="flex items-start text-sm">
                            <span className="font-medium text-gray-700 w-24">Notes:</span>
                            <span className="text-gray-900 flex-1">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isExpanded && appointment.status !== 'CANCELLED' && (
                      <div className="pt-2">
                        <Button
                          onClick={() => setSelectedAppointmentId(appointment.id)}
                          variant="secondary"
                          fullWidth
                        >
                          Manage Appointment
                        </Button>
                      </div>
                    )}

                    {/* Expanded Actions */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-gray-200 space-y-3">
                        {/* Confirm Button */}
                        {appointment.status === 'SCHEDULED' && (
                          <Button
                            onClick={() => confirmMutation.mutate(appointment.id)}
                            disabled={confirmMutation.isPending}
                            fullWidth
                          >
                            {confirmMutation.isPending ? 'Confirming...' : 'Confirm Appointment'}
                          </Button>
                        )}

                        {/* Reschedule Button */}
                        {!isRescheduling && (
                          <Button
                            onClick={() => setShowReschedule(appointment.id)}
                            variant="secondary"
                            fullWidth
                          >
                            Reschedule
                          </Button>
                        )}

                        {/* Reschedule Form */}
                        {isRescheduling && (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700">
                              New Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={newDateTime}
                              onChange={(e) => setNewDateTime(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (newDateTime) {
                                    rescheduleMutation.mutate({
                                      appointmentId: appointment.id,
                                      newDateTime,
                                    });
                                  }
                                }}
                                disabled={!newDateTime || rescheduleMutation.isPending}
                                fullWidth
                              >
                                {rescheduleMutation.isPending
                                  ? 'Rescheduling...'
                                  : 'Confirm Reschedule'}
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowReschedule(null);
                                  setNewDateTime('');
                                }}
                                variant="secondary"
                                fullWidth
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Cancel Section */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Cancel Reason (Optional)
                          </label>
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="e.g., Patient requested cancellation"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          <Button
                            onClick={() =>
                              cancelMutation.mutate({
                                appointmentId: appointment.id,
                                reason: cancelReason,
                              })
                            }
                            disabled={cancelMutation.isPending}
                            variant="secondary"
                            fullWidth
                          >
                            {cancelMutation.isPending
                              ? 'Cancelling...'
                              : 'Cancel Appointment'}
                          </Button>
                        </div>

                        {/* Close Button */}
                        <Button
                          onClick={() => setSelectedAppointmentId(null)}
                          variant="secondary"
                          fullWidth
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-2">No upcoming appointments</p>
                <p className="text-gray-500 text-sm">
                  Your upcoming appointments will appear here
                </p>
              </div>
            </Card>
          )}
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default StaffAppointments;

