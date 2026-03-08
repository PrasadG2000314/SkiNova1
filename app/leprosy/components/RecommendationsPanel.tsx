'use client'

import { CheckCircle, Lightbulb } from 'lucide-react'

export default function RecommendationsPanel({ recommendations }: { recommendations: string[] }) {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Personalized Recommendations</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-blue-100">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">{rec}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-200 bg-white rounded p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Review these recommendations with your healthcare provider</li>
          <li>Implement recommended changes gradually</li>
          <li>Track your progress by logging symptoms regularly</li>
          <li>Schedule follow-up assessment in {new Date().getMonth() + 1} weeks</li>
        </ol>
      </div>
    </div>
  )
}
