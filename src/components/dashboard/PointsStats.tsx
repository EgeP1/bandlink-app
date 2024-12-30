import React from 'react';
import { Award, Clock } from 'lucide-react';

type PointsStatsProps = {
  points: number;
  referralPoints: number;
  shareTime: number;
};

export default function PointsStats({ points, referralPoints, shareTime }: PointsStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Points</p>
            <h3 className="text-2xl font-bold text-gray-900">{points + referralPoints}</h3>
            {referralPoints > 0 && (
              <p className="text-sm text-green-600">+{referralPoints} from referrals</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Share Time</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatTime(shareTime)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}