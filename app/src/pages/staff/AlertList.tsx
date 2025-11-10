import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import AlertItem from '../../components/features/AlertItem';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

const AlertList: React.FC = () => {
  const navigate = useNavigate();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => staffApi.getAlerts(),
  });

  if (isLoading) return <Loading />;

  return (
    <>
      <PageLayout title="Alerts" className="pb-20">
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onClick={() => navigate(`/staff/alerts/${alert.id}`)}
              />
            ))
          ) : (
            <Card>
              <p className="text-center text-gray-600 py-8">No active alerts.</p>
            </Card>
          )}
        </div>
      </PageLayout>
      <BottomNav />
    </>
  );
};

export default AlertList;

