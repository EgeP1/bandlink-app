export interface TrainingSession {
  id: string;
  user_id: string;
  cpu_usage: number;
  status: 'active' | 'completed';
}

export interface CPUMetrics {
  sessionId: string;
  cpuUsage: number;
  batchSize: number;
  trainingTime: number;
}