import React from 'react';
import type { Vitals } from '../../types/index';
import Card from '../common/Card';

interface VitalsCardProps {
  vitals: Vitals | null;
}

const VitalsCard: React.FC<VitalsCardProps> = ({ vitals }) => {
  if (!vitals) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Vitals</h2>
        <p className="text-gray-600">No vital signs available.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Vitals</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Heart Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {vitals.heartRate || '--'} bpm
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Blood Pressure</p>
          <p className="text-2xl font-bold text-gray-900">
            {vitals.bloodPressure || '--'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Oxygen Level</p>
          <p className="text-2xl font-bold text-gray-900">
            {vitals.oxygenLevel || '--'}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Temperature</p>
          <p className="text-2xl font-bold text-gray-900">
            {vitals.temperature || '--'}°C
          </p>
        </div>
      </div>
    </Card>
  );
};

export default VitalsCard;

