'use client'

import React, { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Prediction {
  className: string
  probability: number
}

export default function TineaModelUIPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('http://localhost:4000/api/detect/tinea', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Failed to analyze image')
          }

          const data = await response.json()
          if (data.success) {
            setPredictions([
              {
                className: data.tineaType || 'Tinea Detected',
                probability: data.confidence || 0.85
              }
            ])
          }
          setLoading(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to analyze image')
          setLoading(false)
        }
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleReset = () => {
    setPreview(null)
    setPredictions([])
    setError(null)
  }

  const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability)
  const topPrediction = sortedPredictions[0]
  const confidence = topPrediction ? topPrediction.probability * 100 : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link href="/tinea">
          <button className="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            ← Back to Tinea Page
          </button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-blue-700"
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Tinea Classifier</h1>
          <p className="text-xl text-gray-600 mb-2">AI-Powered Medical Image Analysis</p>
          <p className="text-gray-500">Upload an image to detect tinea fungal infections</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Uploader */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-full">
              {preview ? (
                <div className="space-y-4">
                  <div className="relative w-full rounded-lg overflow-hidden bg-white shadow-md">
                    <img src={preview} alt="Preview" className="w-full h-64 object-contain" />
                  </div>
                  <p className="text-sm text-gray-600 text-center">Click to change image or drag and drop</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-blue-500 bg-blue-50 hover:border-blue-600"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    title="Upload medical image"
                  />

                  <div className="space-y-4">
                    <svg
                      className="mx-auto h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Upload Medical Image</p>
                      <p className="text-sm text-gray-600 mt-2">Drag and drop your image or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, or GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {(predictions.length > 0 || loading || error) && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              {loading && (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Analyzing image...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {predictions.length > 0 && !loading && (
                <div className="space-y-6">
                  {/* Result Summary */}
                  <div
                    className={`rounded-lg shadow-lg p-8 text-center ${
                      topPrediction?.className === 'Tinea Detected'
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'bg-green-50 border-2 border-green-200'
                    }`}
                  >
                    <div className="flex justify-center mb-4">
                      {topPrediction?.className === 'Tinea Detected' ? (
                        <svg
                          className="h-16 w-16 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-16 w-16 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>

                    <h3
                      className={`text-2xl font-bold ${
                        topPrediction?.className === 'Tinea Detected'
                          ? 'text-red-700'
                          : 'text-green-700'
                      }`}
                    >
                      {topPrediction?.className.toUpperCase()}
                    </h3>
                    <p
                      className={`text-lg font-semibold mt-2 ${
                        topPrediction?.className === 'Tinea Detected'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {confidence.toFixed(1)}% Confidence
                    </p>
                    {topPrediction?.className === 'Tinea Detected' && (
                      <p className="text-sm text-red-600 mt-3 italic">
                        Tinea infection detected. Please consult a healthcare professional.
                      </p>
                    )}
                  </div>

                  {/* Detailed Results */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Classification Details</h4>
                    <div className="space-y-3">
                      {predictions.map((pred, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium capitalize">{pred.className}</span>
                            <span className="text-gray-900 font-bold">{(pred.probability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                pred.className === 'Tinea Detected' ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${pred.probability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Analyze Another Image
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Cards */}
          {predictions.length === 0 && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notice</h3>
                <p className="text-gray-600 text-sm">
                  This tool is for educational purposes. Always consult with a qualified healthcare professional for medical diagnosis and treatment recommendations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">Powered by TensorFlow.js & Medical AI</p>
        </div>
      </div>
    </main>
  )
}
