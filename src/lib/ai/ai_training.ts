import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

export async function initializeModel(): Promise<void> {
  // Create a simple neural network for demonstration
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
}

export async function trainStep(data: Float32Array): Promise<number> {
  if (!model) {
    throw new Error('Model not initialized');
  }

  // Convert input data to tensor
  const xs = tf.tensor2d(data, [1, 10]);
  const ys = tf.tensor2d([[1]], [1, 1]); // Dummy label for demonstration

  // Run one training step
  const history = await model.trainOnBatch(xs, ys);
  
  // Cleanup tensors
  tf.dispose([xs, ys]);
  
  return Array.isArray(history) ? history[0] : history;
}

export async function cleanup(): Promise<void> {
  if (model) {
    model.dispose();
    model = null;
  }
}