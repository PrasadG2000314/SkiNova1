'use client'

import * as tf from '@tensorflow/tfjs'
import * as tmImage from '@teachablemachine/image'
import { MODEL_CONFIG, Prediction } from './modelConfig'

let model: tmImage.CustomMobileNet | null = null
let isLoading = false

export async function loadModel(): Promise<tmImage.CustomMobileNet> {
  if (model) {
    return model
  }

  if (isLoading) {
    while (!model) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return model!
  }

  isLoading = true

  try {
    const modelURL = MODEL_CONFIG.modelUrl
    const metadataURL = MODEL_CONFIG.metadataUrl

    model = await tmImage.load(modelURL, metadataURL)
    isLoading = false
    return model
  } catch (error) {
    isLoading = false
    throw new Error(
      `Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function predictImage(imageFile: File): Promise<Prediction[]> {
  try {
    const loadedModel = await loadModel()

    // Create image element
    const img = document.createElement('img')
    img.src = URL.createObjectURL(imageFile)

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Run prediction
          const predictions = await loadedModel.predict(img)

          // Convert to our format
          const results: Prediction[] = predictions
            .map((pred: any) => ({
              className: pred.className,
              probability: pred.probability,
            }))
            .sort((a: Prediction, b: Prediction) => b.probability - a.probability)

          resolve(results)
          URL.revokeObjectURL(img.src)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    })
  } catch (error) {
    throw error
  }
}

export function disposeModel() {
  if (model) {
    model.dispose()
    model = null
  }
}
