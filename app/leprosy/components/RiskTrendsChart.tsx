'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendData {
  date: string
  score: number
  level: string
}

export default function RiskTrendsChart() {
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m'>('3m')

  useEffect(() => {
    fetchTrends()
  }, [timeframe])

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || user._id || user.userId
      
      if (!userId) {
        return
      }

      const response = await fetch(`http://localhost:4000/api/leprosy/risk-assessment/trends?userId=${userId}&timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }

      const data = await response.json()

      if (data.data) {
        const formatted = data.data.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: item.score,
          level: item.level
        }))
        setTrendData(formatted)
      }
    } catch (err) {
      console.error('Error fetching trends:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Not enough data to show trends. Assessments are generated automatically as you log symptoms.</p>
      </div>
    )
  }

  const latest = trendData[trendData.length - 1]
  const previous = trendData[0]
  const change = latest.score - previous.score
  const changePercent = ((change / previous.score) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Risk Score Trends</h3>
          <div className="flex gap-2">
            {(['1m', '3m', '6m'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-sm rounded transition ${
                  timeframe === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t === '1m' ? '1 Month' : t === '3m' ? '3 Months' : '6 Months'}
              </button>
            ))}
          </div>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Starting Score</p>
            <p className="text-2xl font-bold text-gray-900">{previous.score}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Score</p>
            <p className="text-2xl font-bold text-gray-900">{latest.score}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Change</p>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {change > 0 ? '📈' : change < 0 ? '📉' : '➡️'} {change > 0 ? '+' : ''}{change.toFixed(1)}
              <span className="text-sm">({changePercent}%)</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                domain={[0, 100]}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}`, 'Score']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2}
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation */}
        <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Trend Analysis</h4>
          <p className="text-sm text-blue-700">
            {change < -5
              ? 'Your risk score is improving. Continue with your current treatment plan and lifestyle changes.'
              : change > 5
              ? 'Your risk score is increasing. Please contact your healthcare provider immediately.'
              : 'Your risk score is stable. Maintain your current treatment adherence and monitoring schedule.'}
          </p>
        </div>
      </div>
    </div>
  )
}
