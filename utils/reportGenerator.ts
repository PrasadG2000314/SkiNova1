import { RiskResult } from "./skinRiskLogic";

export interface ReportData {
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  contributors: { factor: string; impact: number; description: string }[];
  recommendations: string[];
  imageClassName?: string;
  imageProbability?: number;
}

export const generatePDFReport = (data: ReportData) => {
  const {
    timestamp,
    riskScore,
    riskLevel,
    contributors,
    recommendations,
    imageClassName,
    imageProbability,
  } = data;

  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Skin Cancer Risk Assessment Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        .page {
          background: white;
          max-width: 850px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #9333ea;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #9333ea;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .timestamp {
          text-align: right;
          color: #999;
          font-size: 12px;
          margin-bottom: 30px;
        }
        .score-section {
          background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 5px solid #9333ea;
        }
        .score-box {
          text-align: center;
          margin-bottom: 20px;
        }
        .score-value {
          font-size: 48px;
          font-weight: bold;
          color: #9333ea;
          line-height: 1;
          margin-bottom: 10px;
        }
        .score-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .risk-level {
          display: inline-block;
          padding: 10px 20px;
          background: #9333ea;
          color: white;
          border-radius: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .risk-level.low {
          background: #10b981;
        }
        .risk-level.moderate {
          background: #f59e0b;
        }
        .risk-level.high {
          background: #ef4444;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #9333ea;
          border-bottom: 2px solid #e9d5ff;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .icon {
          font-size: 22px;
        }
        .image-info {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #0ea5e9;
        }
        .image-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .image-info strong {
          color: #0369a1;
        }
        .contributor-item {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .contributor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .contributor-name {
          font-weight: bold;
          color: #1f2937;
          font-size: 15px;
        }
        .contributor-impact {
          font-size: 16px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .impact-positive {
          background: #fee2e2;
          color: #991b1b;
        }
        .impact-negative {
          background: #dcfce7;
          color: #166534;
        }
        .contributor-description {
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        .recommendation-item {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 12px 15px;
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 13px;
          color: #166534;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
        .disclaimer {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #92400e;
        }
        @media print {
          body {
            background: white;
          }
          .page {
            box-shadow: none;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>🏥 Skin Cancer Risk Assessment Report</h1>
          <p>Multimodal Analysis - Image + Clinical Metadata Fusion</p>
        </div>

        <div class="timestamp">Generated: ${timestamp}</div>

        <div class="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This report is for informational purposes only and should not be considered a medical diagnosis. 
          Please consult a qualified dermatologist for professional medical advice and diagnosis.
        </div>

        <div class="score-section">
          <div class="score-box">
            <div class="score-value">${riskScore}</div>
            <div class="score-label">Composite Risk Score / 100</div>
            <div style="margin-top: 15px;">
              <span class="risk-level ${riskLevel.toLowerCase()}">${riskLevel} Risk</span>
            </div>
          </div>
        </div>

        ${
          imageClassName
            ? `
        <div class="section">
          <div class="section-title">
            <span class="icon">🖼️</span> Image Analysis
          </div>
          <div class="image-info">
            <p><strong>Classification:</strong> ${imageClassName}</p>
            <p><strong>Confidence:</strong> ${imageProbability ? (imageProbability * 100).toFixed(1) : "N/A"}%</p>
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <div class="section-title">
            <span class="icon">🧠</span> Risk Factor Analysis (SHAP-Simulated)
          </div>
          <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
            The following factors contributed to your risk score:
          </p>
          ${contributors
            .map(
              (c) => `
            <div class="contributor-item">
              <div class="contributor-header">
                <span class="contributor-name">${c.factor}</span>
                <span class="contributor-impact ${c.impact > 0 ? "impact-positive" : "impact-negative"}">
                  ${c.impact > 0 ? "+" : ""}${c.impact}
                </span>
              </div>
              <div class="contributor-description">${c.description}</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="section">
          <div class="section-title">
            <span class="icon">🛡️</span> Personalized Recommendations
          </div>
          ${recommendations
            .map((r) => `<div class="recommendation-item">✓ ${r}</div>`)
            .join("")}
        </div>

        <div class="footer">
          <p>SkinNova - Advanced Dermatological AI Analysis System</p>
          <p>© 2026 | For diagnostic support only</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

export const downloadReportAsPDF = async (htmlContent: string, filename = "SkinCancer_Risk_Report.pdf") => {
  try {
    // Dynamically import html2pdf
    const html2pdf = (await import("html2pdf.js")).default;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const options = {
      margin: 10,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Fallback: download as HTML if html2pdf is not available
    const link = document.createElement("a");
    link.href = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
    link.download = filename.replace(".pdf", ".html");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export interface PsoriasisRiskReportData {
  timestamp: string;
  location: string;
  riskScore: number;
  riskLevel: string;
  weatherData: {
    temperature: number;
    humidity: number;
    feelsLike: number;
    windSpeed: number;
    condition: string;
  };
  riskFactors: Array<{
    label: string;
    value: number;
    impact: string;
    explanation: string;
    recommendation: string;
  }>;
  suggestions: string[];
  explainableInsights: {
    topRisks: string[];
    protectiveFactors: string[];
    holisticAssessment: string;
  };
}

export const generatePsoriasisRiskReport = (data: PsoriasisRiskReportData): string => {
  const {
    timestamp,
    location,
    riskScore,
    riskLevel,
    weatherData,
    riskFactors,
    suggestions,
    explainableInsights,
  } = data;

  const riskColor = (() => {
    if (riskLevel === "Low") return "#10b981";
    if (riskLevel === "Moderate") return "#f59e0b";
    if (riskLevel === "High") return "#ef4444";
    return "#7c2d12";
  })();

  const riskGradient = (() => {
    if (riskLevel === "Low") return "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)";
    if (riskLevel === "Moderate") return "linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)";
    if (riskLevel === "High") return "linear-gradient(135deg, #fecaca 0%, #fee2e2 100%)";
    return "linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)";
  })();

  const getRiskEmoji = () => {
    if (riskLevel === "Low") return "🟢";
    if (riskLevel === "Moderate") return "🟡";
    if (riskLevel === "High") return "🔴";
    return "⚫";
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Psoriasis Risk Analysis Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #2d3748;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .page {
          background: white;
          max-width: 900px;
          margin: 0 auto;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        
        /* Header Section */
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .header-title {
          font-family: 'Poppins', sans-serif;
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .header-subtitle {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 300;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        /* Content Section */
        .content {
          padding: 50px 40px;
        }
        
        /* Timestamp */
        .timestamp {
          text-align: center;
          color: #a0aec0;
          font-size: 13px;
          margin-bottom: 30px;
          font-weight: 500;
        }
        
        /* Location Card */
        .location-card {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          padding: 20px 25px;
          border-radius: 15px;
          margin-bottom: 30px;
          border-left: 6px solid #0891b2;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .location-icon {
          font-size: 32px;
        }
        .location-text strong {
          color: #0891b2;
          display: block;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .location-text {
          font-size: 20px;
          color: #075985;
          font-weight: 600;
        }
        
        /* Risk Score Section */
        .risk-score-section {
          background: ${riskGradient};
          border: 3px solid ${riskColor};
          padding: 40px;
          border-radius: 20px;
          margin-bottom: 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .risk-score-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, ${riskColor} 0%, transparent 70%);
          opacity: 0.1;
        }
        .risk-score-content {
          position: relative;
          z-index: 1;
        }
        .risk-emoji {
          font-size: 60px;
          margin-bottom: 15px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .score-label {
          font-size: 13px;
          color: ${riskColor};
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .score-value {
          font-family: 'Poppins', sans-serif;
          font-size: 72px;
          font-weight: 800;
          color: ${riskColor};
          line-height: 1;
          margin-bottom: 15px;
        }
        .risk-level-badge {
          display: inline-block;
          padding: 14px 32px;
          background: ${riskColor};
          color: white;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        /* Weather Section */
        .section-title {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-title::after {
          content: '';
          flex: 1;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, transparent 100%);
          border-radius: 2px;
        }
        
        .weather-section {
          margin-bottom: 40px;
        }
        .weather-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .weather-item {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 25px;
          border-radius: 15px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          text-align: center;
        }
        .weather-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
        .weather-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }
        .weather-item label {
          display: block;
          color: #718096;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .weather-item value {
          display: block;
          color: #2d3748;
          font-size: 24px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
        }
        
        /* Risk Factors Section */
        .factors-section {
          margin-bottom: 40px;
        }
        .factor-item {
          background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
          border-left: 6px solid ${riskColor};
          padding: 25px;
          margin-bottom: 18px;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }
        .factor-item:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .factor-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .factor-icon {
          font-size: 24px;
        }
        .factor-label {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          color: #2d3748;
          font-size: 16px;
        }
        .factor-impact {
          display: inline-block;
          background: ${riskColor};
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          margin-left: auto;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .factor-explanation {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .factor-recommendation {
          background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
          color: #065f46;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border-left: 4px solid #10b981;
          margin-top: 12px;
        }
        
        /* Insights Section */
        .insights-section {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          border: 2px solid #bbf7d0;
        }
        .insights-subsection {
          margin-bottom: 20px;
        }
        .insights-subsection:last-child {
          margin-bottom: 0;
        }
        .insights-subsection strong {
          color: #059669;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 12px;
        }
        .insights-list {
          list-style: none;
          padding: 0;
        }
        .insights-list li {
          padding: 10px 0 10px 28px;
          position: relative;
          color: #4a5568;
          font-size: 14px;
          line-height: 1.6;
        }
        .insights-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 700;
          font-size: 18px;
        }
        .holistic-assessment {
          background: white;
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 8px;
          margin-top: 15px;
          font-size: 14px;
          color: #4a5568;
          line-height: 1.7;
        }
        .holistic-assessment strong {
          color: #059669;
          display: inline;
        }
        
        /* Suggestions Section */
        .suggestions-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          border: 2px solid #fcd34d;
        }
        .suggestions-list {
          list-style: none;
          padding: 0;
        }
        .suggestions-list li {
          padding: 14px 0 14px 32px;
          position: relative;
          color: #78350f;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 500;
        }
        .suggestions-list li::before {
          content: "→";
          position: absolute;
          left: 0;
          color: #f59e0b;
          font-weight: 700;
          font-size: 18px;
        }
        
        /* Footer */
        .footer {
          border-top: 2px solid #e2e8f0;
          padding: 30px 40px;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          text-align: center;
        }
        .footer p {
          color: #718096;
          font-size: 12px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .footer p:last-child {
          margin-bottom: 0;
          font-weight: 500;
          color: #a0aec0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="header-title">🌊 Psoriasis Risk Analysis</div>
            <div class="header-subtitle">Environmental & Weather-Based Assessment Report</div>
          </div>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Timestamp -->
          <div class="timestamp">📅 Report Generated: ${timestamp}</div>

          <!-- Location Card -->
          <div class="location-card">
            <div class="location-icon">📍</div>
            <div class="location-text">
              <strong>Analysis Location</strong>
              ${location}
            </div>
          </div>

          <!-- Risk Score Section -->
          <div class="risk-score-section">
            <div class="risk-score-content">
              <div class="risk-emoji">${getRiskEmoji()}</div>
              <div class="score-label">Current Risk Score</div>
              <div class="score-value">${riskScore}</div>
              <div class="risk-level-badge">${riskLevel} Risk Level</div>
            </div>
          </div>

          <!-- Weather Section -->
          <div class="weather-section">
            <h2 class="section-title">🌦️ Current Weather Conditions</h2>
            <div class="weather-grid">
              <div class="weather-item">
                <div class="weather-icon">🌡️</div>
                <label>Temperature</label>
                <value>${weatherData.temperature}°C</value>
              </div>
              <div class="weather-item">
                <div class="weather-icon">💨</div>
                <label>Feels Like</label>
                <value>${weatherData.feelsLike}°C</value>
              </div>
              <div class="weather-item">
                <div class="weather-icon">💧</div>
                <label>Humidity</label>
                <value>${weatherData.humidity}%</value>
              </div>
              <div class="weather-item">
                <div class="weather-icon">🌪️</div>
                <label>Wind Speed</label>
                <value>${weatherData.windSpeed} km/h</value>
              </div>
            </div>
          </div>

          <!-- Risk Factors Section -->
          <div class="factors-section">
            <h2 class="section-title">⚠️ Risk Factors Analysis</h2>
            ${riskFactors.map((factor, idx) => `
              <div class="factor-item">
                <div class="factor-header">
                  <div class="factor-icon">${['☀️', '🌧️', '💨', '🌡️', '✨'][idx % 5]}</div>
                  <div class="factor-label">${factor.label}</div>
                  <div class="factor-impact">${factor.impact}</div>
                </div>
                <div class="factor-explanation">${factor.explanation}</div>
                <div class="factor-recommendation">💡 ${factor.recommendation}</div>
              </div>
            `).join('')}
          </div>

          <!-- Insights Section -->
          <div class="insights-section">
            <h2 class="section-title" style="margin-bottom: 25px; color: #059669;">🔍 Explainable AI Insights</h2>
            <div class="insights-subsection">
              <strong>🎯 Top Risk Factors</strong>
              <ul class="insights-list">
                ${explainableInsights.topRisks.map(risk => `<li>${risk}</li>`).join('')}
              </ul>
            </div>
            <div class="insights-subsection">
              <strong>🛡️ Protective Factors</strong>
              <ul class="insights-list">
                ${explainableInsights.protectiveFactors.map(factor => `<li>${factor}</li>`).join('')}
              </ul>
            </div>
            <div class="holistic-assessment">
              <strong>Overall Assessment:</strong><br>${explainableInsights.holisticAssessment}
            </div>
          </div>

          <!-- Suggestions Section -->
          <div class="suggestions-section">
            <h2 class="section-title" style="margin-bottom: 25px; color: #b45309;">💊 Personalized Recommendations</h2>
            <ul class="suggestions-list">
              ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>🏥 SkinNova - Advanced Dermatological AI Analysis System</p>
          <p>© 2026 | For informational support only | Always consult healthcare professionals for medical decisions</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};
