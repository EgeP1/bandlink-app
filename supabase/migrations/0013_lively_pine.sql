/*
  # Drop Rewards Table

  1. Changes
    - Drop rewards table and related objects
    - Clean up any dependencies
*/

-- Drop reward_redemptions table first since it depends on rewards
DROP TABLE IF EXISTS reward_redemptions;

-- Drop rewards table
DROP TABLE IF EXISTS rewards;

-- Drop related indexes
DROP INDEX IF EXISTS idx_rewards_category;
DROP INDEX IF EXISTS idx_rewards_value;
DROP INDEX IF EXISTS idx_rewards_stock_status;
DROP INDEX IF EXISTS idx_rewards_min_points;