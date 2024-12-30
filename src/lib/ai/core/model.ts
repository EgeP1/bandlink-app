import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

export async function createModel(): Promise<tf.LayersModel> {
  return tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });
}

export function compileModel(model: tf.LayersModel): void {
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });
}

export async function trainBatch(
  model: tf.LayersModel, 
  data: Float32Array
): Promise<{ loss: number; accuracy: number }> {
  const xs = tf.tensor2d(data, [1, 10]);
  const ys = tf.tensor2d([[1]], [1, 1]);

  const result = await model.trainOnBatch(xs, ys);
  
  tf.dispose([xs, ys]);
  
  return {
    loss: Array.isArray(result) ? result[0] : result,
    accuracy: Array.isArray(result) ? result[1] : 0
  };
}