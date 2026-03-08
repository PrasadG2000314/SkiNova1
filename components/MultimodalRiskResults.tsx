
"use client";

import React from "react";
import { RiskResult } from "@/utils/skinRiskLogic";

interface Props {
  data: RiskResult;
}

export default function MultimodalRiskResults({ data }: Props) {
  const { totalRiskScore, riskLevel, contributors, recommendations, imageClassName, imageProbability } = data;

  const getScoreColor = () => {
    if (riskLevel === "Low") return "text-green-600";
    if (riskLevel === "Moderate") return "text-yellow-600";
    if (riskLevel === "High") return "text-orange-600";
    return "text-red-700";
  };

  const getBarColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 60) return "bg-yellow-500";
    if (score < 80) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slide-up">
      <h2 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">
        Multimodal Risk Analysis Report
      </h2>

      {/* DEBUG: AI Classification Display */}
      <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h3 className="text-sm font-bold text-blue-900 mb-2">🤖 AI Classification Result</h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-900">
            Detected: <span className="text-blue-700">{imageClassName || "Unknown"}</span>
          </span>
          <span className="text-lg font-bold text-blue-700">
            Confidence: {imageProbability ? `${(imageProbability * 100).toFixed(1)}%` : "N/A"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Score & Gauge */}
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-4 uppercase tracking-wider">
              Composite Risk Score
            </h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Circular Background */}
              <div className="absolute inset-0 rounded-full border-8 border-gray-200 opacity-30"></div>
              {/* Score Value */}
              <div className="text-center z-10">
                <span className={`text-6xl font-black ${getScoreColor()}`}>
                  {totalRiskScore}
                </span>
                <span className="block text-gray-400 font-bold text-lg mt-1">
                  / 100
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className={`inline-block px-6 py-2 rounded-full text-lg font-bold bg-white shadow-md border ${getScoreColor()}`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span>🛡️</span> Personalized Prevention
            </h3>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-blue-800">
                  <span className="mt-1 text-blue-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Explainability */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🧠</span> Explainability Engine (SHAP-Simulated)
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Breakdown of key factors contributing to the risk calculation, integrating both visual lesion features and patient metadata.
          </p>

          <div className="space-y-4">
            {contributors.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{item.factor}</span>
                  <span
                    className={`font-mono font-bold ${
                      item.impact > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {item.impact > 0 ? `+${item.impact}` : item.impact}
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      item.impact > 0 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(Math.abs(item.impact) * 2, 100)}%` }} // Scaling for visual effect
                  ></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
