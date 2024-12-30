/*
  # Update points history system

  1. Changes
    - Create points_history table with decimal support
    - Add function for daily points calculation
    - Add indexes for performance
  
  2. Security
    - Enable RLS on points_history
    - Add policies for user access
*/

-- Create points_history table if not exists
CREATE TABLE IF NOT EXISTS points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  points numeric(10,2) NOT NULL DEFAULT 0.00,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can view own points history" ON points_history;

-- Create RLS policies
CREATE POLICY "Users can view own points history"
  ON points_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_points_history_user_date 
ON points_history(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_points_history_date 
ON points_history(date DESC);

-- Function to calculate and store daily totals
CREATE OR REPLACE FUNCTION calculate_daily_totals()
RETURNS void AS $$
BEGIN
  -- Store daily totals for the previous day
  INSERT INTO points_history (user_id, points, date)
  SELECT 
    ds.user_id,
    ds.points_earned,
    ds.date
  FROM daily_stats ds
  WHERE ds.date = (CURRENT_DATE - INTERVAL '1 day');
  
  -- Reset daily stats
  UPDATE daily_stats
  SET points_earned = 0.00,
      share_time = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;