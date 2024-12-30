import { supabase } from '../supabase';
import { getCurrentTime } from '../time';

export interface DailyStats {
  points_earned: number;
  share_time: number;
}

export async function getDailyStats(userId: string): Promise<DailyStats> {
  const now = getCurrentTime();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('points_earned, share_time')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) throw error;
    
    return {
      points_earned: data?.points_earned || 0,
      share_time: data?.share_time || 0
    };
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return { points_earned: 0, share_time: 0 };
  }
}