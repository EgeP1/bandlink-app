export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_points_earned: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  tier: number;
  status: 'pending' | 'active' | 'inactive';
  bonus_claimed: boolean;
  created_at: string;
}