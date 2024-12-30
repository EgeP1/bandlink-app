import { supabase } from '../supabase';
import { useEffect } from 'react';
import { DailyPointsData } from '../../types/points';
import { getDateRange } from '../../utils/dateHelpers';

export async function getPointsHistory(userId: string): Promise<DailyPointsData[]> {
  try {
    // Get today's points from daily_stats
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats } = await supabase
      .from('daily_stats')
      .select('date, points_earned, referral_points')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle(); // Use maybeSingle instead of single to handle empty results gracefully

    // Get historical points from points_history
    const { data: historyData } = await supabase
      .from('points_history')
      .select('date, points, source')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    // Get last 14 days range
    const dateRange = getDateRange(14);
    const pointsByDate = new Map<string, DailyPointsData>();

    // Initialize all dates with zero values
    dateRange.forEach(date => {
      pointsByDate.set(date, {
        date,
        bandwidthPoints: 0,
        referralPoints: 0
      });
    });

    // Add historical data
    historyData?.forEach(record => {
      const date = record.date;
      const entry = pointsByDate.get(date) || {
        date,
        bandwidthPoints: 0,
        referralPoints: 0
      };
      
      if (record.source === 'referral') {
        entry.referralPoints = Number(record.points) || 0;
      } else {
        entry.bandwidthPoints = Number(record.points) || 0;
      }
      
      pointsByDate.set(date, entry);
    });

    // Add today's data if available
    if (todayStats) {
      pointsByDate.set(today, {
        date: today,
        bandwidthPoints: Number(todayStats.points_earned) || 0,
        referralPoints: Number(todayStats.referral_points) || 0
      });
    }

    return Array.from(pointsByDate.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching points history:', error);
    return [];
  }
}

export function usePointsHistorySubscription(
  userId: string | undefined, 
  onUpdate: () => void
) {
  useEffect(() => {
    if (!userId) return;

    const channels = [
      supabase
        .channel('points_history_changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'points_history',
            filter: `user_id=eq.${userId}`
          },
          onUpdate
        )
        .subscribe(),

      supabase
        .channel('daily_stats_changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'daily_stats',
            filter: `user_id=eq.${userId}`
          },
          onUpdate
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, onUpdate]);
}