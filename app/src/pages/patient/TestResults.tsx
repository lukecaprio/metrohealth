import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientApi } from '../../api/patient';
import PageLayout from '../../components/layout/PageLayout';
import PatientBottomNav from '../../components/layout/PatientBottomNav';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor } from '../../utils/formatters';

const TestResults: React.FC = () => {
  const navigate = useNavigate();

  const { data: testResults, isLoading } = useQuery({
    queryKey: ['testResults'],
    queryFn: patientApi.getTestResults,
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout showBack title="Test Results" className="pb-20">
        <div className="space-y-4">
          {testResults && testResults.length > 0 ? (
            testResults.map((result) => (
              <Card
                key={result.id}
                onClick={() => navigate(`/patient/test-results/${result.id}`)}
                hoverable
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {result.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(result.date)}</p>
                    <p className="text-sm text-gray-700">{result.summary}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-gray-600 py-8">No test results available.</p>
            </Card>
          )}
        </div>
      </PageLayout>
      <PatientBottomNav />
    </>
  );
};

export default TestResults;

