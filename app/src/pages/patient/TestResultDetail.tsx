import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientApi } from '../../api/patient';
import PageLayout from '../../components/layout/PageLayout';
import PatientBottomNav from '../../components/layout/PatientBottomNav';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor } from '../../utils/formatters';

const TestResultDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: result, isLoading } = useQuery({
    queryKey: ['testResult', id],
    queryFn: () => patientApi.getTestResultDetail(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (!result) return <div>Test result not found</div>;

  return (
    <>
      <PageLayout showBack title="Test Result Detail" className="pb-20">
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.name}</h2>
                <p className="text-gray-600">{formatDate(result.date)}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(result.status)}`}>
                {result.status}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700">{result.summary}</p>
            </div>
          </Card>

          {result.detailedExplanation && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Explanation</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {result.detailedExplanation}
              </p>
            </Card>
          )}
        </div>
      </PageLayout>
      <PatientBottomNav />
    </>
  );
};

export default TestResultDetail;

