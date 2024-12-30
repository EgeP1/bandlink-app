import { supabase } from '../supabase';

export interface UserStats {
  total_points: number;
  total_share_time: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('total_points, total_share_time')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    
    return {
      total_points: Number(data?.total_points || 0),
      total_share_time: Number(data?.total_share_time || 0)
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { total_points: 0, total_share_time: 0 };
  }
}

export async function getAllTimePoints(userId: string): Promise<number> {
  const stats = await getUserStats(userId);
  return stats.total_points;
}