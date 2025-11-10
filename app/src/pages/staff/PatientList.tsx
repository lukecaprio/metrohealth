import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import PatientCard from '../../components/features/PatientCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

const PatientList: React.FC = () => {
  const navigate = useNavigate();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: staffApi.getPatients,
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout title="Patient List" className="pb-20">
        <div className="space-y-4">
          {patients && patients.length > 0 ? (
            patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/staff/patients/${patient.id}`)}
              />
            ))
          ) : (
            <Card>
              <p className="text-center text-gray-600 py-8">No patients found.</p>
            </Card>
          )}
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default PatientList;

