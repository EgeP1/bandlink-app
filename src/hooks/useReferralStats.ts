import { useState, useEffect } from 'react';
import { getReferralStats } from '../lib/referrals';
import type { ReferralStats } from '../types/referrals';

export function useReferralStats(userId: string | undefined) {
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_points_earned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!userId) return;
      
      setLoading(true);
      try {
        const data = await getReferralStats(userId);
        setStats(data);
      } catch (error) {
        console.error('Error loading referral stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userId]);

  return { stats, loading };
}