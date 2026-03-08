"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wind, Droplets, AlertCircle, TrendingUp, Shield, Zap, Lightbulb, BarChart3, Brain } from "lucide-react";
import { generatePsoriasisRiskReport, downloadReportAsPDF, type PsoriasisRiskReportData } from "@/utils/reportGenerator";

interface RiskFactor {
  label: string;
  value: number;
  impact: string;
  explanation: string;
  recommendation: string;
}

interface RiskAnalysis {
  score: number;
  level: "Low" | "Moderate" | "High" | "Very High";
  color: string;
  factors: RiskFactor[];
  suggestions: string[];
  trend: string;
  explainableInsights: {
    topRisks: string[];
    protectiveFactors: string[];
    holisticAssessment: string;
  };
}

interface ApiResponse {
  success: boolean;
  location: string;
  weather: {
    temperature: number;
    humidity: number;
    feelsLike: number;
    windSpeed: number;
    condition: string;
    temperatureTrend: string;
  };
  riskAnalysis: RiskAnalysis;
}

interface GradCAMData {
  risk_score: number;
  grad_cam_heatmap: number[];
  factor_importance: Record<string, number>;
  feature_values: Record<string, number>;
  color_map: Record<string, string>;
}

export default function PsoriasisRiskAnalysis() {
  const [weatherData, setWeatherData] = useState<ApiResponse['weather'] | null>(null);
  const [location, setLocation] = useState<string>("");
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);
  const [gradcamData, setGradcamData] = useState<GradCAMData | null>(null);
  const [gradcamLoading, setGradcamLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Fetch weather data from backend API
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/psoriasis/weather-risk?latitude=${latitude}&longitude=${longitude}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data: ApiResponse = await response.json();
      setWeatherData(data.weather);
      setLocation(data.location);
      setRiskAnalysis({
        score: data.riskAnalysis.score,
        level: data.riskAnalysis.level,
        color: getColorGradient(data.riskAnalysis.level),
        factors: data.riskAnalysis.factors,
        suggestions: data.riskAnalysis.suggestions,
        trend: data.riskAnalysis.explainableInsights ? 
          `${data.weather.temperatureTrend} - ${data.riskAnalysis.trend}` : 
          data.riskAnalysis.trend,
        explainableInsights: data.riskAnalysis.explainableInsights,
      });
      setLastUpdate(new Date());
      setError(null);
      
      // Fetch Grad-CAM explanation
      fetchGradCAMExplanation(data.weather);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError("Unable to fetch weather data. Please check your location permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Grad-CAM explanation for neural network interpretability
  const fetchGradCAMExplanation = async (weather: ApiResponse['weather']) => {
    try {
      setGradcamLoading(true);
      const response = await fetch('http://localhost:4000/api/psoriasis/grad-cam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: weather.temperature,
          humidity: weather.humidity,
          trend_value: weather.temperatureTrend === 'warming' ? 1 : 
                       weather.temperatureTrend === 'cooling' ? -1 : 0,
          wind_speed: weather.windSpeed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Grad-CAM explanation');
      }

      const data = await response.json();
      setGradcamData(data.gradcamExplanation);
    } catch (err) {
      console.error('Error fetching Grad-CAM:', err);
      // Grad-CAM is optional, don't set error state
    } finally {
      setGradcamLoading(false);
    }
  };

  // Helper function to get color gradient based on risk level
  const getColorGradient = (level: string): string => {
    switch (level) {
      case 'Very High':
        return 'from-red-600 to-red-500';
      case 'High':
        return 'from-orange-600 to-orange-500';
      case 'Moderate':
        return 'from-yellow-600 to-yellow-500';
      default:
        return 'from-green-600 to-green-500';
    }
  };

  // Grad-CAM: Calculate activation intensity for each factor (0-1 scale)
  const calculateGradCAMActivation = (factors: RiskFactor[]): Record<string, number> => {
    const maxValue = Math.max(...factors.map(f => f.value), 1);
    const activations: Record<string, number> = {};
    
    factors.forEach(factor => {
      // Normalize factor value to 0-1 scale
      activations[factor.label] = factor.value / maxValue;
    });
    
    return activations;
  };

  // Get RGB color from heatmap based on ACTUAL RISK POINTS (not relative ranking)
  // 0-10 pts = Blue (safe) | 10-20 pts = Green (low) | 20-35 pts = Yellow (moderate) | 35+ pts = Red (critical)
  const getHeatmapColor = (points: number): string => {
    if (points < 10) return '#3b82f6'; // Blue - minimal risk
    if (points < 20) return '#10b981'; // Green - low risk
    if (points < 35) return '#fbbf24'; // Yellow - moderate risk
    return '#ef4444'; // Red - high/critical risk
  };

  const handleGenerateReport = async () => {
    if (!riskAnalysis || !weatherData) {
      alert("Please wait for data to load first");
      return;
    }

    try {
      setGeneratingReport(true);
      const reportData: PsoriasisRiskReportData = {
        timestamp: new Date().toLocaleString(),
        location,
        riskScore: riskAnalysis.score,
        riskLevel: riskAnalysis.level,
        weatherData: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          feelsLike: weatherData.feelsLike,
          windSpeed: weatherData.windSpeed,
          condition: weatherData.condition,
        },
        riskFactors: riskAnalysis.factors,
        suggestions: riskAnalysis.suggestions,
        explainableInsights: riskAnalysis.explainableInsights,
      };

      const htmlContent = generatePsoriasisRiskReport(reportData);
      await downloadReportAsPDF(
        htmlContent,
        `Psoriasis_Risk_Report_${new Date().getTime()}.pdf`
      );

      alert("✅ Report generated and downloaded successfully!");
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Get user location and fetch weather
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          // Default to London if location access denied
          fetchWeatherData(51.5074, -0.1278);
        }
      );
    }
  }, []);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
          }
        );
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/psoriasis"
          className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-8 transition-colors"
        >
          ← Back to Psoriasis
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">�️</div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Psoriasis Risk Analysis
              </h1>
              <p className="text-gray-600 mt-2">Real-time environmental impact assessment with explainable AI</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-700 font-semibold">Fetching real-time weather data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-800 text-lg">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {weatherData && riskAnalysis && !loading && (
          <>
            {/* Current Weather Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Current Environmental Conditions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Location */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 text-sm font-semibold mb-2">Location</p>
                  <p className="text-2xl font-bold text-blue-900">{location}</p>
                </div>

                {/* Temperature */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">🌡️</div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Temperature</p>
                  <p className="text-3xl font-bold text-orange-900">{weatherData.temperature}°C</p>
                  <p className="text-xs text-orange-700 mt-2">Feels like {weatherData.feelsLike}°C</p>
                </div>

                {/* Humidity */}
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl p-6 text-center">
                  <Droplets className="mx-auto mb-2 text-cyan-600" size={32} />
                  <p className="text-gray-600 text-sm font-semibold mb-2">Humidity</p>
                  <p className="text-3xl font-bold text-cyan-900">{weatherData.humidity}%</p>
                </div>

                {/* Wind & Trend */}
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl p-6 text-center">
                  <Wind className="mx-auto mb-2 text-indigo-600" size={32} />
                  <p className="text-gray-600 text-sm font-semibold mb-2">Wind Speed</p>
                  <p className="text-3xl font-bold text-indigo-900">{weatherData.windSpeed} km/h</p>
                  <p className="text-xs text-indigo-700 mt-2">{weatherData.temperatureTrend}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-6 text-center">Last updated: {lastUpdate.toLocaleTimeString()} | Data from Open-Meteo API</p>
            </div>

            {/* Risk Score Card */}
            <div className={`bg-gradient-to-r ${riskAnalysis.color} rounded-3xl p-12 shadow-2xl mb-8 text-white`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Overall Risk Assessment</h2>
                  <p className="text-white/90">Based on current environmental conditions</p>
                </div>
                <Shield size={48} className="flex-shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Risk Score */}
                <div>
                  <div className="text-7xl font-bold mb-2">{riskAnalysis.score.toFixed(2)}</div>
                  <div className="text-xl font-semibold mb-4">Risk Score / 100</div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-lg">
                    {riskAnalysis.level} Risk
                  </div>
                </div>

                {/* Holistic Assessment */}
                <div className="flex flex-col justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                    <p className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Lightbulb size={20} />
                      AI Insight:
                    </p>
                    <p className="text-white/95 leading-relaxed">
                      {riskAnalysis.explainableInsights.holisticAssessment}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Gauge - Visual Risk Level */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-amber-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="text-amber-600" />
                Risk Level Gauge
              </h3>
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Circular Gauge */}
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* Background arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Risk arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={
                        riskAnalysis.score > 75
                          ? '#ef4444'
                          : riskAnalysis.score > 50
                          ? '#f97316'
                          : riskAnalysis.score > 25
                          ? '#eab308'
                          : '#22c55e'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(riskAnalysis.score / 100) * 565} 565`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">
                        {riskAnalysis.score.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">/ 100</div>
                    </div>
                  </div>
                </div>

                {/* Gauge Scale */}
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-600 mb-2 font-semibold">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Critical</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full"></div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>0</span>
                    <span>33</span>
                    <span>67</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL Grad-CAM: Neural Network Visualization */}
            {gradcamData && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl mb-8 border-2 border-cyan-500 text-white">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Brain className="text-cyan-400" />
                  Real Grad-CAM: Neural Network Explanation
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  🧠 Gradient-weighted Class Activation Mapping shows which weather factors the CNN model focuses on most.
                  Brighter colors = Strong model focus | Darker colors = Low attention
                </p>
                
                {/* Grad-CAM Heatmap Visualization */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {Object.entries(gradcamData.factor_importance).map(([factor, importance]) => {
                    const color = gradcamData.color_map?.[factor] || '#3b82f6';
                    const heatmapValue = gradcamData.grad_cam_heatmap[
                      Object.keys(gradcamData.factor_importance).indexOf(factor)
                    ] || 0;
                    
                    return (
                      <div key={factor} className="group">
                        <div
                          className="w-full aspect-square rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer relative overflow-hidden flex items-center justify-center border-2 flex-col justify-between p-4"
                          style={{
                            backgroundColor: color,
                            borderColor: color,
                            opacity: 0.7 + (importance * 0.3),
                          }}
                        >
                          <div className="text-center z-10">
                            <div className="text-xs font-bold text-white/90 mb-1 uppercase tracking-wider">
                              {factor}
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                              {(importance * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-white/80">
                              Gradient: {(heatmapValue * 100).toFixed(1)}
                            </div>
                          </div>

                          {/* Animated gradient overlay */}
                          <div
                            className="absolute inset-0 opacity-20 animate-pulse"
                            style={{
                              background: `radial-gradient(circle, ${color}, transparent)`,
                            }}
                          ></div>
                        </div>
                        
                        <div className="mt-2 text-center text-xs text-gray-400">
                          {importance > 0.5 ? '🔴 High Impact' : importance > 0.25 ? '🟡 Medium' : '🟢 Low Impact'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grad-CAM Explanation */}
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 mb-6">
                  <p className="text-sm text-cyan-100">
                    📊 <span className="font-semibold">How to read this:</span> The neural network has learned which weather factors are most important for psoriasis risk prediction. Color intensity and percentage show the model's activation gradient for each factor. This is computed via backpropagation through the CNN.
                  </p>
                </div>

                {/* Feature Importance Bar Chart */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">Factor Importance (Gradient-based)</h4>
                  {Object.entries(gradcamData.factor_importance).map(([factor, importance]) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{factor}</span>
                        <span className="text-cyan-300">{(importance * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600">
                        <div
                          className="h-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(importance * 100, 100)}%`,
                          }}
                        >
                          <div className="h-full bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gradcamLoading && (
              <div className="bg-slate-900 rounded-3xl p-8 text-center mb-8 border-2 border-cyan-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
                <p className="text-white">Computing Grad-CAM neural network explanation...</p>
              </div>
            )}

            {/* Grad-CAM: Visual Feature Impact Map */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl mb-8 border-2 border-cyan-500 text-white">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Brain className="text-cyan-400" />
                Risk Factor Impact Map
              </h3>
              <p className="text-gray-300 text-sm mb-6">Shows how strongly each factor is affecting your psoriasis risk - Red/Orange = Strong Effect | Blue/Green = No Effect</p>
              
              {/* Grad-CAM Heatmap Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {riskAnalysis && riskAnalysis.factors.filter(f => f.label !== 'Wind Speed').map((factor, idx) => {
                  const color = getHeatmapColor(factor.value);
                  const activations = calculateGradCAMActivation(riskAnalysis.factors);
                  const activation = activations[factor.label] || 0;

                  // Get actual weather value based on factor label
                  let displayValue = '';
                  if (factor.label === 'Temperature') {
                    displayValue = `${weatherData?.temperature}°C`;
                  } else if (factor.label === 'Humidity') {
                    displayValue = `${weatherData?.humidity}%`;
                  } else if (factor.label === 'Temperature Trend') {
                    displayValue = weatherData?.temperatureTrend === 'warming' ? '📈 Warming' : 
                                   weatherData?.temperatureTrend === 'cooling' ? '📉 Cooling' : '➡️ Stable';
                  }

                  return (
                    <div key={idx} className="group">
                      <div
                        className="w-full aspect-square rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer relative overflow-hidden flex items-center justify-center border-2"
                        style={{
                          backgroundColor: color,
                          borderColor: color,
                          opacity: 0.8 + activation * 0.2,
                        }}
                      >
                        <div className="text-center z-10">
                          <div className="text-sm font-bold text-white/90 mb-1">{factor.label}</div>
                          <div className="text-2xl font-bold text-white">{displayValue}</div>
                          <div className="text-xs text-white/70 mt-1">{factor.value} pts risk</div>
                        </div>

                        {/* Animated gradient overlay */}
                        <div
                          className="absolute inset-0 opacity-30 animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${color}, transparent)`,
                          }}
                        ></div>
                      </div>
                      
                      <div className="mt-2 text-center text-xs text-gray-400">
                        {factor.impact}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="p-4 bg-slate-700/50 rounded-2xl border border-slate-600">
                <p className="text-xs font-semibold text-gray-300 mb-3">Risk Level Color Guide:</p>
                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg" style={{backgroundColor: '#3b82f6'}}></div>
                    <span>0-10 pts = Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg" style={{backgroundColor: '#10b981'}}></div>
                    <span>10-20 pts = Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg" style={{backgroundColor: '#fbbf24'}}></div>
                    <span>20-35 pts = Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg" style={{backgroundColor: '#ef4444'}}></div>
                    <span>35+ pts = High Risk</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  ✅ Blue/Green tiles = Good for you | 🟠🔴 Orange/Red tiles = Be careful with this factor
                </p>
              </div>
            </div>

            {/* Grad-CAM: Factor Sensitivity Analysis */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-indigo-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="text-indigo-600" />
                Risk Factor Impact Strength
              </h3>
              
              <div className="space-y-6">
                {riskAnalysis && riskAnalysis.factors.filter(f => f.label !== 'Wind Speed').map((factor, idx) => {
                  const color = getHeatmapColor(factor.value);
                  const activations = calculateGradCAMActivation(riskAnalysis.factors);
                  const activation = activations[factor.label] || 0;
                  
                  // Get actual weather value based on factor label
                  let displayValue = '';
                  if (factor.label === 'Temperature') {
                    displayValue = `${weatherData?.temperature}°C`;
                  } else if (factor.label === 'Humidity') {
                    displayValue = `${weatherData?.humidity}%`;
                  } else if (factor.label === 'Temperature Trend') {
                    displayValue = weatherData?.temperatureTrend === 'warming' ? 'Warming' : 
                                   weatherData?.temperatureTrend === 'cooling' ? 'Cooling' : 'Stable';
                  }
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{factor.label}</p>
                          <p className="text-xs text-gray-600">📍 Actual: {displayValue} | Risk: {factor.value} pts | {factor.impact}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{color}}>
                            {factor.value} pts
                          </p>
                          <p className="text-xs text-gray-600">Risk Points</p>
                        </div>
                      </div>

                      {/* Risk Points Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 relative"
                          style={{
                            width: `${Math.min((factor.value / 50) * 100, 100)}%`,
                            background: `linear-gradient(90deg, #3b82f6, ${color})`,
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Impact Explanation */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        💡 <span className="font-semibold">Why it matters:</span> {factor.explanation.substring(0, 120)}...
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-xs text-gray-700">
                  📊 <span className="font-semibold">How to Read This:</span> Each bar shows how much that factor is contributing to your total risk. A long bar (high %) = that factor is greatly affecting you. A short bar (low %) = that factor is not a concern. Focus protective measures on the longest bars!
                </p>
              </div>
            </div>



            {/* Key Insights - Explainable AI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Top Risks */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-red-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-red-500" />
                  Top Risk Factors
                </h3>
                {riskAnalysis.explainableInsights.topRisks.length > 0 ? (
                  <ul className="space-y-3">
                    {riskAnalysis.explainableInsights.topRisks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <span className="text-red-600 font-bold">⚠️</span>
                        <span className="text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No significant risk factors detected.</p>
                )}
              </div>

              {/* Protective Factors */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="text-green-500" />
                  Protective Factors
                </h3>
                {riskAnalysis.explainableInsights.protectiveFactors.length > 0 ? (
                  <ul className="space-y-3">
                    {riskAnalysis.explainableInsights.protectiveFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Monitor current conditions.</p>
                )}
              </div>
            </div>

            {/* Risk Factors - Detailed Explainable Analysis */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="text-purple-600" />
                Detailed Factor Analysis
              </h2>
              <div className="space-y-4">
                {riskAnalysis.factors.map((factor, idx) => (
                  <div key={idx}>
                    {/* Collapsible Factor Card */}
                    <button
                      onClick={() => setExpandedFactor(expandedFactor === idx ? null : idx)}
                      className="w-full text-left p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{factor.label}</h3>
                            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                              factor.impact === 'Critical' ? 'bg-red-200 text-red-900' :
                              factor.impact === 'High Risk' ? 'bg-orange-200 text-orange-900' :
                              factor.impact === 'Moderate' ? 'bg-yellow-200 text-yellow-900' :
                              factor.impact === 'Increased' ? 'bg-yellow-100 text-yellow-900' :
                              'bg-green-200 text-green-900'
                            }`}>
                              {factor.impact}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                factor.value > 30 ? 'bg-red-500' :
                                factor.value > 15 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(factor.value, 45)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-4 text-2xl transition-transform" style={{
                          transform: expandedFactor === idx ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedFactor === idx && (
                      <div className="mt-2 p-5 bg-white rounded-2xl border-2 border-purple-100 animate-fadeIn">
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <Lightbulb size={18} className="text-amber-500" />
                              Why This Matters:
                            </p>
                            <p className="text-gray-700 leading-relaxed">{factor.explanation}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">💡 Recommendation:</p>
                            <p className="text-gray-700 leading-relaxed">{factor.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="text-green-600" />
                Personalized Action Plan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {riskAnalysis.factors.flatMap((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl f
                    
                    lex-shrink-0">{factor.recommendation.split(" ")[0]}</span>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {factor.recommendation.substring(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Info & Medical Disclaimer */}
            <div className="bg-yellow-50 rounded-3xl p-8 shadow-lg border-2 border-yellow-300 mb-8 mt-12">
              <p className="text-sm text-yellow-900 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚕️</span>
                <span>
                  <span className="font-bold">Medical Disclaimer:</span> This AI risk analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified dermatologist for diagnosis, treatment, and medical decisions. Model limitations: environmental factors only, not personalized to individual history.
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin">⚙️</span>
                    Generating...
                  </span>
                ) : (
                  "📄 Generate Report"
                )}
              </button>
              <Link
                href="/psoriasis/upload"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
              >
                🔍 AI Detection
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
