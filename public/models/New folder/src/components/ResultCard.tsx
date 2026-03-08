'use client'

interface Prediction {
  className: string
  probability: number
}

interface ResultCardProps {
  predictions: Prediction[]
  loading: boolean
  error: string | null
}

export default function ResultCard({
  predictions,
  loading,
  error,
}: ResultCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
        </div>
        <p className="text-gray-600 font-medium">Analyzing image...</p>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (predictions.length === 0) {
    return null
  }

  const topPrediction = predictions[0]
  const isPositive = topPrediction.className === 'tinea'
  const confidence = (topPrediction.probability * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <div
        className={`rounded-lg shadow-lg p-8 text-center ${
          isPositive
            ? 'bg-red-50 border-2 border-red-200'
            : 'bg-green-50 border-2 border-green-200'
        }`}
      >
        <div className="flex justify-center mb-4">
          {isPositive ? (
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

        <h3 className={`text-2xl font-bold ${isPositive ? 'text-red-700' : 'text-green-700'}`}>
          {topPrediction.className.toUpperCase()}
        </h3>
        <p className={`text-lg font-semibold mt-2 ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
          {confidence}% Confidence
        </p>
        {isPositive && (
          <p className="text-sm text-red-600 mt-3 italic">
            Tinea infection detected. Please consult a healthcare professional.
          </p>
        )}
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Classification Details
        </h4>
        <div className="space-y-3">
          {predictions.map((pred, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium capitalize">
                  {pred.className}
                </span>
                <span className="text-gray-900 font-bold">
                  {(pred.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    pred.className === 'tinea'
                      ? 'bg-red-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${pred.probability * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
