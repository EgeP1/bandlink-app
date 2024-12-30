/*
  # Update Schema for Current App Version

  1. Changes
    - Remove unused tables safely by handling dependencies
    - Update rewards table structure
    - Add indexes for better performance

  2. Security
    - Maintain RLS policies
    - Update foreign key constraints
*/

-- First, update foreign key constraints
ALTER TABLE daily_stats
DROP CONSTRAINT IF EXISTS daily_stats_user_id_fkey,
ADD CONSTRAINT daily_stats_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Now we can safely drop unused tables
DROP TABLE IF EXISTS redemptions;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS profiles;

-- Update rewards table
ALTER TABLE rewards DROP COLUMN IF EXISTS description;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'gift_card';
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS available_quantity integer NOT NULL DEFAULT 10;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS value numeric(10,2) NOT NULL DEFAULT 0.00;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards(category);
CREATE INDEX IF NOT EXISTS idx_rewards_value ON rewards(value);

-- Update sample rewards
DELETE FROM rewards;
INSERT INTO rewards (title, points_required, image_url, category, value, currency, date)
VALUES 
  ('$5 Amazon Gift Card', 5000, 'https://images.unsplash.com/photo-1576224663326-5c39f4c45e34?auto=format&fit=crop&q=80&w=200&h=200', 'gift_card', 5.00, 'USD', CURRENT_DATE),
  ('$10 Steam Wallet', 10000, 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?auto=format&fit=crop&q=80&w=200&h=200', 'gaming', 10.00, 'USD', CURRENT_DATE),
  ('$20 PayPal Credit', 20000, 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&q=80&w=200&h=200', 'payment', 20.00, 'USD', CURRENT_DATE);