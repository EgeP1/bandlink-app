/*
  # Add Referral System and Update Rewards

  1. New Tables
    - referrals: Track user referrals and bonuses
    - referral_stats: Aggregate referral statistics
    - reward_redemptions: Track reward redemption history

  2. Changes
    - Add referral tracking
    - Update rewards system
    - Add redemption tracking

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  points_earned numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id)
);

-- Create referral_stats table
CREATE TABLE IF NOT EXISTS referral_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_referrals integer DEFAULT 0,
  active_referrals integer DEFAULT 0,
  total_points_earned numeric(10,2) DEFAULT 0.00,
  last_referral_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create reward_redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards(id) ON DELETE SET NULL,
  points_spent numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  redemption_code text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON reward_redemptions(status);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for referral_stats
CREATE POLICY "Users can view own referral stats"
  ON referral_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for reward_redemptions
CREATE POLICY "Users can view own redemptions"
  ON reward_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions"
  ON reward_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS trigger AS $$
BEGIN
  INSERT INTO referral_stats (
    user_id,
    total_referrals,
    active_referrals,
    total_points_earned,
    last_referral_at
  )
  SELECT
    NEW.referrer_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    SUM(points_earned),
    MAX(created_at)
  FROM referrals
  WHERE referrer_id = NEW.referrer_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_referrals = EXCLUDED.total_referrals,
    active_referrals = EXCLUDED.active_referrals,
    total_points_earned = EXCLUDED.total_points_earned,
    last_referral_at = EXCLUDED.last_referral_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating referral stats
CREATE TRIGGER on_referral_change
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats();

-- Function to process reward redemption
CREATE OR REPLACE FUNCTION process_reward_redemption()
RETURNS trigger AS $$
BEGIN
  -- Update user stats
  UPDATE user_stats
  SET total_points = total_points - NEW.points_spent
  WHERE user_id = NEW.user_id;
  
  -- Update reward quantity
  UPDATE rewards
  SET available_quantity = available_quantity - 1
  WHERE id = NEW.reward_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for processing redemptions
CREATE TRIGGER on_redemption_created
  AFTER INSERT ON reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION process_reward_redemption();