/*
  # Update Schema for Latest App Version

  1. Changes
    - Add new columns to rewards table
    - Update rewards data
    - Add indexes for better performance
    - Update RLS policies

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Update rewards table structure
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock',
ADD COLUMN IF NOT EXISTS redemption_type text NOT NULL DEFAULT 'automatic',
ADD COLUMN IF NOT EXISTS terms_conditions text,
ADD COLUMN IF NOT EXISTS processing_time text DEFAULT '24-48 hours',
ADD COLUMN IF NOT EXISTS min_points integer NOT NULL DEFAULT 5000;

-- Add new indexes
CREATE INDEX IF NOT EXISTS idx_rewards_stock_status ON rewards(stock_status);
CREATE INDEX IF NOT EXISTS idx_rewards_min_points ON rewards(min_points);

-- Update or insert fresh rewards data
DELETE FROM rewards;
INSERT INTO rewards (
  title, 
  points_required, 
  image_url, 
  category, 
  value, 
  currency, 
  available_quantity,
  stock_status,
  redemption_type,
  terms_conditions,
  processing_time,
  date
) VALUES 
  (
    '$5 Amazon Gift Card', 
    5000, 
    'https://images.unsplash.com/photo-1576224663326-5c39f4c45e34?auto=format&fit=crop&q=80&w=200&h=200', 
    'gift_card', 
    5.00, 
    'USD',
    100,
    'in_stock',
    'automatic',
    'Valid only on Amazon.com. Code expires in 12 months.',
    '24 hours',
    CURRENT_DATE
  ),
  (
    '$10 Steam Wallet', 
    10000, 
    'https://images.unsplash.com/photo-1614680376739-414d95ff43df?auto=format&fit=crop&q=80&w=200&h=200', 
    'gaming', 
    10.00, 
    'USD',
    50,
    'in_stock',
    'automatic',
    'Valid only on Steam. No expiration.',
    '24-48 hours',
    CURRENT_DATE
  ),
  (
    '$20 PayPal Credit', 
    20000, 
    'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&q=80&w=200&h=200', 
    'payment', 
    20.00, 
    'USD',
    25,
    'in_stock',
    'manual',
    'PayPal account required. Processing may take up to 48 hours.',
    '48-72 hours',
    CURRENT_DATE
  );

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view rewards" ON rewards;
CREATE POLICY "Anyone can view available rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (
    stock_status = 'in_stock' 
    AND available_quantity > 0 
    AND date = CURRENT_DATE
  );