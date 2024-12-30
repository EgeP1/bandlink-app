import { createModel, compileModel, trainBatch } from './model';
import { recordTrainingContribution } from '../../database/training';
import type { TrainingSession } from '../../../types/training';

export class TrainingEngine {
  private model: any = null;
  private session: TrainingSession | null = null;

  async initialize(session: TrainingSession) {
    this.model = await createModel();
    compileModel(this.model);
    this.session = session;
  }

  async runBatch(data: Float32Array, cpuUsage: number): Promise<void> {
    if (!this.model || !this.session) {
      throw new Error('Training engine not initialized');
    }

    const startTime = performance.now();
    const { loss, accuracy } = await trainBatch(this.model, data);
    const trainingTime = Math.round(performance.now() - startTime);

    await recordTrainingContribution(this.session.id, {
      batchSize: data.length,
      loss,
      accuracy,
      trainingTime,
      cpuUsage
    });
  }

  cleanup() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.session = null;
  }
}