'use client';

import React from 'react';

interface GradCAMVisualizationProps {
  doshaType: 'vata' | 'pitta' | 'kapha';
  gradcamData: any;
  totalScore: number;
}

export default function GradCAMVisualization({
  doshaType,
  gradcamData,
  totalScore,
}: GradCAMVisualizationProps) {
  const doshaColors: Record<string, string> = {
    vata: 'from-blue-500 to-cyan-500',
    pitta: 'from-red-500 to-orange-500',
    kapha: 'from-green-500 to-emerald-500',
  };

  const doshaEmojis: Record<string, string> = {
    vata: '🌬️',
    pitta: '🔥',
    kapha: '💧',
  };

  return (
    <div className={`bg-gradient-to-r ${doshaColors[doshaType]} rounded-xl p-8 shadow-2xl mt-8`}>
      <div className="text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{doshaEmojis[doshaType]}</span>
          <div>
            <h3 className="text-2xl font-bold capitalize">
              {doshaType} Analysis
            </h3>
            <p className="text-white/80">
              Confidence Score: {(totalScore * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {gradcamData && (
          <div className="mt-4 space-y-2">
            <p className="text-sm opacity-90">
              Key influencing factors:
            </p>
            {Array.isArray(gradcamData) && gradcamData.length > 0 && (
              <ul className="text-sm space-y-1 opacity-80">
                {gradcamData.slice(0, 5).map((item: any, idx: number) => (
                  <li key={idx}>
                    • {typeof item === 'string' ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
