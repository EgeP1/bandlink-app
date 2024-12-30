import { measureRealCPUUsage, initializeTraining, performTraining, cleanupTraining } from './collector';
import { createTrainingSession, endTrainingSession } from './session';
import { calculateBatchSize, calculateTrainingDelay, validateCPUMetrics } from './utils';
import type { TrainingSession } from './types';

export class CPUMonitor {
  private intervalId: number | null = null;
  private userId: string;
  private isMonitoring = false;
  private currentSession: TrainingSession | null = null;
  private maxCPUUsage = 80; // Maximum allowed CPU usage

  constructor(userId: string) {
    this.userId = userId;
  }

  async start() {
    if (this.isMonitoring) return;
    
    try {
      const initialCPU = await measureRealCPUUsage();
      this.currentSession = await createTrainingSession(this.userId, initialCPU);
      
      await initializeTraining(this.currentSession);
      
      this.isMonitoring = true;
      this.scheduleNextTraining();
    } catch (error) {
      console.error('Failed to start CPU monitoring:', error);
    }
  }

  private async scheduleNextTraining() {
    if (!this.isMonitoring || !this.currentSession) return;

    const cpuUsage = await measureRealCPUUsage();
    
    // Skip training if CPU usage is too high
    if (cpuUsage > this.maxCPUUsage) {
      this.intervalId = window.setTimeout(
        () => this.scheduleNextTraining(),
        calculateTrainingDelay(cpuUsage)
      );
      return;
    }

    const metrics = {
      sessionId: this.currentSession.id,
      cpuUsage,
      batchSize: calculateBatchSize(cpuUsage),
      trainingTime: 5000
    };

    if (validateCPUMetrics(metrics)) {
      await performTraining(metrics);
    }

    // Schedule next training with dynamic delay
    this.intervalId = window.setTimeout(
      () => this.scheduleNextTraining(),
      calculateTrainingDelay(cpuUsage)
    );
  }

  async stop() {
    if (this.currentSession) {
      try {
        await endTrainingSession(this.currentSession.id);
        cleanupTraining();
      } catch (error) {
        console.error('Failed to end training session:', error);
      }
      this.currentSession = null;
    }

    if (this.intervalId) {
      window.clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    
    this.isMonitoring = false;
  }

  isActive(): boolean {
    return this.isMonitoring;
  }
}