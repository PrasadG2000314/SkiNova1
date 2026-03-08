/**
 * TensorFlow.js Model Client for Tinea Detection
 * Loads and uses the TensorFlow.js model from /public/models/New folder/
 */

import * as tf from '@tensorflow/tfjs';

interface PredictionResult {
  label: string;
  confidence: number;
  isTinea: boolean;
  normalConfidence: number;
}

class TineaModelClient {
  private model: tf.LayersModel | null = null;
  private modelLoaded = false;
  private labels = ['Normal', 'Tinea'];

  /**
   * Initialize and load the model
   */
  async loadModel(): Promise<void> {
    if (this.modelLoaded && this.model) {
      return;
    }

    try {
      console.log('[TineaModel] Loading model from /models/New folder/model.json');
      
      // Try loading from IndexedDB first (for cached model)
      try {
        this.model = await tf.loadLayersModel('indexeddb://tinea-model');
        console.log('[TineaModel] Model loaded successfully from IndexedDB');
        this.modelLoaded = true;
        return;
      } catch (indexedDbError) {
        console.log('[TineaModel] IndexedDB not found, loading from HTTP...');
      }

      // Load the model from the public folder via HTTP
      // The folder name has a space, so we need to URL encode it
      const modelUrl = 'http://localhost:3000/models/New%20folder/model.json';
      this.model = await tf.loadLayersModel(modelUrl);
      
      console.log('[TineaModel] Model loaded successfully from HTTP');
      this.modelLoaded = true;
    } catch (error) {
      console.error('[TineaModel] Failed to load model:', error);
      throw new Error('Failed to load TensorFlow model. Please ensure model files are in /public/models/New folder/');
    }
  }

  /**
   * Predict tinea from image
   */
  async predict(imageElement: HTMLImageElement | string): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      let image: tf.Tensor;

      if (typeof imageElement === 'string') {
        // Load image from URL/path
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageElement;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        image = tf.browser.fromPixels(img);
      } else {
        // Use existing image element
        image = tf.browser.fromPixels(imageElement);
      }

      // Resize to model input size (224x224)
      const resized = tf.image.resizeBilinear(image as tf.Tensor3D | tf.Tensor4D, [224, 224]);
      
      // Normalize pixel values to 0-1 range
      const normalized = resized.div(tf.scalar(255.0));
      
      // Add batch dimension
      const batched = normalized.expandDims(0);

      // Run prediction
      const prediction = this.model.predict(batched) as tf.Tensor;
      const probabilities = await prediction.data();

      // Get confidence for each class
      const normalConfidence = probabilities[0];
      const tineaConfidence = probabilities[1];

      // Determine prediction
      const isTinea = tineaConfidence > normalConfidence;
      const confidence = Math.max(normalConfidence, tineaConfidence);
      const label = isTinea ? 'Tinea' : 'Normal';

      // Cleanup
      image.dispose();
      resized.dispose();
      normalized.dispose();
      batched.dispose();
      prediction.dispose();

      console.log('[TineaModel] Prediction result:', {
        label,
        confidence: confidence.toFixed(4),
        normalConfidence: normalConfidence.toFixed(4),
        tineaConfidence: tineaConfidence.toFixed(4)
      });

      return {
        label,
        confidence: parseFloat(confidence.toFixed(4)),
        isTinea,
        normalConfidence: parseFloat(normalConfidence.toFixed(4))
      };
    } catch (error) {
      console.error('[TineaModel] Prediction failed:', error);
      throw error;
    }
  }

  /**
   * Batch predict from multiple images
   */
  async batchPredict(imageElements: (HTMLImageElement | string)[]): Promise<PredictionResult[]> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const results: PredictionResult[] = [];

    for (const imgElement of imageElements) {
      try {
        const result = await this.predict(imgElement);
        results.push(result);
      } catch (error) {
        console.error('[TineaModel] Error predicting for image:', error);
        results.push({
          label: 'Error',
          confidence: 0,
          isTinea: false,
          normalConfidence: 0
        });
      }
    }

    return results;
  }

  /**
   * Ensemble prediction - run multiple predictions on same image
   */
  async ensemblePredict(
    imageElement: HTMLImageElement | string,
    runs: number = 5
  ): Promise<{
    label: string;
    confidence: number;
    isTinea: boolean;
    votes: { tinea: number; normal: number };
    allResults: PredictionResult[];
  }> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const results: PredictionResult[] = [];
    let tineaVotes = 0;
    let normalVotes = 0;
    let totalConfidence = 0;

    for (let i = 0; i < runs; i++) {
      const result = await this.predict(imageElement);
      results.push(result);
      
      if (result.isTinea) {
        tineaVotes++;
      } else {
        normalVotes++;
      }
      
      totalConfidence += result.confidence;
    }

    const isTinea = tineaVotes > normalVotes;
    const finalConfidence = totalConfidence / runs;
    const label = isTinea ? 'Tinea' : 'Normal';

    console.log('[TineaModel] Ensemble result:', {
      label,
      confidence: finalConfidence.toFixed(4),
      votes: { tinea: tineaVotes, normal: normalVotes }
    });

    return {
      label,
      confidence: parseFloat(finalConfidence.toFixed(4)),
      isTinea,
      votes: { tinea: tineaVotes, normal: normalVotes },
      allResults: results
    };
  }

  /**
   * Unload model to free memory
   */
  unloadModel(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.modelLoaded = false;
      console.log('[TineaModel] Model unloaded');
    }
  }

  /**
   * Check if model is loaded
   */
  isLoaded(): boolean {
    return this.modelLoaded && this.model !== null;
  }
}

// Export singleton instance
export const tineaModel = new TineaModelClient();

// Export for use
export type { PredictionResult };
