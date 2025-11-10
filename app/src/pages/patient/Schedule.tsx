import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { patientApi } from '../../api/patient';
import PageLayout from '../../components/layout/PageLayout';
import PatientBottomNav from '../../components/layout/PatientBottomNav';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { formatDateTime, formatDate, formatTime } from '../../utils/formatters';

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Routine Checkup');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  // Get available staff (doctors/nurses)
  const { data: availableStaff, isLoading: staffLoading } = useQuery({
    queryKey: ['availableStaff'],
    queryFn: patientApi.getAvailableStaff,
  });

  // Get availability for selected staff and date
  const { data: availability, isLoading: availabilityLoading, error: availabilityError } = useQuery({
    queryKey: ['availability', selectedStaffId, selectedDate],
    queryFn: async () => {
      if (!selectedStaffId || !selectedDate) return [];
      
      // Create dates in local timezone (not UTC) to avoid timezone conversion issues
      // selectedDate is "YYYY-MM-DD", so we create a local date
      const [year, month, day] = selectedDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      
      // Format as ISO string but the backend will parse it correctly
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      
      console.log('Fetching availability:', { selectedStaffId, selectedDate, startISO, endISO });
      try {
        const result = await patientApi.getAvailability(
          selectedStaffId,
          startISO,
          endISO,
        );
        console.log('Availability response:', result);
        return result;
      } catch (error) {
        console.error('Error fetching availability:', error);
        throw error;
      }
    },
    enabled: !!selectedStaffId && !!selectedDate,
  });

  const mutation = useMutation({
    mutationFn: (data: {
      staffId: string;
      dateTime: string;
      type: string;
      notes?: string;
    }) => patientApi.bookAppointment(data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    },
  });

  // Generate calendar dates (next 30 days)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!availability || availability.length === 0 || !selectedDate) {
      console.log('No availability data:', { availability, selectedDate });
      return [];
    }
    const staffAvailability = availability.find((a: any) => a.staffId === selectedStaffId);
    if (!staffAvailability) {
      console.log('No staff availability found for:', selectedStaffId);
      return [];
    }
    if (!staffAvailability.slots || staffAvailability.slots.length === 0) {
      console.log('No slots found for staff:', staffAvailability);
      return [];
    }
    
    // Filter slots to only show slots for the selected date
    // selectedDate is in format "YYYY-MM-DD" (local date)
    const selectedDateStr = selectedDate.split('T')[0];
    
    // Create a date range for the selected date in local timezone
    const selectedDateLocal = new Date(selectedDate + 'T00:00:00');
    const selectedDateStart = new Date(selectedDateLocal.getFullYear(), selectedDateLocal.getMonth(), selectedDateLocal.getDate(), 0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDateLocal.getFullYear(), selectedDateLocal.getMonth(), selectedDateLocal.getDate(), 23, 59, 59, 999);
    
    const filteredSlots = staffAvailability.slots.filter((slot: any) => {
      if (!slot.dateTime) return false;
      // Parse the slot date (it's in ISO format, could be UTC)
      const slotDate = new Date(slot.dateTime);
      
      // Convert to local date for comparison
      const slotLocalDate = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      const selectedLocalDate = new Date(selectedDateStart.getFullYear(), selectedDateStart.getMonth(), selectedDateStart.getDate());
      
      // Compare dates (ignoring time)
      return slotLocalDate.getTime() === selectedLocalDate.getTime();
    });
    
    console.log('Filtered slots:', { 
      selectedDateStr, 
      totalSlots: staffAvailability.slots.length, 
      filteredSlots: filteredSlots.length,
      sampleSlot: staffAvailability.slots[0]?.dateTime 
    });
    return filteredSlots;
  };

  const handleBookAppointment = () => {
    if (!selectedStaffId || !selectedDate || !selectedTime) {
      alert('Please select a doctor, date, and time');
      return;
    }

    const dateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    mutation.mutate({
      staffId: selectedStaffId,
      dateTime: dateTime.toISOString(),
      type: appointmentType,
      notes: notes.trim() || undefined,
    });
  };

  const selectedStaff = availableStaff?.find((s: any) => s.id === selectedStaffId);

  if (success) {
    return (
      <>
        <PageLayout showBack title="Book Appointment" className="pb-20">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
            <p className="text-gray-600">
              Your appointment with {selectedStaff?.name || 'your doctor'} has been confirmed.
            </p>
          </Card>
        </PageLayout>
        <PatientBottomNav />
      </>
    );
  }

  return (
    <>
      <PageLayout showBack title="Book Appointment" className="pb-20">
        <div className="space-y-6">
          {/* Doctor Selection */}
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor/Nurse <span className="text-red-600">*</span>
                </label>
                {staffLoading ? (
                  <p className="text-sm text-gray-500">Loading staff...</p>
                ) : (
                  <select
                    value={selectedStaffId}
                    onChange={(e) => {
                      setSelectedStaffId(e.target.value);
                      setSelectedDate('');
                      setSelectedTime('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-base"
                  >
                    <option value="">Select a doctor or nurse</option>
                    {availableStaff?.map((staff: any) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role === 'PHYSICIAN' ? 'Doctor' : 'Nurse'}
                        {staff.staff?.department && ` (${staff.staff.department})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedStaff && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{selectedStaff.name}</p>
                  <p className="text-xs text-gray-600">
                    {selectedStaff.role === 'PHYSICIAN' ? 'Doctor' : 'Nurse'}
                    {selectedStaff.staff?.department && ` • ${selectedStaff.staff.department}`}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Calendar View */}
          {selectedStaffId && (
            <Card>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDates.map((date, idx) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!isWeekend) {
                            setSelectedDate(dateStr);
                            setSelectedTime('');
                          }
                        }}
                        disabled={isWeekend}
                        className={`p-2 rounded-lg border-2 transition-colors text-center ${
                          isWeekend
                            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-xs mb-1 ${isWeekend ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dayName}
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            isWeekend
                              ? 'text-gray-400'
                              : isSelected
                              ? 'text-purple-600'
                              : isToday
                              ? 'text-blue-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {dayNumber}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Time Selection */}
          {selectedStaffId && selectedDate && (
            <Card>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time <span className="text-red-600">*</span>
                </label>
                {availabilityLoading ? (
                  <p className="text-sm text-gray-500">Loading available times...</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableTimeSlots().length > 0 ? (
                      getAvailableTimeSlots().map((slot: any, idx: number) => {
                        const slotTime = new Date(slot.dateTime);
                        const timeStr = `${slotTime.getHours().toString().padStart(2, '0')}:${slotTime
                          .getMinutes()
                          .toString()
                          .padStart(2, '0')}`;
                        const isSelected = selectedTime === timeStr;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTime(timeStr)}
                            className={`p-3 rounded-lg border-2 transition-colors text-center ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {formatTime(slot.dateTime)}
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-3 text-center py-4 text-gray-500 text-sm">
                        No available times for this date. Please select another date.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Appointment Type */}
          {selectedStaffId && selectedDate && selectedTime && (
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-base"
                  >
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Notes */}
          {selectedStaffId && selectedDate && selectedTime && (
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={4}
                    placeholder="Any additional information or concerns you'd like to share..."
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Appointment Summary */}
          {selectedStaffId && selectedDate && selectedTime && (
            <Card className="bg-purple-50 border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor/Nurse:</span>
                  <span className="font-medium text-gray-900">{selectedStaff?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(new Date(selectedDate).toISOString())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(new Date(`${selectedDate}T${selectedTime}`).toISOString())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{appointmentType}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Book Button */}
          {selectedStaffId && selectedDate && selectedTime && (
            <Button
              onClick={handleBookAppointment}
              disabled={mutation.isPending}
              fullWidth
            >
              {mutation.isPending ? 'Booking Appointment...' : 'Confirm & Book Appointment'}
            </Button>
          )}

          {mutation.isError && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-sm text-red-800">
                Failed to book appointment. Please try again.
              </p>
            </Card>
          )}
        </div>
      </PageLayout>
      <PatientBottomNav />
    </>
  );
};

export default Schedule;
