import React from 'react';
import type { Alert } from '../../types/index';
import Card from '../common/Card';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { getStatusColor } from '../../utils/formatters';

interface AlertItemProps {
  alert: Alert;
  onClick?: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onClick }) => {
  const severityColors = {
    LOW: 'text-blue-600',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600',
  };

  return (
    <Card onClick={onClick} hoverable={!!onClick} className="border-l-4" style={{
      borderLeftColor:
        alert.severity === 'CRITICAL' ? '#dc2626' :
        alert.severity === 'HIGH' ? '#ea580c' :
        alert.severity === 'MEDIUM' ? '#ca8a04' : '#2563eb'
    }}>
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className={`w-6 h-6 flex-shrink-0 ${severityColors[alert.severity]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(alert.severity)}`}>
              {alert.severity}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(alert.status)}`}>
              {alert.status}
            </span>
          </div>
          <p className="text-base text-gray-900 font-medium mt-2">{alert.reason}</p>
          {alert.patientName && (
            <p className="text-sm text-gray-600 mt-1">
              {alert.patientName} - Room {alert.roomNumber}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AlertItem;

