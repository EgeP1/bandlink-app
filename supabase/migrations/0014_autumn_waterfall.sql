/*
  # Clear points data and update points system
  
  1. Changes
    - Clear all existing points data
    - Add new indexes for better performance
    - Update daily_stats constraints
  
  2. Security
    - Maintain existing RLS policies
    - Add additional validation checks
*/

-- Clear existing points data
TRUNCATE TABLE daily_stats;
TRUNCATE TABLE points_history;
TRUNCATE TABLE user_stats;
TRUNCATE TABLE sharing_sessions;

-- Add check constraints
ALTER TABLE daily_stats
ADD CONSTRAINT positive_points CHECK (points_earned >= 0),
ADD CONSTRAINT positive_share_time CHECK (share_time >= 0);

-- Add new indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_stats_points 
ON daily_stats(points_earned DESC);

CREATE INDEX IF NOT EXISTS idx_daily_stats_share_time 
ON daily_stats(share_time DESC);

-- Update the points calculation function for better accuracy
CREATE OR REPLACE FUNCTION calculate_points_earned(cpu_usage numeric)
RETURNS numeric AS $$
BEGIN
  -- Base calculation: 0.4 points per CPU percent per update
  -- This results in approximately:
  -- At 50% CPU: ~5k points per day
  -- At 100% CPU: ~10k points per day
  RETURN ROUND((cpu_usage * 0.4)::numeric, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;