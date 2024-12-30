export interface TrainingSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  cpu_usage: number;
  status: 'active' | 'completed' | 'error';
  created_at: string;
}

export interface TrainingContribution {
  batchSize: number;
  loss: number;
  accuracy: number;
  trainingTime: number;
  cpuUsage: number;
}

export interface TrainingMetrics {
  total_contributions: number;
  avg_loss: number;
  avg_accuracy: number;
  total_training_time: number;
}