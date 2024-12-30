import { supabase } from '../supabase';
import { CPUTrainer } from './training';
import type { CPUMetrics, TrainingSession } from './types';

const trainer = new CPUTrainer();

export async function measureRealCPUUsage(): Promise<number> {
  try {
    const t1 = performance.now();
    const iterations = 1000000;
    
    // Run CPU-intensive task
    for (let i = 0; i < iterations; i++) {
      Math.sqrt(i);
    }
    
    const t2 = performance.now();
    const timeTaken = t2 - t1;
    const baselineTime = 50; // Calibrated baseline time in ms
    const cpuPercent = Math.min(100, (timeTaken / baselineTime) * 100);
    
    return Number(cpuPercent.toFixed(2));
  } catch (error) {
    console.error('Error measuring CPU usage:', error);
    return 0;
  }
}

export async function initializeTraining(session: TrainingSession): Promise<void> {
  await trainer.initialize(session);
}

export async function performTraining(metrics: CPUMetrics): Promise<void> {
  try {
    // Perform actual training
    const { loss, accuracy } = await trainer.trainBatch(metrics.batchSize);

    // Store metrics and results
    const { error } = await supabase
      .from('training_contributions')
      .insert({
        session_id: metrics.sessionId,
        batch_size: metrics.batchSize,
        cpu_usage: metrics.cpuUsage,
        training_time: metrics.trainingTime,
        loss,
        accuracy
      });

    if (error) throw error;

    // Periodically save training progress
    if (Math.random() < 0.1) { // 10% chance to save
      await trainer.saveProgress();
    }
  } catch (error) {
    console.error('Error in training:', error);
  }
}

export function cleanupTraining(): void {
  trainer.cleanup();
}