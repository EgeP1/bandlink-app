/*
  # Add Training Weights Storage

  1. New Tables
    - `training_weights`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references training_sessions)
      - `weights` (jsonb, stores model weights)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on training_weights table
    - Add policies for authenticated users
*/

-- Create training_weights table
CREATE TABLE training_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES training_sessions(id) ON DELETE CASCADE,
  weights jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE training_weights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own training weights"
  ON training_weights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = training_weights.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own training weights"
  ON training_weights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = training_weights.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_training_weights_session 
ON training_weights(session_id);

CREATE INDEX idx_training_weights_created 
ON training_weights(created_at DESC);