'use client'

interface ComponentScores {
  symptomProgressionRisk: number
  treatmentAdherenceRisk: number
  complicationRisk: number
  sensorimotorCompromiseRisk: number
  immuneResponseRisk: number
  lifeconditionsRisk: number
}

interface ComponentInfo {
  name: string
  weight: number
  description: string
  color: string
}

const componentInfo: Record<string, ComponentInfo> = {
  symptomProgressionRisk: {
    name: 'Symptom Progression',
    weight: 25,
    description: 'How quickly and severely symptoms are progressing',
    color: 'bg-blue-100 border-blue-300'
  },
  treatmentAdherenceRisk: {
    name: 'Treatment Adherence',
    weight: 20,
    description: 'Consistency in taking medications and attending appointments',
    color: 'bg-green-100 border-green-300'
  },
  complicationRisk: {
    name: 'Complications',
    weight: 20,
    description: 'Risk of nerve damage, eye involvement, or disabilities',
    color: 'bg-orange-100 border-orange-300'
  },
  sensorimotorCompromiseRisk: {
    name: 'Sensorimotor Function',
    weight: 15,
    description: 'Impact on sensation and movement abilities',
    color: 'bg-purple-100 border-purple-300'
  },
  immuneResponseRisk: {
    name: 'Immune Response',
    weight: 12,
    description: 'Body\'s ability to fight the infection',
    color: 'bg-red-100 border-red-300'
  },
  lifeconditionsRisk: {
    name: 'Life Conditions',
    weight: 8,
    description: 'Living conditions, nutrition, stress, and hygiene',
    color: 'bg-yellow-100 border-yellow-300'
  }
}

export default function RiskComponentBreakdown({ components }: { components: ComponentScores }) {
  const getBarColor = (score: number) => {
    if (score <= 25) return 'bg-green-500'
    if (score <= 50) return 'bg-yellow-500'
    if (score <= 75) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Components Breakdown</h3>

        <div className="space-y-6">
          {Object.entries(components).map(([key, value]) => {
            const info = componentInfo[key as keyof typeof componentInfo]
            if (!info) return null

            return (
              <div key={key} className={`rounded-lg border p-4 ${info.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{info.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(value)}</div>
                    <div className="text-xs text-gray-600">Weight: {info.weight}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(value)} transition-all duration-500`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>

                {/* Score interpretation */}
                <div className="mt-3 text-xs text-gray-700">
                  {value <= 25 && <span className="text-green-700">✓ Low risk</span>}
                  {value > 25 && value <= 50 && <span className="text-yellow-700">⚠ Moderate</span>}
                  {value > 50 && value <= 75 && <span className="text-orange-700">⚠ High risk</span>}
                  {value > 75 && <span className="text-red-700">🚨 Critical</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Weight distribution note */}
        <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Weight Distribution</h4>
          <p className="text-sm text-gray-700 mb-3">
            Your overall risk score is calculated by weighing each component based on its clinical significance:
          </p>

          <div className="space-y-2 text-sm">
            {Object.entries(componentInfo).map(([key, info]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700">{info.name}</span>
                <span className="text-gray-900 font-medium">{info.weight}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
            <span className="text-gray-900 font-semibold">Total</span>
            <span className="text-gray-900 font-semibold">100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
