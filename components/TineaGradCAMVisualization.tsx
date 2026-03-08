'use client';

import { useState, useMemo } from 'react';

interface TineaGradCAMData {
  feature_index: number;
  feature_name: string;
  answer_value: number;
  gradcam_score: number;
  feature_importance: {
    base_weight: number;
    answer_contribution: number;
    alignment_score: number;
    normalized_importance: number;
  };
  alignment_score: number;
  explanation: string;
  heatmap_value: number;
}

interface TineaGradCAMVisualizationProps {
  doishaType: 'vata' | 'pitta' | 'kapha';
  gradcamData: TineaGradCAMData[];
  overallImportance: number;
  topFeatures?: TineaGradCAMData[];
}

const TineaGradCAMVisualization: React.FC<TineaGradCAMVisualizationProps> = ({
  doishaType,
  gradcamData,
  overallImportance,
  topFeatures,
}) => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'detailed' | 'bars'>('heatmap');

  const doishaColors = {
    vata: { bg: 'from-blue-500 to-cyan-500', light: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-500', gradient: 'to-blue-400' },
    pitta: { bg: 'from-orange-500 to-red-500', light: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-500', gradient: 'to-red-400' },
    kapha: { bg: 'from-green-500 to-emerald-500', light: 'bg-green-100', text: 'text-green-900', border: 'border-green-500', gradient: 'to-emerald-400' },
  };

  const getIntensityColor = (value: number): string => {
    if (value < 20) return 'from-slate-600 to-slate-500';
    if (value < 40) return 'from-blue-600 to-blue-400';
    if (value < 60) return 'from-purple-600 to-purple-400';
    if (value < 80) return 'from-orange-600 to-orange-400';
    return 'from-red-600 to-red-500';
  };

  const getTextColor = (value: number): string => {
    return value > 50 ? 'text-white' : 'text-gray-900';
  };

  const doishaEmoji = {
    vata: '💨',
    pitta: '🔥',
    kapha: '🌍',
  };

  const doishaDescriptions = {
    vata: 'Air & Space Element - Creative, Adaptable, Variable',
    pitta: 'Fire & Water Element - Ambitious, Focused, Intense',
    kapha: 'Earth & Water Element - Stable, Grounded, Nurturing',
  };

  const topFeaturesData = topFeatures || gradcamData.sort((a, b) => b.gradcam_score - a.gradcam_score).slice(0, 3);

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${doishaColors[doishaType].bg} rounded-lg p-8 text-white shadow-2xl`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl">{doishaEmoji[doishaType]}</div>
              <div>
                <h3 className="text-3xl font-bold capitalize">{doishaType} Doisha</h3>
                <p className="text-sm opacity-90">{doishaDescriptions[doishaType]}</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mt-4">
              🧠 CNN-based GradCAM analysis explaining your Tinea quiz result
            </p>
          </div>
          <div className="text-right min-w-fit">
            <div className="text-5xl font-bold">{Math.round(overallImportance)}%</div>
            <p className="text-sm opacity-75">Overall Confidence</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'heatmap'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            🔥 Heat Map
          </button>
          <button
            onClick={() => setViewMode('bars')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'bars'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            📊 Bar Chart
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'detailed'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            📋 Details
          </button>
        </div>
      </div>

      {/* Top Contributing Features */}
      <div className={`${doishaColors[doishaType].light} border-2 ${doishaColors[doishaType].border} rounded-xl p-6 shadow-lg`}>
        <h4 className={`text-lg font-bold ${doishaColors[doishaType].text} mb-4`}>🏆 Top Contributing Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topFeaturesData.map((feature, idx) => (
            <div
              key={feature.feature_index}
              className={`p-4 rounded-lg border-2 ${doishaColors[doishaType].border} bg-white/50 hover:bg-white/75 transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-3xl font-bold ${doishaColors[doishaType].text}`}>
                  {['🥇', '🥈', '🥉'][idx]}
                </span>
                <span className={`text-2xl font-bold ${doishaColors[doishaType].text}`}>
                  {feature.gradcam_score.toFixed(1)}%
                </span>
              </div>
              <p className={`font-semibold ${doishaColors[doishaType].text} capitalize mb-1`}>
                {feature.feature_name.replace(/_/g, ' ')}
              </p>
              <p className={`text-xs ${doishaColors[doishaType].text} opacity-75`}>
                Answer: {feature.answer_value === 0 ? 'Option A' : feature.answer_value === 1 ? 'Option B' : 'Option C'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Visualization Area */}
      {viewMode === 'heatmap' && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl space-y-6">
          <h4 className="text-white font-bold text-xl">🔥 Feature Importance Heatmap</h4>

          {/* Heatmap Grid */}
          <div className="space-y-4">
            {gradcamData.map((data) => (
              <div key={data.feature_index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold capitalize">
                    {data.feature_index + 1}. {data.feature_name.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-lg font-bold ${getTextColor(data.gradcam_score)}`}>
                    {data.gradcam_score.toFixed(1)}%
                  </span>
                </div>
                <div
                  className={`h-10 rounded-lg bg-gradient-to-r ${getIntensityColor(data.gradcam_score)} shadow-md cursor-pointer transition-all hover:h-12 overflow-hidden flex items-center justify-end pr-4`}
                  onClick={() => setExpandedFeature(data.feature_index)}
                >
                  {data.gradcam_score > 25 && (
                    <span className="text-white font-bold text-sm">{data.gradcam_score.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-white/70 text-sm">
              💡 Click on any bar to see detailed explanation
            </p>
          </div>
        </div>
      )}

      {viewMode === 'bars' && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl space-y-6">
          <h4 className="text-white font-bold text-xl">📊 Feature Importance Chart</h4>

          <div className="space-y-6">
            {gradcamData
              .sort((a, b) => b.gradcam_score - a.gradcam_score)
              .map((data) => (
                <div key={data.feature_index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold capitalize min-w-40">
                      {data.feature_name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-pink-300 font-bold">{data.gradcam_score.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-6 border border-white/20 overflow-hidden flex items-center">
                    <div
                      className={`h-6 rounded-full bg-gradient-to-r ${getIntensityColor(data.gradcam_score)} flex items-center justify-end pr-3 transition-all duration-500`}
                      style={{ width: `${data.gradcam_score}%` }}
                    >
                      {data.gradcam_score > 30 && (
                        <span className="text-white font-bold text-xs">{data.gradcam_score.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="space-y-4">
          {gradcamData.map((data) => (
            <div
              key={data.feature_index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl hover:border-white/40 transition-all cursor-pointer"
              onClick={() =>
                setExpandedFeature(
                  expandedFeature === data.feature_index ? null : data.feature_index
                )
              }
            >
              {/* Feature Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h5 className="text-white font-bold text-lg capitalize">
                    {data.feature_index + 1}. {data.feature_name.replace(/_/g, ' ')}
                  </h5>
                  <p className="text-white/60 text-sm mt-1">
                    Answer: {data.answer_value === 0 ? 'Option A' : data.answer_value === 1 ? 'Option B' : 'Option C'}
                  </p>
                </div>
                <div className={`h-20 w-20 rounded-lg bg-gradient-to-br ${getIntensityColor(data.gradcam_score)} flex flex-col items-center justify-center`}>
                  <span className="text-white font-bold text-2xl">{data.gradcam_score.toFixed(0)}</span>
                  <span className="text-white text-xs">%</span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedFeature === data.feature_index && (
                <div className="mt-6 pt-6 border-t border-white/20 space-y-4 animate-fadeIn">
                  {/* Explanation */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/90 leading-relaxed">{data.explanation}</p>
                  </div>

                  {/* Feature Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Base Weight</p>
                      <p className="text-white font-bold text-lg">
                        {data.feature_importance.base_weight.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Alignment Score</p>
                      <p className="text-white font-bold text-lg">
                        {data.feature_importance.alignment_score.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Answer Contribution</p>
                      <p className="text-white font-bold text-lg">
                        {data.feature_importance.answer_contribution.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Final Importance</p>
                      <p className="text-white font-bold text-lg">
                        {data.feature_importance.normalized_importance.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Insights */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
        <h5 className="text-white font-bold mb-4">💡 Key Insights</h5>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-white/90">
            <span className="text-lg">✨</span>
            <span>
              Your <strong>top 3 features</strong> ({topFeaturesData.map(f => f.feature_name.replace(/_/g, ' ')).join(', ')}) most
              strongly indicate {doishaType} characteristics
            </span>
          </li>
          <li className="flex items-start gap-3 text-white/90">
            <span className="text-lg">📈</span>
            <span>
              Overall confidence of <strong>{overallImportance.toFixed(0)}%</strong> suggests a{' '}
              {overallImportance > 70 ? 'clear and distinct' : overallImportance > 50 ? 'moderate' : 'balanced'} {doishaType}{' '}
              constitution
            </span>
          </li>
          <li className="flex items-start gap-3 text-white/90">
            <span className="text-lg">🎯</span>
            <span>
              This CNN-GradCAM analysis examined all 6 features to determine your dominant doisha type with explainability
            </span>
          </li>
        </ul>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; height: 0; }
          to { opacity: 1; height: auto; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default TineaGradCAMVisualization;
