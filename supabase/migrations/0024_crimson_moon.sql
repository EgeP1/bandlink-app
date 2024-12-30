/*
  # Fix Referral Stats Table

  1. Changes
    - Drop and recreate referral_stats table
    - Add proper indexes and constraints
    - Update trigger function for stats calculation

  2. Security
    - Enable RLS on referral_stats table
    - Add policy for authenticated users
*/

-- Drop existing referral_stats if it exists
DROP TABLE IF EXISTS referral_stats;

-- Create referral_stats table
CREATE TABLE referral_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_referrals integer DEFAULT 0,
  active_referrals integer DEFAULT 0,
  total_points_earned numeric(10,2) DEFAULT 0.00,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own referral stats"
  ON referral_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_referral_stats_points 
ON referral_stats(total_points_earned DESC);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_referral_change ON referrals;

-- Function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS trigger AS $$
BEGIN
  -- Insert or update stats for the referrer
  INSERT INTO referral_stats (
    user_id,
    total_referrals,
    active_referrals,
    total_points_earned,
    last_updated
  )
  SELECT
    NEW.referrer_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COALESCE(SUM(
      CASE 
        WHEN tier = 1 THEN daily_stats.points_earned * 0.20
        WHEN tier = 2 THEN daily_stats.points_earned * 0.10
        WHEN tier = 3 THEN daily_stats.points_earned * 0.05
        ELSE 0
      END
    ), 0),
    now()
  FROM referrals
  LEFT JOIN daily_stats ON daily_stats.user_id = referrals.referred_id
  WHERE referrer_id = NEW.referrer_id
  GROUP BY referrer_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_referrals = EXCLUDED.total_referrals,
    active_referrals = EXCLUDED.active_referrals,
    total_points_earned = EXCLUDED.total_points_earned,
    last_updated = EXCLUDED.last_updated;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for updating stats
CREATE TRIGGER on_referral_change
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats();

-- Grant necessary permissions
GRANT SELECT ON referral_stats TO authenticated;