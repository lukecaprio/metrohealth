import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { patientApi } from '../../api/patient';
import PageLayout from '../../components/layout/PageLayout';
import PatientBottomNav from '../../components/layout/PatientBottomNav';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const RequestHelp: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: { type: string; notes?: string }) => patientApi.createRequest(data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    },
  });

  const requestTypes = [
    { value: 'WATER', label: 'Water' },
    { value: 'BLANKET', label: 'Blanket' },
    { value: 'RESTROOM', label: 'Restroom Assistance' },
    { value: 'PAIN_MEDICATION', label: 'Pain Medication' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType) {
      mutation.mutate({ type: selectedType, notes: notes || undefined });
    }
  };

  if (success) {
    return (
      <>
        <PageLayout showBack title="Request Help" className="pb-20">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600">A staff member will be with you shortly.</p>
          </Card>
        </PageLayout>
        <PatientBottomNav />
      </>
    );
  }

  return (
    <>
      <PageLayout showBack title="Request Help" className="pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">What do you need help with?</h2>
          <div className="space-y-3">
            {requestTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-colors ${
                  selectedType === type.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows={4}
            placeholder="Any additional information..."
          />
        </Card>

        <Button
          type="submit"
          disabled={!selectedType || mutation.isPending}
          fullWidth
        >
          {mutation.isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
        </form>
      </PageLayout>
      <PatientBottomNav />
    </>
  );
};

export default RequestHelp;

