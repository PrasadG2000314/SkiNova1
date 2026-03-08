"use client";

import { useRef, useState, useEffect } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelect,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Detect if device is mobile or tablet
  useEffect(() => {
    const checkDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isTablet = /ipad|android(?!.*mobi)/.test(userAgent);
      setIsMobileOrTablet(isMobile || isTablet);
    };

    checkDeviceType();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upload Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-gray-900 mb-3">
          Upload Your Image
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          Choose how you want to provide your skin image
        </p>
      </div>

      {/* Two Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Camera Option */}
        <div className={`group relative ${!isMobileOrTablet ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-white rounded-3xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 h-full">
            {/* Icon */}
            <div className="text-6xl mb-4 text-center">
              📷
            </div>
            
            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Use Camera
            </h3>
            <p className="text-gray-600 text-sm mb-6 font-medium text-center">
              {isMobileOrTablet 
                ? "Capture image directly from your device camera" 
                : "📱 Available on mobile & tablets only"}
            </p>

            {/* Camera Input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraChange}
              disabled={disabled || !isMobileOrTablet}
              className="hidden"
            />

            {/* Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled || !isMobileOrTablet}
              className={`w-full px-6 py-3 font-bold rounded-2xl transition-all duration-300 transform mb-6 ${
                isMobileOrTablet
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📷 {isMobileOrTablet ? 'Open Camera' : 'Not Available'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-xs font-semibold">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Camera Description */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📱</span>
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    {isMobileOrTablet ? 'Mobile Camera' : 'Desktop? Use Upload'}
                  </p>
                  <p className="text-xs text-blue-700">
                    {isMobileOrTablet 
                      ? 'Take a fresh photo of your skin using your device camera for real-time capture'
                      : 'Cameras are optimized for mobile and tablet devices. Please use Upload File on desktop.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload File Option with Drag & Drop */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-white rounded-3xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
            {/* Icon */}
            <div className="text-6xl mb-4 text-center">
              📁
            </div>
            
            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Upload File
            </h3>
            <p className="text-gray-600 text-sm mb-6 font-medium text-center">
              Choose your image
            </p>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />

            {/* Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={disabled}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 mb-6"
            >
              📁 Browse Files
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-xs font-semibold">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging
                  ? "border-purple-500 bg-purple-50 scale-105"
                  : "border-purple-300 bg-purple-50/50 hover:border-purple-400"
              }`}
            >
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2 py-8 px-4">
                {/* Icon */}
                <div className={`text-4xl transition-all duration-300 ${
                  isDragging ? "scale-125 rotate-12" : "hover:scale-110"
                }`}>
                  📸
                </div>

                {/* Text */}
                <p className="text-sm text-gray-600 font-medium text-center">
                  {isDragging ? "Drop here! 🎯" : "Drag & drop or click"}
                </p>
              </div>

              {/* Border glow on drag */}
              {isDragging && (
                <div className="absolute inset-0 rounded-2xl border border-purple-400 animate-pulse pointer-events-none"></div>
              )}
            </div>

            {/* Supported formats */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
                ✓ JPG • PNG • GIF • WebP
              </p>
            </div>
          </div>
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
    </div>
  );
}
