import React from 'react';
import type { PatientListItem } from '../../types/index';
import Card from '../common/Card';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { getStatusColor } from '../../utils/formatters';

interface PatientCardProps {
  patient: PatientListItem;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  return (
    <Card onClick={onClick} hoverable={!!onClick}>
      <div className="flex items-center space-x-4">
        <UserCircleIcon className="w-12 h-12 text-purple-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {patient.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-600">Room {patient.roomNumber}</span>
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(patient.status)}`}>
              {patient.status}
            </span>
          </div>
          {patient.latestVitals && (
            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
              <span>HR: {patient.latestVitals.heartRate}</span>
              <span>BP: {patient.latestVitals.bloodPressure}</span>
              <span>O2: {patient.latestVitals.oxygenLevel}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;

