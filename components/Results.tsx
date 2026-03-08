"use client";

import { useState, useEffect } from "react";

interface Prediction {
  className: string;
  probability: number;
}

interface ResultsProps {
  predictions: Prediction[];
}

export default function Results({ predictions }: ResultsProps) {
  const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
  const topPrediction = sortedPredictions[0];
  const confidence = topPrediction.probability * 100;
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  // Determine if this is a Melanoma result
  const isMelanoma = topPrediction.className.toLowerCase().includes('melanoma');
  
  // Color configuration based on result type
  const colorConfig = isMelanoma ? {
    cardGradient: 'linear-gradient(to bottom right, #dc2626, #991b1b)',
    resultGradient: 'linear-gradient(to right, #fee2e2, #fef2f2, #fee2e2)',
    progressGradient: 'linear-gradient(to right, #dc2626, #ef4444, #dc2626)',
    shadowColor: 'rgba(220, 38, 38, 0.5)',
    borderColor: '#fca5a5',
    hoverBorderColor: '#f87171',
    textColor: '#7f1d1d',
    icon: '⚠️'
  } : {
    cardGradient: 'linear-gradient(to bottom right, #9333ea, #a855f7, #4f46e5)',
    resultGradient: 'linear-gradient(to right, #f3e8ff, #faf5ff, #e0e7ff)',
    progressGradient: 'linear-gradient(to right, #9333ea, #a855f7, #4f46e5)',
    shadowColor: 'rgba(147, 51, 234, 0.5)',
    borderColor: '#d8b4fe',
    hoverBorderColor: '#e9d5ff',
    textColor: '#581c87',
    icon: '⭐'
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const increment = confidence / 50;
    let current = 0;
    
    interval = setInterval(() => {
      current += increment;
      if (current >= confidence) {
        setAnimatedConfidence(confidence);
        clearInterval(interval);
      } else {
        setAnimatedConfidence(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [confidence]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Result - Creative Card */}
      <div 
        className="relative overflow-hidden rounded-3xl p-8 shadow-2xl group"
        style={{ background: colorConfig.cardGradient }}
      >
        {/* Background animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="relative z-10 text-white">
          <p className="text-sm font-semibold opacity-90 mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span> Classification Result
          </p>
          
          <h2 className="text-5xl font-black mb-6 group-hover:scale-105 transition-transform duration-300">
            {topPrediction.className}
          </h2>

          <div className="flex items-end gap-3 mb-6">
            <div className="text-6xl font-black tracking-tighter">
              {animatedConfidence.toFixed(1)}
            </div>
            <div className="mb-2">
              <div className="text-lg font-bold opacity-90">%</div>
              <div className="text-xs font-semibold opacity-75">Confidence</div>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full rounded-full transition-all duration-700 shadow-lg"
              style={{ 
                width: `${animatedConfidence}%`,
                background: colorConfig.progressGradient,
                boxShadow: `0 0 10px ${colorConfig.shadowColor}`
              }}
            ></div>
          </div>
        </div>

        {/* Border glow effect */}
        <div 
          className="absolute inset-0 rounded-3xl border-2 transition-colors group-hover:border-opacity-100"
          style={{ borderColor: colorConfig.borderColor }}
        ></div>
      </div>

      {/* All Results - Creative Grid */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-6">
          <span className="text-3xl">{colorConfig.icon}</span> Detailed Analysis
        </h3>

        {sortedPredictions.map((pred, idx) => {
          const percentage = pred.probability * 100;
          const isTopResult = idx === 0;
          
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                isTopResult
                  ? "scale-100 mb-2"
                  : "hover:scale-105"
              }`}
              style={{
                animation: `slideInLeft 0.5s ease-out ${idx * 0.1}s both`
              }}
            >
              {/* Card background */}
              <div 
                className="absolute inset-0 transition-all duration-300"
                style={{
                  background: isTopResult 
                    ? colorConfig.resultGradient 
                    : 'linear-gradient(to right, #f9fafb, #f1f5f9)'
                }}
              ></div>

              {/* Content */}
              <div className="relative p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${isTopResult ? "scale-125" : ""} transition-transform`}>
                      {isTopResult ? colorConfig.icon : "○"}
                    </span>
                    <span 
                      className="font-bold text-lg transition-colors"
                      style={{
                        color: isTopResult ? colorConfig.textColor : undefined
                      }}
                    >
                      {pred.className}
                    </span>
                  </div>
                  <span 
                    className="text-2xl font-black font-mono transition-colors"
                    style={{
                      background: isTopResult ? colorConfig.progressGradient : undefined,
                      backgroundClip: isTopResult ? 'text' : undefined,
                      WebkitBackgroundClip: isTopResult ? 'text' : undefined,
                      WebkitTextFillColor: isTopResult ? 'transparent' : undefined,
                      color: !isTopResult ? '#4b5563' : undefined
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Enhanced progress bar */}
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${percentage}%`,
                      background: isTopResult ? colorConfig.progressGradient : 'linear-gradient(to right, #9ca3af, #6b7280)',
                      boxShadow: isTopResult ? `0 0 10px ${colorConfig.shadowColor}` : 'none',
                      animation: isTopResult ? `expandBar 1s ease-out` : "none"
                    }}
                  ></div>
                  
                  {/* Shimmer effect for top result */}
                  {isTopResult && (
                    <div 
                      className="absolute top-0 left-0 h-full w-1 bg-white/50 blur-sm animate-pulse"
                      style={{
                        animation: `shimmer 2s infinite`
                      }}
                    ></div>
                  )}
                </div>
              </div>

              {/* Hover border effect */}
              <div 
                className="absolute inset-0 rounded-2xl border-2 transition-colors pointer-events-none"
                style={{
                  borderColor: isTopResult ? colorConfig.borderColor : 'transparent'
                }}
              ></div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes expandBar {
          from {
            width: 0;
          }
        }
        
        @keyframes shimmer {
          0%, 100% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
