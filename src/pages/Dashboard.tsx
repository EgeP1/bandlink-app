import React from 'react';
import { useUser } from '../hooks/useUser';
import { usePoints } from '../hooks/usePoints';
import { useSharing } from '../hooks/useSharing';
import ShareStatus from '../components/dashboard/ShareStatus';
import DailyPoints from '../components/dashboard/DailyPoints';
import ShareTimeStats from '../components/dashboard/ShareTimeStats';
import StackedPointsChart from '../components/charts/StackedPointsChart';
import { getPointsHistory } from '../lib/database/pointsHistory';
import type { DailyPointsData } from '../types/points';

export default function Dashboard() {
  const { user } = useUser();
  const { isSharing, setIsSharing } = useSharing();
  const { dailyPoints, shareTime, referralPoints } = usePoints(user?.id, isSharing);
  const [pointsHistory, setPointsHistory] = React.useState<DailyPointsData[]>([]);

  React.useEffect(() => {
    if (user?.id) {
      getPointsHistory(user.id).then(setPointsHistory);
    }
  }, [user?.id]);

  const handleToggleShare = () => {
    setIsSharing(!isSharing);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <ShareStatus isSharing={isSharing} onToggleShare={handleToggleShare} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DailyPoints points={dailyPoints} />
        <ShareTimeStats shareTime={shareTime} referralPoints={referralPoints} />
      </div>
      <StackedPointsChart 
        data={pointsHistory} 
        title="Points History (Last 14 Days)"
        height={300}
      />
    </div>
  );
}