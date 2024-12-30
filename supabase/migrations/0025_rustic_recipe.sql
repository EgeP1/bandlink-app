/*
  # AI Training Data Schema

  1. New Tables
    - `training_sessions`: Records active training sessions
    - `training_contributions`: Stores individual training contributions
    - `training_metrics`: Aggregates training results
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Training Sessions Table
CREATE TABLE training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  cpu_usage numeric(5,2),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Training Contributions Table
CREATE TABLE training_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_size integer NOT NULL,
  loss numeric(10,6),
  accuracy numeric(5,2),
  training_time integer, -- in milliseconds
  cpu_usage numeric(5,2),
  created_at timestamptz DEFAULT now()
);

-- Training Metrics Table
CREATE TABLE training_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  total_contributions integer DEFAULT 0,
  avg_loss numeric(10,6),
  avg_accuracy numeric(5,2),
  total_training_time integer, -- in milliseconds
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own training sessions"
  ON training_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training sessions"
  ON training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions"
  ON training_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own training contributions"
  ON training_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training contributions"
  ON training_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to aggregate daily metrics
CREATE OR REPLACE FUNCTION aggregate_training_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO training_metrics (
    date,
    total_contributions,
    avg_loss,
    avg_accuracy,
    total_training_time
  )
  SELECT
    date(created_at),
    COUNT(*),
    AVG(loss),
    AVG(accuracy),
    SUM(training_time)
  FROM training_contributions
  WHERE date(created_at) = CURRENT_DATE
  GROUP BY date(created_at)
  ON CONFLICT (date)
  DO UPDATE SET
    total_contributions = EXCLUDED.total_contributions,
    avg_loss = EXCLUDED.avg_loss,
    avg_accuracy = EXCLUDED.avg_accuracy,
    total_training_time = EXCLUDED.total_training_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;