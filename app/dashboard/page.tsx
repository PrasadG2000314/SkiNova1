"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'scans' | 'appointments'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Welcome back! Manage your health records and skin detection scans</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'scans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Skin Scans
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Appointments
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 font-semibold text-sm">Total Scans</p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-gray-600 font-semibold text-sm">Last Updated</p>
                <p className="text-lg text-gray-900 font-semibold">Dec 28, 2025</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-medical-500">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600 font-semibold text-sm">Health Score</p>
                <p className="text-3xl font-bold text-green-600">92%</p>
              </div>
            </div>

            {/* Featured Detection Cards */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Skin Detection Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tinea Detection Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-5xl mb-3">🦠</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Tinea Detection</h3>
                      <p className="text-gray-700 mb-4">AI-powered fungal infection detection using advanced machine learning</p>
                    </div>
                  </div>

                  {/* Detection Types */}
                  <div className="bg-white/60 rounded-lg p-4 mb-6">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Detects</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-medical-600">✓</span>
                        <span className="text-gray-700">Tinea Corporis</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-medical-600">✓</span>
                        <span className="text-gray-700">Tinea Pedis</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-medical-600">✓</span>
                        <span className="text-gray-700">Tinea Cruris</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-medical-600">✓</span>
                        <span className="text-gray-700">Tinea Capitis</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white/60 rounded-lg p-4 mb-6">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Features</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✅ Instant analysis - results in seconds</li>
                      <li>✅ Confidence scoring - know how accurate</li>
                      <li>✅ Severity assessment - understand severity</li>
                      <li>✅ Expert recommendations - treatment guidance</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      href="/tinea/detect"
                      className="w-full inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold text-center rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      🚀 Start Tinea Scan
                    </Link>
                    <Link
                      href="/tinea"
                      className="w-full inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-center rounded-xl transition-all text-sm"
                    >
                      📚 Learn More
                    </Link>
                  </div>
                </div>

                {/* Leprosy Detection Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-5xl mb-3">🔬</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Leprosy Detection</h3>
                      <p className="text-gray-700 mb-4">Advanced skin lesion classification for early leprosy detection</p>
                    </div>
                  </div>

                  {/* Detection Types */}
                  <div className="bg-white/60 rounded-lg p-4 mb-6">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Detects</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">✓</span>
                        <span className="text-gray-700">Tuberculoid</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">✓</span>
                        <span className="text-gray-700">Lepromatous</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">✓</span>
                        <span className="text-gray-700">Borderline</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">✓</span>
                        <span className="text-gray-700">Indeterminate</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white/60 rounded-lg p-4 mb-6">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Features</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✅ Early detection support</li>
                      <li>✅ Classification accuracy</li>
                      <li>✅ Medical-grade analysis</li>
                      <li>✅ Professional recommendations</li>
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/leprosy"
                    className="w-full inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-center rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    🚀 Start Leprosy Scan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scans Tab */}
        {activeTab === 'scans' && (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Recent Scans</h2>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No scans yet</p>
              <p className="text-gray-400 mb-6">Start by running a Tinea or Leprosy detection scan</p>
              <Link
                href="/tinea"
                className="inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
              >
                Begin Scan
              </Link>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Appointments</h2>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No appointments scheduled</p>
              <p className="text-gray-400 mb-6">Book a consultation with a healthcare professional</p>
              <Link
                href="/appointments"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
