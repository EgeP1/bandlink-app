/*
  # Update Points System Schema

  1. Changes
    - Update daily_stats table structure
    - Add user_stats table for aggregate statistics
    - Add sharing_sessions table to track active sharing
    - Update indexes and constraints
    - Add RLS policies

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points numeric(10,2) DEFAULT 0.00,
  total_share_time integer DEFAULT 0,
  last_active timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create sharing_sessions table
CREATE TABLE IF NOT EXISTS sharing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  points_earned numeric(10,2) DEFAULT 0.00,
  share_time integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sharing_sessions_user_active ON sharing_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_active ON user_stats(last_active);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for sharing_sessions
CREATE POLICY "Users can view own sessions"
  ON sharing_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON sharing_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sharing_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_points, total_share_time, last_active)
  VALUES (
    NEW.user_id,
    NEW.points_earned,
    NEW.share_time,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_stats.total_points + (NEW.points_earned - COALESCE(OLD.points_earned, 0)),
    total_share_time = user_stats.total_share_time + (NEW.share_time - COALESCE(OLD.share_time, 0)),
    last_active = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user stats
DROP TRIGGER IF EXISTS on_daily_stats_change ON daily_stats;
CREATE TRIGGER on_daily_stats_change
  AFTER INSERT OR UPDATE ON daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Function to end expired sessions
CREATE OR REPLACE FUNCTION end_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sharing_sessions
  SET 
    is_active = false,
    end_time = now()
  WHERE 
    is_active = true 
    AND start_time < (now() - interval '1 day');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;