/*
  # Add Referral Points Column
  
  1. Changes
    - Add referral_points column to daily_stats table
    - Update existing functions to handle referral points
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add referral_points column to daily_stats
ALTER TABLE daily_stats
ADD COLUMN IF NOT EXISTS referral_points numeric(10,2) DEFAULT 0.00;

-- Add check constraint
ALTER TABLE daily_stats
ADD CONSTRAINT positive_referral_points CHECK (referral_points >= 0);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_stats_referral_points 
ON daily_stats(referral_points DESC);

-- Update the update_daily_stats function to handle referral points
CREATE OR REPLACE FUNCTION update_daily_stats(
  user_id_param uuid,
  points_param numeric,
  referral_points_param numeric,
  share_time_param integer,
  date_param date
)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (
    user_id,
    date,
    points_earned,
    referral_points,
    share_time
  )
  VALUES (
    user_id_param,
    date_param,
    points_param,
    referral_points_param,
    share_time_param
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    points_earned = daily_stats.points_earned + points_param,
    referral_points = daily_stats.referral_points + referral_points_param,
    share_time = daily_stats.share_time + share_time_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;