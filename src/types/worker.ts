import type { TrainingSession } from './training';

export interface WorkerApi {
  initialize: (session: TrainingSession) => Promise<void>;
  train: (data: Float32Array, cpuUsage: number) => Promise<void>;
  cleanup: () => Promise<void>;
}