'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, TrendingDown, Activity, Heart, Shield } from 'lucide-react'
import RiskScoreGauge from './RiskScoreGauge'
import RiskComponentBreakdown from './RiskComponentBreakdown'
import RiskTrendsChart from './RiskTrendsChart'
import CriticalFactorsPanel from './CriticalFactorsPanel'
import RecommendationsPanel from './RecommendationsPanel'
import XAIExplanation from './XAIExplanation'

interface RiskAssessment {
  overallRiskScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  diseaseTrajectory: 'Improving' | 'Stable' | 'Progressing' | 'Unknown'
  componentScores: {
    symptomProgressionRisk: number
    treatmentAdherenceRisk: number
    complicationRisk: number
    sensorimotorCompromiseRisk: number
    immuneResponseRisk: number
    lifeconditionsRisk: number
  }
  criticalFactors: Array<{
    factor: string
    severity: 'high' | 'critical'
    explanation: string
    action: string
  }>
  protectiveFactors: Array<{
    factor: string
    explanation: string
    encouragement: string
  }>
  predictions: {
    riskOfReaction: number
    riskOfDisability: number
    estimatedImprovementTimeline: string
  }
  recommendations: string[]
  nextCheckupDueDate: string
  aiPrediction?: {
    leprosyTypeId: number
    leprosyTypeName: string
    leprosyTypeCode: string
    riskLevel: string
    description: string
    confidence: number
    confidencePercent: number
    classProbabilities: Record<string, number>
    clinicalInterpretation?: {
      typeClassification: string
      bacillaryLoad: string
      treatmentRegimen: string
      monitoringPriority: string
      keyClinicalNotes: string[]
    }
    disclaimer?: string
    predictionTimestamp?: string
  }
}

export default function RiskAnalysisComponent() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'trends' | 'predictions' | 'xai'>('overview')

  useEffect(() => {
    fetchLatestAssessment()
  }, [])

  const fetchLatestAssessment = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || user._id || user.userId
      
      if (!userId) {
        setError('User ID not found. Please log in again.')
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:4000/api/leprosy/risk-assessment/latest?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        // Try to calculate if none exists
        if (response.status === 404) {
          await calculateRiskScore()
          return
        }
        throw new Error('Failed to fetch assessment')
      }

      const data = await response.json()
      setAssessment(data.assessment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading risk assessment')
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskScore = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || user._id || user.userId
      
      if (!userId) {
        setError('User ID not found. Please log in again.')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:4000/api/leprosy/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate risk assessment')
      }

      const data = await response.json()
      setAssessment(data.assessment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating risk assessment')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-600'
      case 'Moderate':
        return 'text-yellow-600'
      case 'High':
        return 'text-orange-600'
      case 'Critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-50 border-green-200'
      case 'Moderate':
        return 'bg-yellow-50 border-yellow-200'
      case 'High':
        return 'bg-orange-50 border-orange-200'
      case 'Critical':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trajectory: string) => {
    if (trajectory === 'Improving') {
      return <TrendingDown className="w-5 h-5 text-green-600" />
    } else if (trajectory === 'Progressing') {
      return <TrendingUp className="w-5 h-5 text-red-600" />
    }
    return <Activity className="w-5 h-5 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Analyzing your risk factors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="font-semibold text-red-900">Error Loading Assessment</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={calculateRiskScore}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-blue-900">No Assessment Yet</h3>
        </div>
        <p className="text-blue-700 mb-4">Create your first risk assessment by analyzing your symptom logs and profile.</p>
        <button
          onClick={calculateRiskScore}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Calculate Risk Score
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Risk Score */}
        <div className={`rounded-lg border p-4 ${getRiskBgColor(assessment.riskLevel)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Overall Risk Score</h3>
            <Heart className={`w-4 h-4 ${getRiskColor(assessment.riskLevel)}`} />
          </div>
          <div className={`text-3xl font-bold ${getRiskColor(assessment.riskLevel)}`}>
            {assessment.overallRiskScore}
          </div>
          <p className={`text-xs mt-1 ${getRiskColor(assessment.riskLevel)}`}>{assessment.riskLevel} Risk</p>
        </div>

        {/* Disease Trajectory */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Disease Trajectory</h3>
            {getTrendIcon(assessment.diseaseTrajectory)}
          </div>
          <p className="text-lg font-semibold text-gray-900">{assessment.diseaseTrajectory}</p>
          <p className="text-xs text-gray-500 mt-1">Based on symptom progression</p>
        </div>

        {/* Next Checkup */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Next Checkup Due</h3>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(assessment.nextCheckupDueDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Schedule with your doctor</p>
        </div>

        {/* AI Model Prediction */}
        {assessment.aiPrediction?.leprosyTypeCode ? (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-700">AI Type Prediction</h3>
              <span className="text-lg">🤖</span>
            </div>
            <p className="text-lg font-bold text-purple-900">{assessment.aiPrediction.leprosyTypeCode}</p>
            <p className="text-xs text-purple-700 mt-1 truncate">{assessment.aiPrediction.leprosyTypeName}</p>
            <p className="text-xs text-purple-600 mt-1">{(assessment.aiPrediction.confidencePercent ?? (assessment.aiPrediction.confidence ?? 0) * 100).toFixed(1)}% confidence</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Reaction Risk</h3>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{assessment.predictions.riskOfReaction}%</p>
            <p className="text-xs text-gray-500 mt-1">Type 1/2 Reaction</p>
          </div>
        )}
      </div>

      {/* Recalculate Button */}
      <div className="flex justify-end">
        <button
          onClick={calculateRiskScore}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            loading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Recalculating...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Recalculate Assessment
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {(['overview', 'breakdown', 'trends', 'predictions', 'xai'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'xai' ? 'AI Explanation' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <RiskScoreGauge assessment={assessment} />
            {assessment.criticalFactors.length > 0 && (
              <CriticalFactorsPanel factors={assessment.criticalFactors} />
            )}
          </div>
        )}

        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && <RiskComponentBreakdown components={assessment.componentScores} />}

        {/* Trends Tab */}
        {activeTab === 'trends' && <RiskTrendsChart />}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            {/* AI Model Prediction Panel */}
            {assessment.aiPrediction?.leprosyTypeCode && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🤖</span>
                  <h3 className="font-bold text-purple-900 text-lg">AI Model Classification</h3>
                  <span className="ml-auto text-xs text-purple-500">
                    Trained ML Model
                  </span>
                </div>

                {/* Predicted Type */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-1 bg-white rounded-lg p-4 border border-purple-100">
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Predicted Leprosy Type</p>
                    <p className="text-2xl font-bold text-purple-900">{assessment.aiPrediction.leprosyTypeName}</p>
                    <p className="text-sm text-purple-700 mt-1">{assessment.aiPrediction.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        assessment.aiPrediction.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        assessment.aiPrediction.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{assessment.aiPrediction.riskLevel} Risk</span>
                      <span className="text-xs text-purple-600">
                        Confidence: <strong>{(assessment.aiPrediction.confidencePercent ?? (assessment.aiPrediction.confidence ?? 0) * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Probability Distribution */}
                {assessment.aiPrediction.classProbabilities && Object.keys(assessment.aiPrediction.classProbabilities).length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-purple-800 mb-3">Probability by Type</p>
                    <div className="space-y-2">
                      {Object.entries(assessment.aiPrediction.classProbabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([typeName, prob]) => {
                          const pct = Math.round(Number(prob) * 100)
                          const isTop = typeName === assessment.aiPrediction!.leprosyTypeName
                          return (
                            <div key={typeName}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={`font-medium ${isTop ? 'text-purple-900' : 'text-gray-600'}`}>{typeName}</span>
                                <span className={`font-bold ${isTop ? 'text-purple-900' : 'text-gray-500'}`}>{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${isTop ? 'bg-purple-600' : 'bg-purple-200'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Clinical Interpretation */}
                {assessment.aiPrediction.clinicalInterpretation && (
                  <div className="bg-white rounded-lg p-4 border border-purple-100 mb-4">
                    <p className="text-sm font-semibold text-purple-800 mb-3">Clinical Interpretation</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-600 w-36 shrink-0">Classification:</span>
                        <span className="text-gray-900">{assessment.aiPrediction.clinicalInterpretation.typeClassification}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-600 w-36 shrink-0">Bacillary Load:</span>
                        <span className="text-gray-900">{assessment.aiPrediction.clinicalInterpretation.bacillaryLoad}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-600 w-36 shrink-0">Treatment:</span>
                        <span className="text-gray-900">{assessment.aiPrediction.clinicalInterpretation.treatmentRegimen}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-600 w-36 shrink-0">Monitoring:</span>
                        <span className="text-gray-900">{assessment.aiPrediction.clinicalInterpretation.monitoringPriority}</span>
                      </div>
                    </div>
                    {(assessment.aiPrediction.clinicalInterpretation.keyClinicalNotes?.length ?? 0) > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-100">
                        <p className="text-xs font-semibold text-purple-700 mb-2">Key Clinical Notes:</p>
                        <ul className="space-y-1">
                          {assessment.aiPrediction.clinicalInterpretation.keyClinicalNotes.map((note, i) => (
                            <li key={i} className="text-xs text-gray-700">{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {assessment.aiPrediction.disclaimer && (
                  <p className="text-xs text-purple-500 italic">{assessment.aiPrediction.disclaimer}</p>
                )}
              </div>
            )}

            {/* Statistical Predictions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Risk Predictions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Reaction Risk</p>
                  <p className="text-2xl font-bold text-blue-900">{assessment.predictions.riskOfReaction}%</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 mb-1">Disability Risk</p>
                  <p className="text-2xl font-bold text-blue-900">{assessment.predictions.riskOfDisability}%</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">Estimated Improvement Timeline</p>
                <p className="text-lg font-semibold text-blue-900">{assessment.predictions.estimatedImprovementTimeline}</p>
              </div>
            </div>
          </div>
        )}

        {/* XAI Tab */}
        {activeTab === 'xai' && <XAIExplanation />}
      </div>

      {/* Recommendations */}
      {assessment.recommendations.length > 0 && <RecommendationsPanel recommendations={assessment.recommendations} />}

      {/* Protective Factors */}
      {assessment.protectiveFactors.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Protective Factors
          </h3>
          <div className="space-y-3">
            {assessment.protectiveFactors.map((factor, idx) => (
              <div key={idx} className="bg-white rounded p-3 border border-green-100">
                <p className="font-medium text-green-900">{factor.factor}</p>
                <p className="text-sm text-green-700 mt-1">{factor.explanation}</p>
                <p className="text-sm font-medium text-green-900 mt-2 italic">{factor.encouragement}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
