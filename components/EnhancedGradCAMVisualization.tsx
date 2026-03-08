'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface GradCAMData {
  questionId: number;
  question: string;
  selectedAnswer: string;
  gradcamScore: number;
  featureImportance: {
    [key: string]: number;
  };
  explanation: string;
}

interface EnhancedGradCAMVisualizationProps {
  doshaType: 'vata' | 'pitta' | 'kapha';
  gradcamData: GradCAMData[];
  totalScore: number;
}

interface HeatmapData {
  region: string;
  importance: number;
  description: string;
}

const EnhancedGradCAMVisualization: React.FC<EnhancedGradCAMVisualizationProps> = ({
  doshaType,
  gradcamData,
  totalScore,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'detailed' | 'tree'>('heatmap');
  const [selectedQIndex, setSelectedQIndex] = useState<number>(0);

  const doshaColors = {
    vata: { bg: 'from-blue-500 to-cyan-500', light: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-500' },
    pitta: { bg: 'from-orange-500 to-red-500', light: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-500' },
    kapha: { bg: 'from-green-500 to-emerald-500', light: 'bg-green-100', text: 'text-green-900', border: 'border-green-500' },
  };

  // Calculate normalized importance scores
  const normalizedImportance = useMemo(() => {
    return gradcamData.map((data) => {
      const values = Object.values(data.featureImportance);
      const maxScore = Math.max(...values);
      const normalized = Object.entries(data.featureImportance).reduce(
        (acc, [key, value]) => {
          acc[key] = maxScore > 0 ? (value / maxScore) * 100 : 0;
          return acc;
        },
        {} as Record<string, number>
      );
      return { ...data, normalizedImportance: normalized };
    });
  }, [gradcamData]);

  const currentData = normalizedImportance[selectedQIndex];

  const getIntensityColor = (value: number): string => {
    if (value < 20) return 'from-blue-900 to-blue-700';
    if (value < 40) return 'from-blue-700 to-blue-500';
    if (value < 60) return 'from-purple-500 to-pink-500';
    if (value < 80) return 'from-pink-500 to-red-500';
    return 'from-red-600 to-red-500';
  };

  const getTextColor = (value: number): string => {
    return value > 50 ? 'text-white' : 'text-gray-900';
  };

  // Helper function to get importance score for navigation
  const getQScore = (index: number) => {
    const avgImportance = Object.values(normalizedImportance[index].normalizedImportance).reduce((a, b) => a + b, 0) / 
      Object.keys(normalizedImportance[index].normalizedImportance).length;
    return Math.round(avgImportance);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${doshaColors[doshaType].bg} rounded-lg p-8 text-white shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-3xl font-bold mb-2">🧠 AI Decision Explanation</h3>
            <p className="text-sm opacity-90">
              GradCAM analysis showing which answers most influenced your {doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} dosha identification
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{Math.round(totalScore)}%</div>
            <p className="text-sm opacity-75">Overall Confidence</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'heatmap'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            🔥 Heat Map View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'detailed'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            📊 Detailed Analysis
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'tree'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            🌳 Decision Tree
          </button>
        </div>
      </div>

      {/* Question Navigator */}
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg`}>
        <h4 className="text-white font-semibold mb-4">Question Navigation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {normalizedImportance.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedQIndex(idx)}
              className={`p-3 rounded-lg font-bold transition-all ${
                selectedQIndex === idx
                  ? `bg-gradient-to-r ${doshaColors[doshaType].bg} text-white shadow-lg`
                  : `bg-white/10 text-white hover:bg-white/20`
              }`}
            >
              <div className="text-lg">Q{idx + 1}</div>
              <div className="text-xs opacity-75">{getQScore(idx)}%</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {currentData && (
        <>
          {/* Question Context */}
          <div className={`${doshaColors[doshaType].light} border-2 ${doshaColors[doshaType].border} rounded-xl p-6 shadow-lg`}>
            <div className="space-y-2">
              <p className={`text-sm font-semibold ${doshaColors[doshaType].text}`}>Question {currentData.questionId}</p>
              <h4 className={`text-lg font-bold ${doshaColors[doshaType].text}`}>{currentData.question}</h4>
              <p className={`text-base ${doshaColors[doshaType].text} opacity-90`}>
                <span className="font-semibold">Your answer:</span> {currentData.selectedAnswer}
              </p>
            </div>
          </div>

          {viewMode === 'heatmap' && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl space-y-6">
              <h4 className="text-white font-bold text-xl">Feature Importance Heatmap</h4>

              {/* Visual Heatmap */}
              <div className="space-y-4">
                {Object.entries(currentData.normalizedImportance)
                  .sort(([, a], [, b]) => b - a)
                  .map(([feature, importance]) => (
                    <div key={feature} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-lg font-bold ${getTextColor(importance)}`}>
                          {importance.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`h-8 rounded-lg bg-gradient-to-r ${getIntensityColor(importance)} shadow-md overflow-hidden`}>
                        <div
                          className="h-full bg-white/20 flex items-center justify-end pr-3"
                          style={{ width: `${importance}%` }}
                        >
                          {importance > 30 && (
                            <span className="text-white font-bold text-xs">{(importance).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Score Gauge */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">Question Impact Score</span>
                  <span className="text-2xl font-bold text-pink-300">{currentData.gradcamScore.toFixed(1)}/100</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 border border-white/20 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r ${doshaColors[doshaType].bg}`}
                    style={{ width: `${Math.min(100, currentData.gradcamScore)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl space-y-6">
              <h4 className="text-white font-bold text-xl">📋 Detailed Analysis</h4>

              {/* Explanation */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="text-white/90 leading-relaxed">{currentData.explanation}</p>
              </div>

              {/* Feature Breakdown */}
              <div className="space-y-3">
                <h5 className="text-white font-bold">Feature Contribution Breakdown</h5>
                {Object.entries(currentData.normalizedImportance)
                  .sort(([, a], [, b]) => b - a)
                  .map(([feature, importance]) => (
                    <div
                      key={feature}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold capitalize">{feature.replace(/_/g, ' ')}</span>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {importance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getIntensityColor(importance)}`}
                          style={{ width: `${importance}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {viewMode === 'tree' && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl">
              <h4 className="text-white font-bold text-xl mb-6">🌳 Decision Path Visualization</h4>

              <div className="space-y-4">
                {/* Root Node */}
                <div className="text-center mb-6">
                  <div className={`inline-block bg-gradient-to-r ${doshaColors[doshaType].bg} text-white px-6 py-3 rounded-lg font-bold`}>
                    Question {currentData.questionId}
                  </div>
                </div>

                {/* Left Arrow */}
                <div className="flex justify-center text-white opacity-50 text-2xl">↓</div>

                {/* Branch for Top Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {Object.entries(currentData.normalizedImportance)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 2)
                    .map(([feature, importance], idx) => (
                      <div
                        key={feature}
                        className={`p-4 rounded-lg border-2 ${doshaColors[doshaType].border} ${doshaColors[doshaType].light}`}
                      >
                        <div className="text-center">
                          <p className={`font-bold text-lg ${doshaColors[doshaType].text}`}>{feature.replace(/_/g, ' ')}</p>
                          <p className={`text-2xl font-bold ${doshaColors[doshaType].text} mt-2`}>{importance.toFixed(1)}%</p>
                          <div className="mt-3 flex items-center justify-center">
                            <div className="w-12 h-1 bg-gradient-to-r from-white/0 to-white/40"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Bottom Summary */}
                <div className="mt-8 pt-6 border-t border-white/20 text-center">
                  <p className="text-white/70 text-sm mb-3">Combined Impact Score</p>
                  <div className="text-4xl font-bold text-white">{currentData.gradcamScore.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Insights */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <h5 className="text-white font-bold mb-4">💡 Key Insights</h5>
            <ul className="space-y-2">
              {Object.entries(currentData.normalizedImportance)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([feature, importance], idx) => (
                  <li key={feature} className="flex items-start gap-3 text-white/90">
                    <span className="text-lg">{['🥇', '🥈', '🥉'][idx]}</span>
                    <span>
                      <strong>{feature.replace(/_/g, ' ')}</strong> was the most influential factor ({importance.toFixed(1)}%)
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedGradCAMVisualization;
