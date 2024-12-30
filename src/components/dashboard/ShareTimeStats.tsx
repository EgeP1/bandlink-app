import React from 'react';
import { Clock } from 'lucide-react';

type ShareTimeStatsProps = {
  shareTime: number;
  referralPoints: number;
};

export default function ShareTimeStats({ shareTime, referralPoints }: ShareTimeStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const hoursText = hours === 1 ? 'hour' : 'hours';
    const minutesText = minutes === 1 ? 'minute' : 'minutes';
    
    if (hours === 0) {
      return `${minutes} ${minutesText}`;
    }
    
    if (minutes === 0) {
      return `${hours} ${hoursText}`;
    }
    
    return `${hours} ${hoursText} ${minutes} ${minutesText}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-purple-100 rounded-full">
          <Clock className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daily Total Share Time</h2>
          <p className="text-3xl font-bold text-gray-900">{formatTime(shareTime)}</p>
          {referralPoints > 0 && (
            <p className="text-sm text-green-600 mt-1">
              +{referralPoints.toLocaleString()} points from referrals
            </p>
          )}
        </div>
      </div>
    </div>
  );
}