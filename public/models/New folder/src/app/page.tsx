'use client'

import React, { useState, useCallback } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ResultCard from '@/components/ResultCard'
import { predictImage, loadModel } from '@/lib/modelLoader'
import { Prediction } from '@/lib/modelConfig'

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelLoading, setModelLoading] = useState(false)

  // Load model on mount
  React.useEffect(() => {
    const initModel = async () => {
      try {
        setModelLoading(true)
        await loadModel()
        setModelLoading(false)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load model. Make sure model files are in /public/model/'
        )
        setModelLoading(false)
      }
    }

    initModel()
  }, [])

  const handleImageSelect = useCallback(async (file: File) => {
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Reset states
      setError(null)
      setPredictions([])

      // Make prediction after a short delay to allow preview to update
      setTimeout(async () => {
        try {
          setLoading(true)
          const results = await predictImage(file)
          setPredictions(results)
          setLoading(false)
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to analyze image'
          )
          setLoading(false)
        }
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-medical-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-medical-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tinea Classifier
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI-Powered Medical Image Analysis
          </p>
          <p className="text-gray-500">
            Upload an image to detect tinea fungal infections
          </p>
        </div>

        {/* Loading Model */}
        {modelLoading && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-blue-800 font-medium">Initializing AI model...</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Uploader */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ImageUploader onImageSelect={handleImageSelect} preview={preview} />
          </div>

          {/* Results */}
          {(predictions.length > 0 || loading || error) && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ResultCard
                predictions={predictions}
                loading={loading}
                error={error}
              />
            </div>
          )}

          {/* Info Cards */}
          {predictions.length === 0 && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How to Use
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Click or drag to upload an image</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>AI analyzes the image automatically</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>View detailed classification results</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-gray-600 text-sm">
                  This tool is for educational purposes. Always consult with a
                  qualified healthcare professional for medical diagnosis and
                  treatment recommendations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Powered by Teachable Machine & TensorFlow.js
          </p>
        </div>
      </div>
    </main>
  )
}
