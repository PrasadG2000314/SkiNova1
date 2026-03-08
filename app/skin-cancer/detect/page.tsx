"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as tmImage from "@teachablemachine/image";
import Spinner from "@/components/Spinner";
import Results from "@/components/Results";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";
import SkinCancerChatbot from "@/components/SkinCancerChatbot";
import ClinicalMetadataForm, { MetadataForm } from "@/components/ClinicalMetadataForm";
import MultimodalRiskResults from "@/components/MultimodalRiskResults";
import { calculateSkinCancerRisk, RiskResult } from "@/utils/skinRiskLogic";
import { generatePDFReport, downloadReportAsPDF } from "@/utils/reportGenerator";

// Model configuration for skin cancer detection
const MODEL_CONFIG = {
    modelURL: "/models/skincancer-model/public/model/model.json",
    metadataURL: "/models/skincancer-model/public/model/metadata.json",
};

interface Prediction {
    className: string;
    probability: number;
}

export default function SkinCancerDetection() {
    const [model, setModel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [classifying, setClassifying] = useState(false);
    const [predictions, setPredictions] = useState<Prediction[] | null>(null);
    const [savingResult, setSavingResult] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const router = useRouter();
    const metadataFormRef = useRef<HTMLDivElement>(null);
    
    // New State for Metadata & Risk
    const [showMetadataForm, setShowMetadataForm] = useState(false);
    const [riskResult, setRiskResult] = useState<RiskResult | null>(null);

    // Load model on mount
    useEffect(() => {
        const loadModel = async () => {
            try {
                setLoading(true);
                setError(null);

                const loadedModel = await tmImage.load(MODEL_CONFIG.modelURL, MODEL_CONFIG.metadataURL);
                setModel(loadedModel);
                console.log("Skin Cancer Model loaded successfully");
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load model";
                setError(message);
                console.error("Error loading model:", err);
            } finally {
                setLoading(false);
            }
        };

        loadModel();
    }, []);

    const handleImageSelect = (file: File) => {
        setSelectedImage(file);
        setPredictions(null);
        setShowMetadataForm(false);
        setRiskResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleClassify = async () => {
        if (!model || !imageRef.current || !selectedImage) {
            setError("Please select an image and wait for the model to load");
            return;
        }

        try {
            setClassifying(true);
            setError(null);

            const predictions = await model.predict(imageRef.current);
            setPredictions(
                predictions.map((p: any) => {
                    // Map "normal skin" to "Not Melanoma" and capitalize "melanoma" to "Melanoma" for better user clarity
                    let displayName = p.className;
                    if (displayName.toLowerCase().includes("normal")) {
                        displayName = "Not Melanoma";
                    } else if (displayName.toLowerCase() === "melanoma") {
                        displayName = "Melanoma";
                    }
                    return {
                        className: displayName,
                        probability: p.probability,
                    };
                })
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to classify image";
            setError(message);
            console.error("Error classifying:", err);
        } finally {
            setClassifying(false);
        }
    };

    const handleMetadataSubmit = (data: MetadataForm) => {
        if (!predictions || predictions.length === 0) return;

        // Get top prediction
        const topPrediction = predictions.reduce((prev, current) => 
            (prev.probability > current.probability) ? prev : current
        );

        const risk = calculateSkinCancerRisk(data, topPrediction.probability, topPrediction.className);
        setRiskResult(risk);
        setShowMetadataForm(false);
    };

    const handleReset = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setPredictions(null);
        setShowMetadataForm(false);
        setRiskResult(null);
    };

    const handleDownloadReport = () => {
        if (!riskResult || !predictions) return;

        const topPrediction = predictions.reduce((prev, current) => 
            (prev.probability > current.probability) ? prev : current
        );

        const reportData = {
            timestamp: new Date().toLocaleString(),
            riskScore: riskResult.totalRiskScore,
            riskLevel: riskResult.riskLevel,
            contributors: riskResult.contributors,
            recommendations: riskResult.recommendations,
            imageClassName: topPrediction.className,
            imageProbability: topPrediction.probability,
        };

        const reportHtml = generatePDFReport(reportData);
        downloadReportAsPDF(reportHtml, `SkinCancer_Risk_Report_${new Date().getTime()}.pdf`);
    };

    const saveScanResult = async () => {
        if (!predictions || predictions.length === 0) return;

        try {
            setSavingResult(true);
            const token = localStorage.getItem("token");
            const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
            const topPrediction = sortedPredictions[0];

            // Determine scan status based on prediction and confidence
            let scanStatus = "Monitor";
            const confidence = topPrediction.probability;
            
            if (topPrediction.className.toLowerCase().includes("melanoma")) {
                scanStatus = confidence > 0.7 ? "Needs review" : "Monitor";
            } else {
                scanStatus = confidence > 0.8 ? "Stable" : "Monitor";
            }

            // Generate scan area description based on detection
            let scanArea = "General";
            if (topPrediction.className.toLowerCase().includes("melanoma")) {
                scanArea = "Suspicious Lesion";
            } else if (topPrediction.className.toLowerCase().includes("not melanoma")) {
                scanArea = "Benign Lesion";
            }

            const scanData = {
                diseaseType: "skinCancer",
                skinCondition: topPrediction.className,
                confidence: topPrediction.probability,
                scanArea: scanArea,
                scanStatus: scanStatus,
                reportName: `Skin Cancer Scan - ${new Date().toLocaleDateString()}`,
                allPredictions: predictions, // Save all predictions for detailed analysis
                timestamp: new Date().toISOString()
            };

            console.log("Sending scan data to backend:", scanData);

            const response = await fetch("http://localhost:4000/api/analysis/save-scan", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(scanData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Backend error response:", errorData);
                throw new Error(errorData.error || errorData.message || "Failed to save scan result");
            }

            const responseData = await response.json();
            console.log("Scan saved successfully:", responseData);

            // Show success and redirect with disease parameter
            alert("✅ Skin Cancer scan saved successfully! Redirecting to dashboard...");
            setTimeout(() => {
                // Refresh the page and set the disease to skin cancer
                window.location.href = "/patient/dashboard?disease=skinCancer";
            }, 1000);
        } catch (err) {
            console.error("Error saving scan:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save scan result";
            alert(`Failed to save scan: ${errorMessage}. You can still view your results.`);
        } finally {
            setSavingResult(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 relative overflow-hidden">
            {/* Charming animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-300 to-emerald-200 rounded-full blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full blur-3xl opacity-35 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200 to-green-200 rounded-full blur-3xl opacity-25 animate-blob animation-delay-3000"></div>
            </div>

            {/* Header Navigation */}
            <nav className="relative z-20 border-b border-gray-300 bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/skin-cancer" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-bold transition-colors text-sm sm:text-base">
                            ← Back
                        </Link>
                        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-700 to-cyan-700 bg-clip-text text-transparent">
                            SkinNova
                        </h2>
                        <div className="w-20"></div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 pb-32">
                <div className="w-full max-w-6xl space-y-12 lg:pr-64 transition-all duration-300">
                    {/* Header Section */}
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-block mb-6 p-4 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl border-2 border-white shadow-lg">
                            <span className="text-5xl sm:text-6xl">🔬</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-slate-900 leading-tight tracking-tight">
                            Skin Cancer Detection
                        </h1>
                        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                            Professional AI-powered dermatological analysis to detect potential melanoma risks
                        </p>
                    </div>

                    {/* Model Status */}
                    <div className="mb-10 w-full">
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl shadow-emerald-100/50 hover:shadow-2xl transition-all duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Task Card */}
                                <div className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative flex items-center gap-5 p-6 bg-gradient-to-br from-green-50 via-green-50 to-cyan-50 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 transform">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                            🔬
                                        </div>
                                        <div>
                                            <p className="text-green-600 text-xs font-bold uppercase tracking-widest letter-spacing-2">Task</p>
                                            <p className="text-gray-900 font-black text-lg mt-1">Skin Analysis</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div className="group relative">
                                    <div className="absolute inset-0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" style={{
                                        background: error ? 'linear-gradient(to right, #ef4444, #dc2626)' : predictions ? 'linear-gradient(to right, #10b981, #059669)' : loading ? 'linear-gradient(to right, #f59e0b, #d97706)' : 'linear-gradient(to right, #22c55e, #16a34a)'
                                    }}></div>
                                    <div className="relative flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 transform" style={{
                                        background: error ? 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))' : predictions ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))' : loading ? 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05))' : 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.05), rgba(22, 163, 74, 0.05))',
                                        borderColor: error ? '#fca5a5' : predictions ? '#6ee7b7' : loading ? '#fcd34d' : '#86efac'
                                    }}>
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" style={{
                                            background: error ? 'linear-gradient(to bottom right, #ef4444, #dc2626)' : predictions ? 'linear-gradient(to bottom right, #10b981, #059669)' : loading ? 'linear-gradient(to bottom right, #f59e0b, #d97706)' : 'linear-gradient(to bottom right, #22c55e, #16a34a)'
                                        }}>
                                            {error ? '⚠️' : predictions ? '✨' : loading ? '⏳' : '✅'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest letter-spacing-2" style={{
                                                color: error ? '#dc2626' : predictions ? '#059669' : loading ? '#d97706' : '#16a34a'
                                            }}>Status</p>
                                            <p className="text-gray-900 font-black text-lg mt-1">
                                                {error ? 'Error' : predictions ? 'Detected ✓' : loading ? 'Loading...' : 'Ready'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 bg-red-50 border-2 border-red-400 p-6 rounded-xl shadow-md animate-fadeIn">
                            <p className="text-red-800 font-bold flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <span>{error}</span>
                            </p>
                        </div>
                    )}

                    {/* Main Content Area */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner />
                        </div>
                    ) : !previewUrl ? (
                        // Upload Section
                        <div className="space-y-8">
                            <ImageUpload
                                onImageSelect={handleImageSelect}
                                disabled={!model}
                            />
                            
                            {/* Tips Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white border-2 border-green-300 rounded-xl p-6 shadow-md hover:shadow-lg transition-all group">
                                    <div className="flex gap-4">
                                        <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                                        <div>
                                            <p className="text-green-900 font-bold text-base mb-2">Clear Image</p>
                                            <p className="text-gray-700 text-sm">Use good lighting and focus on the affected area for best results</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-cyan-300 rounded-xl p-6 shadow-md hover:shadow-lg transition-all group">
                                    <div className="flex gap-4">
                                        <span className="text-4xl group-hover:scale-110 transition-transform">✨</span>
                                        <div>
                                            <p className="text-cyan-900 font-bold text-base mb-2">Good Results</p>
                                            <p className="text-gray-700 text-sm">High contrast with clean background helps AI detect better</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Preview and Analysis Section
                        <div className="space-y-8 pb-32">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Image Preview */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-300 p-4 shadow-lg hover:shadow-xl transition-all group">
                                        <div className="rounded-xl overflow-hidden bg-gray-100">
                                            <img
                                                ref={imageRef}
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis Area */}
                                <div className="lg:col-span-2 space-y-6">
                                    {classifying ? (
                                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-gray-300 shadow-lg">
                                            <Spinner />
                                        </div>
                                    ) : riskResult ? (
                                        <MultimodalRiskResults data={riskResult} />
                                    ) : showMetadataForm ? (
                                        <div className="space-y-6 animate-fadeIn" ref={metadataFormRef}>
                                            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-gray-700 font-bold">Step 1: Visual Analysis</h3>
                                                    <span className="text-green-600 font-bold text-sm">✓ Complete</span>
                                                </div>
                                                <Results predictions={predictions} />
                                            </div>
                                            <ClinicalMetadataForm onSubmit={handleMetadataSubmit} onSkip={() => setShowMetadataForm(false)} />
                                        </div>
                                    ) : predictions ? (
                                        <div className="space-y-6 animate-fadeIn">
                                            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                                                <Results predictions={predictions} />
                                                
                                                <div className="mt-8 border-t pt-6">
                                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                                        <span>🩺</span> Next Step
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                        Image analysis is only one part of the diagnosis. To get a comprehensive 
                                                        <span className="font-bold text-green-700"> Risk Stratification Report</span>, 
                                                        please provide basic clinical details.
                                                    </p>
                                                    <button 
                                                        onClick={() => {
                                                            setShowMetadataForm(true);
                                                            setTimeout(() => {
                                                                metadataFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }, 100);
                                                        }}
                                                        className="w-full py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <span>📝</span> 
                                                        Continue to Risk Assessment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl border-2 border-green-300 shadow-md">
                                            <span className="text-6xl mb-4">👆</span>
                                            <p className="text-gray-900 font-bold text-center text-lg">Ready to Analyze</p>
                                            <p className="text-gray-700 text-center mt-2">Click the button below to detect skin cancer</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!showMetadataForm && !riskResult && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all duration-200 transform hover:scale-105 border-2 border-gray-400 shadow-md hover:shadow-lg text-base active:scale-95"
                                >
                                    ↻ Change Image
                                </button>
                                {!predictions ? (
                                    <button
                                        onClick={handleClassify}
                                        disabled={!model || classifying}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl text-base active:scale-95"
                                    >
                                        {classifying ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block animate-spin">⚙️</span>
                                                Analyzing...
                                            </span>
                                        ) : (
                                            "🔬 Analyze Now"
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={saveScanResult}
                                        disabled={savingResult}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl text-base active:scale-95"
                                    >
                                        {savingResult ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block animate-spin">⚙️</span>
                                                Saving...
                                            </span>
                                        ) : (
                                            "💾 Save Result"
                                        )}
                                    </button>
                                )}
                            </div>
                            )}
                            
                            {/* Reset for Risk Result */}
                            {riskResult && (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                                    <button
                                        onClick={handleDownloadReport}
                                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-green-500 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <span>📥</span> Download Report
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-lg border-2 border-gray-200 hover:border-green-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <span>🔄</span> Start New Analysis
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            <SkinCancerChatbot predictions={predictions && !riskResult ? predictions : null} />

            <style>{`
                @keyframes blob {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                
                .animate-blob {
                  animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                  animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                  animation-delay: 4s;
                }
                
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .animate-fadeIn {
                  animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </main>
    );
}
