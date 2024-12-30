import { expose } from 'comlink';
import { TrainingEngine } from '../core/training';
import type { TrainingSession } from '../../../types/training';

const engine = new TrainingEngine();

const api = {
  initialize: async (session: TrainingSession) => {
    await engine.initialize(session);
  },
  
  train: async (data: Float32Array, cpuUsage: number) => {
    await engine.runBatch(data, cpuUsage);
  },
  
  cleanup: () => {
    engine.cleanup();
  }
};

expose(api);