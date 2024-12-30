import { useState, useEffect, useCallback } from 'react';
import { updatePoints } from '../lib/points';
import { getDailyStats } from '../lib/database/stats';
import { resetDailyStats } from '../lib/database/dailyReset';
import { getCurrentTime } from '../lib/time';

export function usePoints(userId: string | undefined, isSharing: boolean) {
  const [dailyPoints, setDailyPoints] = useState(0);
  const [shareTime, setShareTime] = useState(0);
  const [referralPoints, setReferralPoints] = useState(0);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    const stats = await getDailyStats(userId);
    setDailyPoints(stats.points_earned);
    setShareTime(stats.share_time);
  }, [userId]);

  // Check for UTC midnight reset
  useEffect(() => {
    const checkReset = async () => {
      const now = getCurrentTime();
      const prevMinute = new Date(now.getTime() - 60000);
      
      // Check if we just crossed UTC midnight
      if (now.getUTCDate() !== prevMinute.getUTCDate()) {
        console.log('Midnight UTC reached - resetting stats');
        await resetDailyStats();
        setDailyPoints(0);
        setShareTime(0);
      }
    };

    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update points while sharing
  useEffect(() => {
    if (!userId || !isSharing) return;

    const updateInterval = async () => {
      const pointsEarned = await updatePoints(userId);
      if (pointsEarned > 0) {
        setDailyPoints(prev => prev + pointsEarned);
        setShareTime(prev => prev + 5);
      }
    };

    const interval = setInterval(updateInterval, 5000);
    return () => clearInterval(interval);
  }, [userId, isSharing]);

  // Load initial stats
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { dailyPoints, shareTime, referralPoints };
}