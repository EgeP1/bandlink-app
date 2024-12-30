import React from 'react';
import { Award } from 'lucide-react';

type DailyPointsProps = {
  points: number;
};

export default function DailyPoints({ points }: DailyPointsProps) {
  const formattedPoints = points.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Award className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daily Total Points Earned</h2>
          <p className="text-3xl font-bold text-gray-900">{formattedPoints}</p>
        </div>
      </div>
    </div>
  );
}