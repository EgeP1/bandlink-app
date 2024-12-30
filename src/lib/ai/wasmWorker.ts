import * as tf from '@tensorflow/tfjs';
import { initializeModel, trainStep, cleanup } from './modelTraining';

let isInitialized = false;

export async function initializeWasmModule() {
  if (!isInitialized) {
    await tf.ready();
    await initializeModel();
    isInitialized = true;
  }
}

export async function runTrainingStep(data: Float32Array): Promise<number> {
  if (!isInitialized) {
    await initializeWasmModule();
  }
  return trainStep(data);
}

export async function cleanupModule() {
  if (isInitialized) {
    await cleanup();
    isInitialized = false;
  }
}