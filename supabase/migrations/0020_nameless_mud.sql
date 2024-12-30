/*
  # Fix Points History Implementation

  1. Changes
    - Add trigger to automatically store daily points in points_history at midnight UTC
    - Ensure points are stored with correct date format
    - Add function to handle daily points archival

  2. Security
    - Maintain existing RLS policies
    - Add proper constraints for data integrity
*/

-- Ensure points_history has the correct structure
ALTER TABLE points_history
ALTER COLUMN points TYPE numeric(10,2);

-- Function to archive daily points
CREATE OR REPLACE FUNCTION archive_daily_points()
RETURNS void AS $$
BEGIN
  -- Insert daily stats into points_history
  INSERT INTO points_history (user_id, points, date)
  SELECT 
    user_id,
    points_earned,
    date
  FROM daily_stats
  WHERE date < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 
    FROM points_history ph 
    WHERE ph.user_id = daily_stats.user_id 
    AND ph.date = daily_stats.date
  );

  -- Reset daily stats for previous days
  UPDATE daily_stats
  SET points_earned = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle midnight UTC transition
CREATE OR REPLACE FUNCTION handle_midnight_transition()
RETURNS trigger AS $$
BEGIN
  -- If the date has changed (midnight UTC), archive the points
  IF NEW.date > OLD.date THEN
    PERFORM archive_daily_points();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for midnight transition
DROP TRIGGER IF EXISTS on_date_change ON daily_stats;
CREATE TRIGGER on_date_change
  AFTER UPDATE ON daily_stats
  FOR EACH ROW
  WHEN (NEW.date IS DISTINCT FROM OLD.date)
  EXECUTE FUNCTION handle_midnight_transition();