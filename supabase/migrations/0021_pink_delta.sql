-- Add source column to points_history
ALTER TABLE points_history 
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'bandwidth';

-- Add index for source queries
CREATE INDEX IF NOT EXISTS idx_points_history_source 
ON points_history(source);

-- Update archive function to include source
CREATE OR REPLACE FUNCTION archive_daily_points()
RETURNS void AS $$
BEGIN
  -- Insert bandwidth points
  INSERT INTO points_history (user_id, points, date, source)
  SELECT 
    user_id,
    points_earned,
    date,
    'bandwidth'
  FROM daily_stats
  WHERE date < CURRENT_DATE
  AND points_earned > 0
  AND NOT EXISTS (
    SELECT 1 
    FROM points_history ph 
    WHERE ph.user_id = daily_stats.user_id 
    AND ph.date = daily_stats.date
    AND ph.source = 'bandwidth'
  );

  -- Insert referral points
  INSERT INTO points_history (user_id, points, date, source)
  SELECT 
    user_id,
    referral_points,
    date,
    'referral'
  FROM daily_stats
  WHERE date < CURRENT_DATE
  AND referral_points > 0
  AND NOT EXISTS (
    SELECT 1 
    FROM points_history ph 
    WHERE ph.user_id = daily_stats.user_id 
    AND ph.date = daily_stats.date
    AND ph.source = 'referral'
  );

  -- Reset daily stats for previous days
  UPDATE daily_stats
  SET points_earned = 0,
      referral_points = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;