import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { getAllTimePoints } from '../lib/database/userStats';
import PointsHistory from '../components/rewards/PointsHistory';
import StackedPointsChart from '../components/charts/StackedPointsChart';
import { getPointsHistory } from '../lib/database/pointsHistory';
import type { DailyPointsData } from '../types/points';

export default function Rewards() {
  const { user } = useUser();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<DailyPointsData[]>([]);

  useEffect(() => {
    if (user?.id) {
      getAllTimePoints(user.id).then(setTotalPoints);
      getPointsHistory(user.id).then(setPointsHistory);
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Total Points Earned</h2>
            <p className="text-3xl font-bold text-gray-900">
              {totalPoints.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>
      </div>

      <StackedPointsChart 
        data={pointsHistory} 
        title="Points History (Last 14 Days)"
        height={400}
      />

      <PointsHistory />
    </div>
  );
}