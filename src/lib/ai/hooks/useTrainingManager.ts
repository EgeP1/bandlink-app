import { useEffect, useRef } from 'react';
import * as Comlink from 'comlink';
import { useSharing } from '../../../hooks/useSharing';
import { startTrainingSession, endTrainingSession } from '../../database/training';
import { measureCPUUsage } from '../../cpu';
import type { WorkerApi } from '../../../types/worker';

const CPU_THRESHOLD = 70;
const UPDATE_INTERVAL = 1000;

export function useTrainingManager() {
  const { isSharing } = useSharing();
  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<WorkerApi | null>(null);
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    let cleanup = () => {};

    const initializeTraining = async () => {
      try {
        const cpuUsage = await measureCPUUsage();
        const session = await startTrainingSession(cpuUsage);
        sessionRef.current = session.id;

        workerRef.current = new Worker(
          new URL('../worker/trainingWorker.ts', import.meta.url),
          { type: 'module' }
        );

        apiRef.current = Comlink.wrap(workerRef.current);
        await apiRef.current.initialize(session);

        const interval = setInterval(async () => {
          const currentCpuUsage = await measureCPUUsage();
          
          if (currentCpuUsage < CPU_THRESHOLD) {
            const batchSize = Math.floor((CPU_THRESHOLD - currentCpuUsage) * 10);
            const data = new Float32Array(Array(batchSize).fill(0).map(() => Math.random()));
            await apiRef.current?.train(data, currentCpuUsage);
          }
        }, UPDATE_INTERVAL);

        cleanup = async () => {
          clearInterval(interval);
          if (sessionRef.current) {
            await endTrainingSession(sessionRef.current);
            sessionRef.current = null;
          }
          if (apiRef.current) {
            await apiRef.current.cleanup();
            apiRef.current = null;
          }
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize training:', error);
      }
    };

    if (isSharing) {
      initializeTraining();
    }

    return () => {
      cleanup();
    };
  }, [isSharing]);
}