import { supabase } from './supabase';
import type { ReferralStats } from '../types/referrals';

export async function generateReferralCode(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  return `${window.location.origin}/ref/${user.id}`;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const { data, error } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    return data || {
      total_referrals: 0,
      active_referrals: 0,
      total_points_earned: 0
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return {
      total_referrals: 0,
      active_referrals: 0,
      total_points_earned: 0
    };
  }
}

export async function createReferral(referrerId: string, referredId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        status: 'pending'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating referral:', error);
    return false;
  }
}