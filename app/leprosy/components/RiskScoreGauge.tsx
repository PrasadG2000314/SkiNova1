'use client'

import { useState, useEffect } from 'react'

interface RiskAssessment {
  overallRiskScore: number
  riskLevel: string
  componentScores: any
}

export default function RiskScoreGauge({ assessment }: { assessment: RiskAssessment }) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    // Animate the gauge
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < assessment.overallRiskScore) {
          return Math.min(prev + 2, assessment.overallRiskScore)
        }
        return prev
      })
    }, 15)

    return () => clearInterval(interval)
  }, [assessment.overallRiskScore])

  const getGaugeColor = (score: number) => {
    if (score <= 25) return '#10b981' // green
    if (score <= 50) return '#f59e0b' // amber
    if (score <= 75) return '#f97316' // orange
    return '#dc2626' // red
  }

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (displayScore / 100) * circumference

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Score Gauge</h3>

      <div className="flex flex-col items-center">
        {/* SVG Gauge */}
        <div className="relative w-48 h-48 mb-6">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background circle */}
            <circle cx="100" cy="100" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />

            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="45"
              fill="none"
              stroke={getGaugeColor(displayScore)}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.1s ease' }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold" style={{ color: getGaugeColor(displayScore) }}>
              {displayScore}
            </div>
            <div className="text-sm text-gray-600">out of 100</div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">Risk Level</p>
          <p className="text-2xl font-bold" style={{ color: getGaugeColor(displayScore) }}>
            {assessment.riskLevel}
          </p>
        </div>

        {/* Risk Scale */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical</span>
          </div>
          <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full"></div>
          <div className="flex justify-between text-xs font-medium text-gray-700 mt-2">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Score Interpretation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">What This Means</h4>
        <div className="space-y-2 text-sm text-gray-700">
          {assessment.riskLevel === 'Low' && (
            <>
              <p>✓ Your leprosy risk is currently low</p>
              <p>✓ Continue following your treatment plan</p>
              <p>✓ Maintain regular check-ups</p>
            </>
          )}
          {assessment.riskLevel === 'Moderate' && (
            <>
              <p>⚠ Your leprosy risk is moderate</p>
              <p>• Increase treatment adherence</p>
              <p>• Schedule more frequent check-ups</p>
            </>
          )}
          {assessment.riskLevel === 'High' && (
            <>
              <p>⚠ Your leprosy risk is high</p>
              <p>• Urgent medication adherence required</p>
              <p>• Contact your doctor immediately</p>
            </>
          )}
          {assessment.riskLevel === 'Critical' && (
            <>
              <p>🚨 Your leprosy risk is critical</p>
              <p>• Seek emergency medical attention</p>
              <p>• Contact your healthcare provider immediately</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
