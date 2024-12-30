import { supabase } from '../supabase';
import { getCurrentTime } from '../time';

export async function updatePoints(userId: string, cpuUsage: number): Promise<number> {
  const now = getCurrentTime();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString().split('T')[0];
  
  const pointsEarned = Number((cpuUsage * 0.25).toFixed(2));

  try {
    // Only update daily_stats - user_stats will be updated via trigger
    await supabase.rpc('update_daily_stats', {
      user_id_param: userId,
      points_param: pointsEarned,
      share_time_param: 5,
      date_param: today
    });

    return pointsEarned;
  } catch (error) {
    console.error('Error updating points:', error);
    return 0;
  }
}