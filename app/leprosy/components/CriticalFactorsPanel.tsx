'use client'

import { AlertTriangle, AlertCircle } from 'lucide-react'

interface CriticalFactor {
  factor: string
  severity: 'high' | 'critical'
  explanation: string
  action: string
}

export default function CriticalFactorsPanel({ factors }: { factors: CriticalFactor[] }) {
  if (factors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-700">✓ No critical factors identified. Keep up with your treatment plan!</p>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Critical Factors Requiring Attention</h3>
      </div>

      <div className="space-y-4">
        {factors.map((factor, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-4 border ${
              factor.severity === 'critical'
                ? 'bg-red-100 border-red-300'
                : 'bg-orange-100 border-orange-300'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              {factor.severity === 'critical' ? (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  factor.severity === 'critical'
                    ? 'text-red-900'
                    : 'text-orange-900'
                }`}>
                  {factor.factor}
                </h4>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                factor.severity === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-orange-600 text-white'
              }`}>
                {factor.severity.toUpperCase()}
              </span>
            </div>

            <p className={`text-sm ${
              factor.severity === 'critical'
                ? 'text-red-800'
                : 'text-orange-800'
            } mb-3`}>
              {factor.explanation}
            </p>

            <div className={`text-sm font-medium ${
              factor.severity === 'critical'
                ? 'text-red-900'
                : 'text-orange-900'
            } p-3 rounded ${
              factor.severity === 'critical'
                ? 'bg-red-200'
                : 'bg-orange-200'
            }`}>
              <span className="font-semibold">Required Action: </span>
              {factor.action}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-red-300">
        <p className="text-sm text-red-800">
          <strong>Important:</strong> Please discuss these factors with your healthcare provider at your earliest convenience. Some may require urgent attention.
        </p>
      </div>
    </div>
  )
}
