import { supabase } from './supabase';

// Points calculation constants
const POINTS_PER_CPU_PERCENT = 50; // 50 points per 1% CPU usage per hour
const UPDATE_INTERVAL = 5000; // Update every 5 seconds

export async function measureCPUUsage(): Promise<number> {
  try {
    const t1 = performance.now();
    // Simulate CPU load measurement with a computation
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i);
    }
    const t2 = performance.now();
    
    // Calculate CPU usage percentage (0-100)
    const timeTaken = t2 - t1;
    const baselineTime = 50; // Baseline time in ms for 100% CPU
    const cpuPercent = Math.min(100, (timeTaken / baselineTime) * 100);
    
    return cpuPercent;
  } catch (error) {
    console.error('Error measuring CPU usage:', error);
    return 0;
  }
}