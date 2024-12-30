import { CPUMetrics } from './types';

export function calculateBatchSize(cpuUsage: number): number {
  // Base calculation on available CPU capacity
  const availableCPU = 100 - cpuUsage;
  
  // Minimum batch size of 1, maximum of 32
  // Scale batch size with available CPU
  return Math.max(1, Math.min(32, Math.floor(availableCPU / 3)));
}

export function validateCPUMetrics(metrics: CPUMetrics): boolean {
  return (
    metrics.cpuUsage >= 0 &&
    metrics.cpuUsage <= 100 &&
    metrics.batchSize > 0 &&
    metrics.trainingTime > 0
  );
}

export function calculateTrainingDelay(cpuUsage: number): number {
  // Increase delay when CPU usage is high
  const baseDelay = 5000; // 5 seconds
  const loadFactor = cpuUsage / 100;
  return baseDelay + (loadFactor * 5000); // Add up to 5 more seconds
}