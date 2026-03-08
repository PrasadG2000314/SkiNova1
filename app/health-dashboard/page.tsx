'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HealthSummary {
  latest: any;
  last24Hours: {
    heartRate: { average: number | null; current: number | null };
    steps: { total: number; current: number | null };
    temperature: { average: number | null; current: number | null };
    spO2: { average: number | null; current: number | null };
    stressLevel: { average: number | null; current: number | null };
    sleep: { totalMinutes: number; averageQuality: number | null };
  };
}

export default function HealthDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, [period]);

  const fetchHealthData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      // Fetch latest summary
      const summaryResponse = await fetch('http://localhost:4000/api/health/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        setSummary(summaryData.summary);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(`http://localhost:4000/api/health/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined, decimals = 0): string => {
    if (num === null || num === undefined) return 'N/A';
    return num.toFixed(decimals);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Health Dashboard
              </h1>
            </div>
            <button
              onClick={() => router.push('/smart-devices')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
            >
              Manage Devices
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!summary?.latest ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-gray-200">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-gray-600 text-lg mb-4">No health data available</p>
            <p className="text-gray-500 mb-6">Connect a device and sync your health data to see insights</p>
            <button
              onClick={() => router.push('/smart-devices')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              Connect a Device
            </button>
          </div>
        ) : (
          <>
            {/* Current Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Heart Rate */}
              <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-6 shadow-lg border-2 border-red-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">❤️</div>
                  <span className="text-xs bg-red-200 text-red-900 px-3 py-1 rounded-full font-semibold">
                    Heart Rate
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(summary.last24Hours.heartRate.current)} <span className="text-2xl text-gray-600">bpm</span>
                </div>
                <p className="text-gray-700 text-sm">
                  24h avg: {formatNumber(summary.last24Hours.heartRate.average)} bpm
                </p>
              </div>

              {/* Steps */}
              <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 shadow-lg border-2 border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">👟</div>
                  <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full font-semibold">
                    Steps
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {summary.last24Hours.steps.total.toLocaleString()}
                </div>
                <p className="text-gray-700 text-sm">
                  Last 24 hours
                </p>
              </div>

              {/* Temperature */}
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-6 shadow-lg border-2 border-orange-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🌡️</div>
                  <span className="text-xs bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-semibold">
                    Temperature
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(summary.last24Hours.temperature.current, 1)} <span className="text-2xl text-gray-600">°C</span>
                </div>
                <p className="text-gray-700 text-sm">
                  24h avg: {formatNumber(summary.last24Hours.temperature.average, 1)} °C
                </p>
              </div>

              {/* SpO2 */}
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-6 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🫁</div>
                  <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-semibold">
                    Blood Oxygen
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(summary.last24Hours.spO2.current)} <span className="text-2xl text-gray-600">%</span>
                </div>
                <p className="text-gray-700 text-sm">
                  24h avg: {formatNumber(summary.last24Hours.spO2.average)} %
                </p>
              </div>

              {/* Stress */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">😰</div>
                  <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full font-semibold">
                    Stress Level
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatNumber(summary.last24Hours.stressLevel.current)}
                </div>
                <p className="text-gray-700 text-sm">
                  24h avg: {formatNumber(summary.last24Hours.stressLevel.average)}
                </p>
              </div>

              {/* Sleep */}
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 shadow-lg border-2 border-indigo-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">😴</div>
                  <span className="text-xs bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full font-semibold">
                    Sleep
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {Math.floor(summary.last24Hours.sleep.totalMinutes / 60)}h {summary.last24Hours.sleep.totalMinutes % 60}m
                </div>
                <p className="text-gray-700 text-sm">
                  Quality: {formatNumber(summary.last24Hours.sleep.averageQuality)}/100
                </p>
              </div>
            </div>

            {/* Insights */}
            <div className="mb-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💡 Health Insights
              </h3>
              <div className="space-y-3">
                {summary.last24Hours.temperature.average && summary.last24Hours.temperature.average > 37.5 && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <p className="text-orange-900 font-semibold">🌡️ Elevated Temperature</p>
                    <p className="text-orange-800 text-sm mt-1">Your average temperature is higher than normal. Monitor for signs of infection.</p>
                  </div>
                )}
                
                {summary.last24Hours.stressLevel.average && summary.last24Hours.stressLevel.average > 60 && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-purple-900 font-semibold">😰 High Stress Levels</p>
                    <p className="text-purple-800 text-sm mt-1">Elevated stress can affect skin healing. Consider relaxation techniques.</p>
                  </div>
                )}
                
                {summary.last24Hours.sleep.totalMinutes < 360 && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                    <p className="text-indigo-900 font-semibold">😴 Insufficient Sleep</p>
                    <p className="text-indigo-800 text-sm mt-1">You're getting less than 6 hours of sleep. Better sleep promotes skin recovery.</p>
                  </div>
                )}
                
                {summary.last24Hours.steps.total > 10000 && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-900 font-semibold">👟 Great Activity!</p>
                    <p className="text-green-800 text-sm mt-1">You've exceeded 10,000 steps! Regular activity supports healthy circulation.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Trends Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">📈 Health Trends</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPeriod('7d')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      period === '7d' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setPeriod('30d')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      period === '30d' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>
              
              {analytics.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No trend data available for this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Heart Rate</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Steps</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Temp (°C)</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Stress</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Sleep (hrs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((day: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="text-center py-3 px-4">{formatNumber(day.heartRate)}</td>
                          <td className="text-center py-3 px-4">{day.steps ? day.steps.toLocaleString() : 'N/A'}</td>
                          <td className="text-center py-3 px-4">{formatNumber(day.temperature, 1)}</td>
                          <td className="text-center py-3 px-4">{formatNumber(day.stressLevel)}</td>
                          <td className="text-center py-3 px-4">{day.sleepMinutes ? (day.sleepMinutes / 60).toFixed(1) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
