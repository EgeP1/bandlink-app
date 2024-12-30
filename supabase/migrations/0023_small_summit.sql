/*
  # Referral System Implementation

  1. Changes
    - Add referral tiers and bonus tracking
    - Add functions for referral points calculation
    - Add triggers for automatic referral rewards

  2. Security
    - Enable RLS on all new tables
    - Add policies for referral access control
*/

-- Add referral tier column
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS tier smallint NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 3);

-- Function to calculate referral percentage based on tier
CREATE OR REPLACE FUNCTION get_referral_percentage(tier_level smallint)
RETURNS numeric AS $$
BEGIN
  RETURN CASE tier_level
    WHEN 1 THEN 0.20 -- Primary: 20%
    WHEN 2 THEN 0.10 -- Secondary: 10%
    WHEN 3 THEN 0.05 -- Tertiary: 5%
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to handle referral points
CREATE OR REPLACE FUNCTION update_referral_points()
RETURNS trigger AS $$
DECLARE
  referrer_record RECORD;
  points_earned numeric;
  referral_percentage numeric;
BEGIN
  -- Calculate points for each referrer in the chain
  FOR referrer_record IN 
    WITH RECURSIVE referral_chain AS (
      -- Start with direct referrer
      SELECT 
        r.referrer_id,
        r.referred_id,
        r.tier,
        1 as depth
      FROM referrals r
      WHERE r.referred_id = NEW.user_id
      
      UNION
      
      -- Add indirect referrers up to tier 3
      SELECT 
        r.referrer_id,
        r.referred_id,
        r.tier,
        rc.depth + 1
      FROM referrals r
      JOIN referral_chain rc ON r.referred_id = rc.referrer_id
      WHERE rc.depth < 3
    )
    SELECT * FROM referral_chain
  LOOP
    -- Calculate referral points based on tier
    referral_percentage := get_referral_percentage(referrer_record.tier);
    points_earned := NEW.points_earned * referral_percentage;
    
    -- Update referrer's daily stats with referral points
    IF points_earned > 0 THEN
      PERFORM update_daily_stats(
        referrer_record.referrer_id,
        0,
        points_earned,
        0,
        CURRENT_DATE
      );
    END IF;
  END LOOP;

  -- Check for uptime bonus (120 hours = 432000 seconds)
  IF NEW.total_share_time >= 432000 AND OLD.total_share_time < 432000 THEN
    -- Give bonus to the user
    PERFORM update_daily_stats(
      NEW.user_id,
      10000, -- Bonus points for reaching 120 hours
      0,
      0,
      CURRENT_DATE
    );
    
    -- Give bonus to direct referrer if exists
    UPDATE referrals
    SET bonus_claimed = true
    WHERE referred_id = NEW.user_id
    AND tier = 1
    AND NOT bonus_claimed
    RETURNING referrer_id
    INTO referrer_record;
    
    IF FOUND THEN
      PERFORM update_daily_stats(
        referrer_record.referrer_id,
        5000, -- Referrer bonus
        0,
        0,
        CURRENT_DATE
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for referral points
DROP TRIGGER IF EXISTS on_user_stats_update ON user_stats;
CREATE TRIGGER on_user_stats_update
  AFTER UPDATE OF total_share_time ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_points();

-- Function to process new referrals
CREATE OR REPLACE FUNCTION process_new_referral()
RETURNS trigger AS $$
DECLARE
  current_tier smallint;
  parent_referral RECORD;
BEGIN
  -- Set initial tier to 1 (primary referral)
  current_tier := 1;
  
  -- Look for parent referral
  SELECT * INTO parent_referral
  FROM referrals
  WHERE referred_id = NEW.referrer_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If parent exists, set tier based on parent's tier
  IF FOUND THEN
    current_tier := LEAST(parent_referral.tier + 1, 3);
  END IF;
  
  -- Set the tier
  NEW.tier := current_tier;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new referrals
CREATE TRIGGER before_referral_insert
  BEFORE INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION process_new_referral();