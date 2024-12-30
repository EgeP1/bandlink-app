/*
  # Add date column to rewards table

  1. Changes
    - Add date column to rewards table for daily rewards
    - Add validation to ensure date is present
    - Add index for better query performance
    - Update RLS policies
*/

-- Add date column to rewards table
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS date date NOT NULL DEFAULT CURRENT_DATE;

-- Add index for date queries
CREATE INDEX IF NOT EXISTS idx_rewards_date ON rewards(date);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view rewards" ON rewards;

CREATE POLICY "Anyone can view rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (true);

-- Add some initial rewards
INSERT INTO rewards (title, description, points_required, image_url, date)
VALUES 
  ('$5 Amazon Gift Card', 'Redeem for a $5 Amazon gift card', 5000, 'https://images.unsplash.com/photo-1576224663326-5c39f4c45e34?auto=format&fit=crop&q=80&w=200&h=200', CURRENT_DATE),
  ('$10 Steam Wallet', 'Add $10 to your Steam Wallet', 10000, 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?auto=format&fit=crop&q=80&w=200&h=200', CURRENT_DATE),
  ('$20 PayPal Credit', 'Get $20 PayPal credit', 20000, 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&q=80&w=200&h=200', CURRENT_DATE)
ON CONFLICT DO NOTHING;