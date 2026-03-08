'use client';

interface ResultDisplayProps {
  result: {
    label: string;
    confidence: number;
  };
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const isLeprosy = result.label === 'Leprosy Skin';
  const confidenceNum = typeof result.confidence === 'string' 
    ? parseFloat(result.confidence) 
    : result.confidence;

  return (
    <div className="space-y-6">
      {/* Result Card */}
      <div
        className={`rounded-xl p-8 ${
          isLeprosy
            ? 'bg-red-50 border-2 border-red-200'
            : 'bg-green-50 border-2 border-green-200'
        }`}
      >
        <div className="flex items-center gap-4 mb-4">
          {isLeprosy ? (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          <div>
            <p className={`text-sm font-semibold ${
              isLeprosy ? 'text-red-600' : 'text-green-600'
            }`}>
              SCAN RESULT
            </p>
            <h2 className={`text-3xl font-bold ${
              isLeprosy ? 'text-red-700' : 'text-green-700'
            }`}>
              {isLeprosy ? 'Leprosy Detected' : 'Leprosy Not Detected'}
            </h2>
          </div>
        </div>

        {isLeprosy && (
          <div className={`bg-red-100 border-l-4 border-red-600 p-4 rounded`}>
            <p className="text-red-800 font-semibold mb-2">⚠️ Alert</p>
            <p className="text-red-700 text-sm">
              The analysis suggests potential leprosy signs. 
              Please consult a qualified healthcare professional for proper diagnosis and treatment.
            </p>
          </div>
        )}
      </div>

      {/* Confidence Meter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-700">Confidence Score</p>
          <p className="text-lg font-bold text-indigo-600">{confidenceNum.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              confidenceNum > 80
                ? 'bg-green-500'
                : confidenceNum > 50
                ? 'bg-yellow-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(confidenceNum, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600">
          {confidenceNum > 80
            ? 'High confidence in result'
            : confidenceNum > 50
            ? 'Moderate confidence in result'
            : 'Low confidence - consider retaking image'}
        </p>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Analysis Type</p>
          <p className="font-semibold text-gray-900">AI Model Inference</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Model</p>
          <p className="font-semibold text-gray-900">Teachable Machine Classifier</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="font-semibold text-blue-900 mb-2">📋 Recommendations</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ For best results, ensure good lighting and clear image</li>
          <li>✓ Take multiple images for comparison</li>
          <li>✓ Consult with a medical professional for confirmation</li>
          <li>✓ This is an AI-assisted tool, not a medical diagnosis</li>
        </ul>
      </div>
    </div>
  );
}
