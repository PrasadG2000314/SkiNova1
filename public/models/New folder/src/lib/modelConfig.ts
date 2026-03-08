// Configuration for the Teachable Machine model
// Update these paths to point to your model files

export const MODEL_CONFIG = {
  // Model JSON file path
  modelUrl: '/model/model.json',
  // Model weights file path
  metadataUrl: '/model/metadata.json',
  // Input image size (from metadata)
  imageSize: 224,
  // Model labels from metadata
  labels: ['non tinea', 'tinea'],
}

export type Prediction = {
  className: string
  probability: number
}
