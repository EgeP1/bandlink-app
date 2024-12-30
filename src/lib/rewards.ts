import { supabase } from './supabase';

export async function getDailyRewards() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('date', today)
      .order('points_required', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily rewards:', error);
    return [];
  }
}