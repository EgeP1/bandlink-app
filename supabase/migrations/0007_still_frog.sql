/*
  # Fix points history table structure

  1. Changes
    - Drop and recreate points_history table with correct structure
    - Add proper indexes and RLS policies
    - Add function to calculate daily totals

  2. Security
    - Enable RLS
    - Add policy for users to view their own history
*/

-- Drop existing table if exists
DROP TABLE IF EXISTS points_history;

-- Create points_history table
CREATE TABLE points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  points numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own points history"
  ON points_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_points_history_user_created
  ON points_history(user_id, created_at DESC);

-- Function to calculate and store daily totals
CREATE OR REPLACE FUNCTION calculate_daily_totals()
RETURNS void AS $$
BEGIN
  -- Store daily totals in points_history
  INSERT INTO points_history (user_id, points)
  SELECT 
    ds.user_id,
    ds.points_earned
  FROM daily_stats ds
  WHERE ds.date = (CURRENT_DATE - INTERVAL '1 day')::date;
  
  -- Reset daily stats for previous days
  UPDATE daily_stats
  SET points_earned = 0.00,
      share_time = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;