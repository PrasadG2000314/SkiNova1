'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, BarChart3, TrendingUp, Check, Info } from 'lucide-react'

interface FeatureContribution {
  name: string
  value: string | number | boolean
  importance: number
  direction: 'positive' | 'negative' | 'neutral'
  explanation: string
  category: string
}

interface AttributionMap {
  feature: string
  contribution: number
  gradient: number
  color: string
}

interface XAIExplanation {
  overallExplanation: string
  keyDrivers: FeatureContribution[]
  protectiveFactors: FeatureContribution[]
  attributionMap: AttributionMap[]
  confidenceScore: number
  dataCompleteness: number
  riskContributionBreakdown: {
    symptomContribution: number
    adherenceContribution: number
    complicationContribution: number
    sensorimotorContribution: number
    immuneContribution: number
    lifestyleContribution: number
  }
}

export default function XAIExplanationComponent() {
  const [xaiData, setXaiData] = useState<XAIExplanation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  useEffect(() => {
    fetchXAIExplanation()
  }, [])

  const fetchXAIExplanation = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || user._id || user.userId

      if (!userId) {
        setError('User ID not found. Please log in again.')
        setLoading(false)
        return
      }

      const response = await fetch(
        `http://localhost:4000/api/leprosy/risk-assessment/xai/latest?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          setError('No risk assessment available. Please generate one first.')
        } else {
          throw new Error('Failed to fetch XAI explanation')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      setXaiData(data.xai)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading XAI explanation')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Loading explainable AI analysis...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!xaiData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overall Explanation with Detailed Reasons */}
      <div className="p-5 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
        <div>
          <p className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            AI Prediction Explanation
          </p>
          <p className="text-blue-800 mb-3 whitespace-pre-wrap leading-relaxed">{xaiData.overallExplanation}</p>
        </div>

        {/* Detailed Reasons Section */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-blue-900 font-semibold mb-3">Why This Result Was Predicted (Grad-CAM Analysis)</p>
          
          <div className="space-y-3">
            {/* Primary Risk Drivers */}
            {xaiData.keyDrivers.length > 0 && (
              <div className="bg-white rounded p-3 border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">Primary Risk Factors:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {xaiData.keyDrivers.slice(0, 3).map((driver, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold flex-shrink-0">•</span>
                      <span>
                        <strong>{driver.name}</strong> (Importance: {Math.round(driver.importance)}%) - {driver.explanation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Protective Factors */}
            {xaiData.protectiveFactors.length > 0 && (
              <div className="bg-white rounded p-3 border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">Protective Factors Reducing Risk:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {xaiData.protectiveFactors.slice(0, 2).map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>
                        <strong>{factor.name}</strong> (Protective Factor) - {factor.explanation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Component Contribution */}
            <div className="bg-white rounded p-3 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Component Contribution Analysis:</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  This prediction is driven by the weighted contribution of 6 medical components:
                  <span className="font-semibold ml-1">
                    Symptoms ({xaiData.riskContributionBreakdown.symptomContribution}%) + 
                    Adherence ({xaiData.riskContributionBreakdown.adherenceContribution}%) + 
                    Complications ({xaiData.riskContributionBreakdown.complicationContribution}%)
                  </span>
                </p>
              </div>
            </div>

            {/* Confidence Explanation */}
            <div className="bg-white rounded p-3 border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-900 mb-2">Model Confidence & Data Quality:</p>
              <p className="text-sm text-blue-800">
                This prediction has <strong className="text-yellow-700">{Math.round(xaiData.confidenceScore)}% confidence</strong> based on 
                <strong className="text-yellow-700"> {Math.round(xaiData.dataCompleteness)}% data completeness</strong>. 
                The higher these percentages, the more reliable the prediction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence & Completeness Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-900 font-semibold">Confidence Score</span>
            <span className="text-2xl font-bold text-green-700">{Math.round(xaiData.confidenceScore)}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${xaiData.confidenceScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-green-700 mt-2">Model certainty in this prediction</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-900 font-semibold">Data Completeness</span>
            <span className="text-2xl font-bold text-yellow-700">{Math.round(xaiData.dataCompleteness)}%</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all"
              style={{ width: `${xaiData.dataCompleteness}%` }}
            ></div>
          </div>
          <p className="text-sm text-yellow-700 mt-2">Percentage of data fields available</p>
        </div>
      </div>

      {/* Attribution Map (Grad-CAM style) */}
      <div className="p-5 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" />
          Feature Attribution Map
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows which patient factors contributed most to the risk prediction (red = increases risk, green = protective)
        </p>
        <div className="space-y-3">
          {xaiData.attributionMap.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.feature}</span>
                <span
                  className={`text-sm font-semibold ${
                    item.contribution > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {item.contribution > 0 ? '+' : ''}
                  {item.contribution.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      backgroundColor: item.color,
                      width: `${Math.abs(item.contribution)}%`,
                      opacity: item.gradient
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Contribution Breakdown */}
      <div className="p-5 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Risk Component Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Symptom Progression</span>
              <span className="text-sm font-semibold">{xaiData.riskContributionBreakdown.symptomContribution}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${xaiData.riskContributionBreakdown.symptomContribution}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Treatment Adherence</span>
              <span className="text-sm font-semibold">{xaiData.riskContributionBreakdown.adherenceContribution}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${xaiData.riskContributionBreakdown.adherenceContribution}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Complications</span>
              <span className="text-sm font-semibold">{xaiData.riskContributionBreakdown.complicationContribution}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${xaiData.riskContributionBreakdown.complicationContribution}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sensorimotor Status</span>
              <span className="text-sm font-semibold">{xaiData.riskContributionBreakdown.sensorimotorContribution}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${xaiData.riskContributionBreakdown.sensorimotorContribution}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Immune Response</span>
              <span className="text-sm font-semibold">{xaiData.riskContributionBreakdown.immuneContribution}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-lime-500 h-2 rounded-full"
                style={{ width: `${xaiData.riskContributionBreakdown.immuneContribution}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lifestyle Conditions</span>
              <span className="text-sm font-semibold">{xaiData.riskContributionBreakdown.lifestyleContribution}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${xaiData.riskContributionBreakdown.lifestyleContribution}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Risk Drivers */}
      {xaiData.keyDrivers.length > 0 && (
        <div className="p-5 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Key Risk Drivers</h3>
          <div className="space-y-3">
            {xaiData.keyDrivers.map((driver, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setExpandedFeature(expandedFeature === driver.name ? null : driver.name)
                }
                className="p-3 bg-white rounded-lg border border-red-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full flex-shrink-0">
                      <span className="text-red-700 font-bold text-sm">{Math.round(driver.importance)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-600">
                        {typeof driver.value === 'boolean'
                          ? driver.value
                            ? 'Present'
                            : 'Absent'
                          : driver.value}
                      </p>
                    </div>
                  </div>
                  <span className="text-red-600 text-sm font-semibold">{driver.category}</span>
                </div>
                {expandedFeature === driver.name && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-gray-700">{driver.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protective Factors */}
      {xaiData.protectiveFactors.length > 0 && (
        <div className="p-5 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Protective Factors
          </h3>
          <div className="space-y-3">
            {xaiData.protectiveFactors.map((factor, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setExpandedFeature(expandedFeature === factor.name ? null : factor.name)
                }
                className="p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                      <Check className="w-4 h-4 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{factor.name}</p>
                      <p className="text-sm text-gray-600">
                        {typeof factor.value === 'boolean'
                          ? factor.value
                            ? 'Present'
                            : 'Absent'
                          : factor.value}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 text-sm font-semibold">{factor.category}</span>
                </div>
                {expandedFeature === factor.name && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm text-gray-700">{factor.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How This Works */}
      <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">How This XAI Analysis Works</h3>
        <p className="text-sm text-gray-700 mb-3">
          This explainable AI system analyzes your medical data using a SHAP-like attribution approach. It identifies
          which specific factors in your profile and symptoms contribute most to the risk prediction. The feature
          attribution map (similar to Grad-CAM) visualizes the importance of each factor:
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            <strong>Red indicators</strong> show factors that <strong>increase</strong> your risk
          </li>
          <li>
            <strong>Green indicators</strong> show factors that are <strong>protective</strong> or reduce risk
          </li>
          <li>
            <strong>Confidence score</strong> indicates how certain the model is in this prediction
          </li>
          <li>
            <strong>Data completeness</strong> shows how much of your medical information was available for analysis
          </li>
        </ul>
      </div>
    </div>
  )
}
