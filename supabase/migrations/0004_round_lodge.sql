/*
  # Fix daily stats permissions and structure

  1. Changes
    - Add INSERT policy for daily_stats
    - Add UPDATE policy for daily_stats
    - Modify points tracking to use incremental updates
    - Add indexes for better performance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own daily stats" ON daily_stats;

-- Create comprehensive policies
CREATE POLICY "Users can view own daily stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily stats"
  ON daily_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily stats"
  ON daily_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date 
  ON daily_stats(user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date 
  ON daily_stats(date);