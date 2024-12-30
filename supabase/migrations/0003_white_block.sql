/*
  # Points and Referral System Implementation

  1. Changes to Profiles Table
    - Add daily_points for tracking daily earnings
    - Add season_points for seasonal tracking
    - Add total_share_time in seconds
    - Add referral_code for unique referral identification

  2. Changes to Referrals Table
    - Add referral_level (primary, secondary, tertiary)
    - Add uptime_hours for tracking 100-hour bonus
    - Add bonus_claimed boolean

  3. New Tables
    - points_history for detailed points tracking
    - daily_stats for aggregated daily statistics
*/

-- Add new columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daily_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS season_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_share_time integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS referral_tree jsonb DEFAULT '[]';

-- Add new columns to referrals
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS referral_level text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS uptime_hours integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_claimed boolean DEFAULT false;

-- Create points_history table
CREATE TABLE IF NOT EXISTS points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  points integer NOT NULL,
  source text NOT NULL, -- 'bandwidth', 'referral', 'bonus'
  referral_id uuid REFERENCES referrals(id),
  created_at timestamptz DEFAULT now()
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  date date DEFAULT CURRENT_DATE,
  points_earned integer DEFAULT 0,
  share_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on new tables
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for points_history
CREATE POLICY "Users can view own points history"
  ON points_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_stats
CREATE POLICY "Users can view own daily stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update points from bandwidth sharing
CREATE OR REPLACE FUNCTION update_bandwidth_points()
RETURNS trigger AS $$
BEGIN
  -- Update daily points
  INSERT INTO daily_stats (user_id, date, points_earned, share_time)
  VALUES (NEW.id, CURRENT_DATE, NEW.points - OLD.points, NEW.share_time)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    points_earned = daily_stats.points_earned + (NEW.points - OLD.points),
    share_time = daily_stats.share_time + (NEW.share_time - OLD.share_time);

  -- Record in points history
  INSERT INTO points_history (user_id, points, source)
  VALUES (NEW.id, NEW.points - OLD.points, 'bandwidth');

  -- Check for 100-hour bonus
  IF NEW.total_share_time >= 360000 AND OLD.total_share_time < 360000 THEN
    -- Add bonus points
    UPDATE profiles SET points = points + 10000 WHERE id = NEW.id;
    
    -- Record bonus in history
    INSERT INTO points_history (user_id, points, source)
    VALUES (NEW.id, 10000, 'bonus');
    
    -- Update referrer's bonus if exists
    INSERT INTO points_history (
      user_id,
      points,
      source,
      referral_id
    )
    SELECT 
      referrer_id,
      5000,
      'referral_bonus',
      id
    FROM referrals
    WHERE referred_id = NEW.id
    AND referral_level = 'primary'
    AND NOT bonus_claimed;
    
    -- Mark bonus as claimed
    UPDATE referrals
    SET bonus_claimed = true
    WHERE referred_id = NEW.id
    AND referral_level = 'primary';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for points updates
CREATE TRIGGER on_points_update
  AFTER UPDATE OF points ON profiles
  FOR EACH ROW
  WHEN (NEW.points IS DISTINCT FROM OLD.points)
  EXECUTE FUNCTION update_bandwidth_points();