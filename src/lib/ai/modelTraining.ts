import * as tf from '@tensorflow/tfjs';

// Simple neural network for demonstration
let model: tf.LayersModel;

export async function initializeModel() {
  model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  return true;
}

export async function trainStep(data: Float32Array): Promise<number> {
  if (!model) {
    throw new Error('Model not initialized');
  }

  // Convert input data to tensor
  const inputTensor = tf.tensor2d(data, [1, 10]);
  const labelTensor = tf.tensor2d([[1]], [1, 1]); // Dummy label for demonstration

  // Run one training step
  const result = await model.trainOnBatch(inputTensor, labelTensor);

  // Cleanup tensors
  inputTensor.dispose();
  labelTensor.dispose();

  return result as number;
}

export async function cleanup() {
  if (model) {
    model.dispose();
  }
}