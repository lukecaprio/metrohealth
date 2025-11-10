import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { formatDateTime, getStatusColor } from '../../utils/formatters';

const RequestList: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['staffRequests'],
    queryFn: () => staffApi.getRequests(),
  });

  const completeMutation = useMutation({
    mutationFn: (requestId: string) => staffApi.completeRequest(requestId, 'Request completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffRequests'] });
      queryClient.invalidateQueries({ queryKey: ['staffDashboard'] });
    },
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout title="Request List" className="pb-20">
        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => (
              <Card key={request.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.patient?.name || 'Unknown Patient'} - Room {request.patient?.roomNumber || 'N/A'}
                      </p>
                      {request.notes && (
                        <p className="text-sm text-gray-700 mt-2">{request.notes}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDateTime(request.createdAt)}</span>
                    {request.processedAt && (
                      <span>Completed: {formatDateTime(request.processedAt)}</span>
                    )}
                  </div>

                  {request.status !== 'COMPLETED' && (
                    <Button
                      onClick={() => completeMutation.mutate(request.id)}
                      disabled={completeMutation.isPending}
                      fullWidth
                      variant="primary"
                      className="mt-3"
                    >
                      {completeMutation.isPending ? 'Completing...' : 'Mark as Complete'}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-gray-600 py-8">No active requests.</p>
            </Card>
          )}
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default RequestList;

