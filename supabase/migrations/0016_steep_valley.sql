/*
  # Fix points tracking system

  1. Changes
    - Add session_stats table for better tracking
    - Add functions for accurate stats calculation
    - Add triggers for automatic stats updates
    - Add constraints for data integrity

  2. Security
    - Enable RLS on new tables
    - Add policies for secure access
*/

-- Create session_stats table for better tracking
CREATE TABLE IF NOT EXISTS session_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sharing_sessions(id) ON DELETE CASCADE,
  points_earned numeric(10,2) DEFAULT 0.00,
  share_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE session_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own session stats"
  ON session_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session stats"
  ON session_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_session_stats_user_session 
ON session_stats(user_id, session_id);

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_stats(user_id_param uuid, date_param date)
RETURNS void AS $$
DECLARE
  total_points numeric(10,2);
  total_time integer;
BEGIN
  -- Calculate totals from session_stats
  SELECT 
    COALESCE(SUM(points_earned), 0.00),
    COALESCE(SUM(share_time), 0)
  INTO total_points, total_time
  FROM session_stats ss
  JOIN sharing_sessions s ON ss.session_id = s.id
  WHERE ss.user_id = user_id_param
  AND DATE(s.start_time) = date_param;

  -- Update daily_stats
  INSERT INTO daily_stats (
    user_id,
    date,
    points_earned,
    share_time
  ) VALUES (
    user_id_param,
    date_param,
    total_points,
    total_time
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    points_earned = EXCLUDED.points_earned,
    share_time = EXCLUDED.share_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session stats
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS trigger AS $$
BEGIN
  -- Insert new session stats
  INSERT INTO session_stats (
    user_id,
    session_id,
    points_earned,
    share_time
  ) VALUES (
    NEW.user_id,
    NEW.id,
    NEW.points_earned - COALESCE(OLD.points_earned, 0),
    NEW.share_time - COALESCE(OLD.share_time, 0)
  );

  -- Update daily stats
  PERFORM aggregate_daily_stats(NEW.user_id, DATE(NEW.start_time));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for session stats updates
DROP TRIGGER IF EXISTS on_sharing_session_update ON sharing_sessions;
CREATE TRIGGER on_sharing_session_update
  AFTER UPDATE OF points_earned, share_time ON sharing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_stats();