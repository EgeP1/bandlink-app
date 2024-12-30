/*
  # Update Rewards Data

  1. Changes
    - Clear existing rewards
    - Add new gift card rewards with proper categories and values
    - Update stock status and redemption details

  2. Security
    - Maintains existing RLS policies
*/

-- Clear existing rewards
DELETE FROM rewards;

-- Insert new rewards
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
    'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=200&h=200',
    'gift_card',
    5.00,
    'USD',
    50,
    'in_stock',
    'automatic',
    'Valid only on Amazon.com. Code expires in 12 months.',
    '24 hours',
    CURRENT_DATE
  ),
  (
    '$10 Amazon Gift Card',
    10000,
    'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=200&h=200',
    'gift_card',
    10.00,
    'USD',
    30,
    'in_stock',
    'automatic',
    'Valid only on Amazon.com. Code expires in 12 months.',
    '24 hours',
    CURRENT_DATE
  ),
  (
    '$25 Amazon Gift Card',
    25000,
    'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=200&h=200',
    'gift_card',
    25.00,
    'USD',
    20,
    'in_stock',
    'automatic',
    'Valid only on Amazon.com. Code expires in 12 months.',
    '24 hours',
    CURRENT_DATE
  ),
  (
    '$50 Amazon Gift Card',
    50000,
    'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=200&h=200',
    'gift_card',
    50.00,
    'USD',
    10,
    'in_stock',
    'automatic',
    'Valid only on Amazon.com. Code expires in 12 months.',
    '24-48 hours',
    CURRENT_DATE
  );