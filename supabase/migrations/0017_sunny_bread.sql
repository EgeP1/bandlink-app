/*
  # Daily Stats Reset Function
  
  1. New Function
    - `reset_daily_stats`: Resets points and share time at UTC midnight
    
  2. Changes
    - Add trigger to automatically reset stats at UTC midnight
*/

-- Function to reset daily stats
CREATE OR REPLACE FUNCTION reset_daily_stats()
RETURNS void AS $$
BEGIN
  -- Archive previous day's stats to points_history
  INSERT INTO points_history (user_id, points, created_at)
  SELECT user_id, points_earned, date + interval '23 hours 59 minutes 59 seconds'
  FROM daily_stats
  WHERE date < CURRENT_DATE;

  -- Reset daily stats for previous days
  UPDATE daily_stats
  SET points_earned = 0, share_time = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;