export interface PredictionResult {
  classification: 'melanoma' | 'normal skin'
  confidence: number
  allPredictions?: Array<{
    class: string
    probability: number
  }>
}
