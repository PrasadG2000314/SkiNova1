"use client";

import { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import Spinner from "@/components/Spinner";
import Results from "@/components/Results";
import ImageUpload from "@/components/ImageUpload";

interface Prediction {
    className: string;
    probability: number;
}

export default function Home() {
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

                const modelURL = "/model/model.json";
                const metadataURL = "/model/metadata.json";

                const loadedModel = await tmImage.load(modelURL, metadataURL);
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
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20 hover:border-white/30 transition-colors">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block mb-6 p-4 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-full border border-white/20 backdrop-blur-sm">
                            <div className="text-6xl animate-bounce">🔍</div>
                        </div>
                        <h1 className="text-6xl font-black mb-3 bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent animate-fadeIn">
                            Skin Classifier
                        </h1>
                        <p className="text-purple-100/80 text-lg font-medium">
                            AI-Powered Image Analysis
                        </p>
                    </div>

                {/* Model Info */}
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl p-6 mb-8 border border-purple-400/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-purple-100 font-medium">
                                <span className="text-purple-300 font-bold">Model:</span> Teachable Machine
                            </p>
                            <p className="text-sm text-purple-100 font-medium">
                                <span className="text-purple-300 font-bold">Classes:</span> Skin / Not Skin
                            </p>
                        </div>
                        <div
                            className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm transition-all ${
                                    error
                                    ? "bg-red-500/40 text-red-100 border border-red-400/50"
                                    : loading
                                        ? "bg-amber-500/40 text-amber-100 border border-amber-400/50"
                                        : "bg-emerald-500/40 text-emerald-100 border border-emerald-400/50"
                                }`}
                        >
                            {error
                                ? "✗ Error"
                                : loading
                                    ? "⏳ Loading..."
                                    : "✓ Ready"}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-gradient-to-r from-red-500/30 to-pink-500/30 border-l-4 border-red-400 p-5 mb-6 rounded-xl backdrop-blur-sm">
                        <p className="text-red-100 text-sm font-semibold flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </p>
                    </div>
                )}

                {/* Main Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spinner />
                    </div>
                ) : !previewUrl ? (
                    <ImageUpload
                        onImageSelect={handleImageSelect}
                        disabled={!model}
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Preview Section */}
                        <div className="space-y-4">
                            <div className="relative bg-gradient-to-br from-slate-600/20 to-purple-600/20 rounded-2xl overflow-hidden p-6 border border-purple-400/30 shadow-inner backdrop-blur-sm group">
                                {/* Image glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300 -z-10"></div>
                                
                                <img
                                    ref={imageRef}
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full max-h-80 object-contain rounded-xl"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-6 py-3 bg-slate-600/40 hover:bg-slate-500/50 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md backdrop-blur-sm border border-white/20 hover:border-white/40"
                                    disabled={classifying}
                                >
                                    ↻ Change Image
                                </button>
                                <button
                                    onClick={handleClassify}
                                    disabled={!model || classifying}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:via-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/50 border border-purple-400/50"
                                >
                                    {classifying ? "🔄 Classifying..." : "✨ Classify"}
                                </button>
                            </div>
                        </div>

                        {/* Classification Section */}
                        {classifying && (
                            <div className="flex justify-center items-center py-20">
                                <Spinner />
                            </div>
                        )}

                        {predictions && (
                            <Results predictions={predictions} />
                        )}
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
                  animation: fadeIn 0.8s ease-out;
                }
            `}</style>
        </main>
    );
}
