import { expose } from 'comlink';
import { initializeWasmModule, runTrainingStep, cleanupModule } from './wasmWorker';

const api = {
  initialize: initializeWasmModule,
  train: runTrainingStep,
  cleanup: cleanupModule
};

expose(api);