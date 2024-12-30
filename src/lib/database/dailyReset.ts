import { supabase } from '../supabase';

export async function resetDailyStats(): Promise<void> {
  try {
    await supabase.rpc('reset_daily_stats');
  } catch (error) {
    console.error('Error resetting daily stats:', error);
  }
}