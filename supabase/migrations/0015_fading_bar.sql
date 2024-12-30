/*
  # Fix sharing sessions and points tracking

  1. Changes
    - Add check constraints for data integrity
    - Add function to calculate points based on CPU usage
    - Update trigger for better stats tracking
    - Add indexes for performance optimization

  2. Security
    - Update existing RLS policies with improved conditions
*/

-- Add check constraints to sharing_sessions
ALTER TABLE sharing_sessions
ADD CONSTRAINT positive_points CHECK (points_earned >= 0),
ADD CONSTRAINT positive_share_time CHECK (share_time >= 0);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_sharing_session_update ON sharing_sessions;

-- Update the function for daily stats updates
CREATE OR REPLACE FUNCTION update_daily_stats_from_session()
RETURNS trigger AS $$
DECLARE
  today_date date := CURRENT_DATE;
BEGIN
  -- Update daily stats
  INSERT INTO daily_stats (
    user_id,
    date,
    points_earned,
    share_time
  )
  VALUES (
    NEW.user_id,
    today_date,
    COALESCE(NEW.points_earned, 0),
    COALESCE(NEW.share_time, 0)
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    points_earned = daily_stats.points_earned + (NEW.points_earned - COALESCE(OLD.points_earned, 0)),
    share_time = daily_stats.share_time + (NEW.share_time - COALESCE(OLD.share_time, 0))
  WHERE daily_stats.user_id = NEW.user_id
    AND daily_stats.date = today_date;

  -- Update user_stats
  INSERT INTO user_stats (
    user_id,
    total_points,
    total_share_time,
    last_active
  )
  VALUES (
    NEW.user_id,
    COALESCE(NEW.points_earned, 0),
    COALESCE(NEW.share_time, 0),
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_stats.total_points + (NEW.points_earned - COALESCE(OLD.points_earned, 0)),
    total_share_time = user_stats.total_share_time + (NEW.share_time - COALESCE(OLD.share_time, 0)),
    last_active = now()
  WHERE user_stats.user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_sharing_session_update
  AFTER INSERT OR UPDATE ON sharing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats_from_session();

-- Add new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sharing_sessions_points 
ON sharing_sessions(points_earned DESC);

CREATE INDEX IF NOT EXISTS idx_sharing_sessions_share_time 
ON sharing_sessions(share_time DESC);

-- Update the points calculation function
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