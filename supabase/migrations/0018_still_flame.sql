-- Create functions for atomic updates
CREATE OR REPLACE FUNCTION update_daily_stats(
  user_id_param uuid,
  points_param numeric,
  share_time_param integer,
  date_param date
)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (
    user_id,
    date,
    points_earned,
    share_time
  )
  VALUES (
    user_id_param,
    date_param,
    points_param,
    share_time_param
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    points_earned = daily_stats.points_earned + points_param,
    share_time = daily_stats.share_time + share_time_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_stats(
  user_id_param uuid,
  points_param numeric,
  share_time_param integer
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_stats (
    user_id,
    total_points,
    total_share_time,
    last_active
  )
  VALUES (
    user_id_param,
    points_param,
    share_time_param,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_stats.total_points + points_param,
    total_share_time = user_stats.total_share_time + share_time_param,
    last_active = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;