"use client";

import { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import Spinner from "@/components/Spinner";
import Results from "@/components/Results";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";

// Model configuration
const MODEL_CONFIG = {
  detectEndpoint: "/api/analysis",

};

interface Prediction {
  className: string;
  probability: number;
}

export default function PsoriasisDetection() {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedModel = await tmImage.load(MODEL_CONFIG.detectEndpoint);
        setModel(loadedModel);
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
        predictions.map((p) => ({
          className: p.className,
          probability: p.probability,
        }))
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

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPredictions(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Charming animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-purple-200 rounded-full blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full blur-3xl opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-25 animate-blob animation-delay-3000"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-20 border-b border-gray-300 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/psoriasis" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-bold transition-colors text-sm sm:text-base">
              ← Back
            </Link>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
              SkinNova
            </h2>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-6 p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl border-2 border-white shadow-lg">
              <span className="text-5xl sm:text-6xl">🔍</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-gray-900 leading-tight">
              Psoriasis Detection
            </h1>
            <p className="text-gray-700 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Advanced AI-powered analysis to detect psoriasis from your skin images with high accuracy
            </p>
          </div>

          {/* Model Status */}
          <div className="mb-10">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Task Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative flex items-center gap-5 p-6 bg-gradient-to-br from-indigo-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 transform">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      📊
                    </div>
                    <div>
                      <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest letter-spacing-2">Task</p>
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
                <div className="bg-white border-2 border-blue-300 rounded-xl p-6 shadow-md hover:shadow-lg transition-all group">
                  <div className="flex gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                    <div>
                      <p className="text-blue-900 font-bold text-base mb-2">Clear Image</p>
                      <p className="text-gray-700 text-sm">Use good lighting and focus on the affected area for best results</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border-2 border-green-300 rounded-xl p-6 shadow-md hover:shadow-lg transition-all group">
                  <div className="flex gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">✨</span>
                    <div>
                      <p className="text-green-900 font-bold text-base mb-2">Good Results</p>
                      <p className="text-gray-700 text-sm">High contrast with clean background helps AI detect better</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Preview and Analysis Section
            <div className="space-y-8">
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
                  ) : predictions ? (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Results Details */}
                      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                        <Results predictions={predictions} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 shadow-md">
                      <span className="text-6xl mb-4">👆</span>
                      <p className="text-gray-900 font-bold text-center text-lg">Ready to Analyze</p>
                      <p className="text-gray-700 text-center mt-2">Click the button below to detect psoriasis</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all duration-200 transform hover:scale-105 border-2 border-gray-400 shadow-md hover:shadow-lg text-base active:scale-95"
                >
                  ↻ Change Image
                </button>
                <button
                  onClick={handleClassify}
                  disabled={!model || classifying}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl text-base active:scale-95"
                >
                  {classifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin">⚙️</span>
                      Analyzing...
                    </span>
                  ) : (
                    "✨ Analyze Now"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

