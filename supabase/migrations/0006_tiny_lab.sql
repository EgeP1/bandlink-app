/*
  # Update points system to handle decimals

  1. Changes
    - Modify points_earned column in daily_stats to use numeric type
    - Update existing data
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update daily_stats table to use numeric for points
ALTER TABLE daily_stats 
ALTER COLUMN points_earned TYPE numeric(10,2);

-- Set default value for points_earned
ALTER TABLE daily_stats 
ALTER COLUMN points_earned SET DEFAULT 0.00;