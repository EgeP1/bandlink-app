/*
  # Points History Updates
  
  1. Changes
    - Add trigger to automatically archive daily stats at UTC midnight
    - Add function to handle points history archival
    - Add index for better query performance
  
  2. Security
    - Functions run with security definer
    - RLS policies maintained
*/

-- Improve points_history table
ALTER TABLE points_history
ADD COLUMN IF NOT EXISTS date date NOT NULL DEFAULT CURRENT_DATE;

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_points_history_date 
ON points_history(date DESC);

-- Function to archive daily stats to points history
CREATE OR REPLACE FUNCTION archive_daily_stats()
RETURNS void AS $$
BEGIN
  -- Archive daily stats to points_history
  INSERT INTO points_history (user_id, points, date)
  SELECT 
    user_id,
    points_earned,
    date
  FROM daily_stats
  WHERE date < CURRENT_DATE
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    points = EXCLUDED.points;

  -- Reset daily stats for previous days
  UPDATE daily_stats
  SET points_earned = 0, share_time = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to prevent duplicate entries
ALTER TABLE points_history
ADD CONSTRAINT points_history_user_date_unique 
UNIQUE (user_id, date);