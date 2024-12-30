import { useEffect } from 'react';
import { TrainingManager } from '../lib/ai/trainingManager';
import { useSharing } from './useSharing';

export function useAITraining() {
  const { isSharing } = useSharing();
  const trainingManager = new TrainingManager();

  useEffect(() => {
    if (isSharing) {
      trainingManager.startTraining();
    } else {
      trainingManager.stopTraining();
    }

    return () => {
      trainingManager.stopTraining();
    };
  }, [isSharing]);
}