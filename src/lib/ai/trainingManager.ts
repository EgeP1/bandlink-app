import * as Comlink from 'comlink';
import { measureCPUUsage } from '../cpu';
import type { WorkerApi } from '../../types/worker';

export class TrainingManager {
  private isTraining: boolean = false;
  private worker: Worker | null = null;
  private workerApi: WorkerApi | null = null;
  private cpuThreshold: number = 70;

  async startTraining() {
    if (this.isTraining) return;
    
    this.isTraining = true;
    await this.initializeWorker();
    this.scheduleTraining();
  }

  async stopTraining() {
    this.isTraining = false;
    if (this.workerApi) {
      await this.workerApi.cleanup();
    }
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerApi = null;
    }
  }

  private async initializeWorker() {
    if (typeof Worker === 'undefined') {
      throw new Error('Web Workers are not supported in this environment');
    }

    this.worker = new Worker(
      new URL('./trainingWorker.ts', import.meta.url),
      { type: 'module' }
    );

    this.workerApi = Comlink.wrap<WorkerApi>(this.worker);
    await this.workerApi.initialize();
  }

  private async scheduleTraining() {
    while (this.isTraining && this.workerApi) {
      const cpuUsage = await measureCPUUsage();
      
      if (cpuUsage < this.cpuThreshold) {
        const batchSize = this.calculateBatchSize(cpuUsage);
        await this.runTrainingBatch(batchSize);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private calculateBatchSize(currentCpuUsage: number): number {
    const availableCpu = this.cpuThreshold - currentCpuUsage;
    return Math.floor(availableCpu * 10);
  }

  private async runTrainingBatch(batchSize: number) {
    try {
      const trainingData = this.generateTrainingData(batchSize);
      await this.workerApi?.train(trainingData);
    } catch (error) {
      console.error('Training batch failed:', error);
    }
  }

  private generateTrainingData(batchSize: number): Float32Array {
    // Generate synthetic training data
    return new Float32Array(Array(10).fill(0).map(() => Math.random()));
  }
}