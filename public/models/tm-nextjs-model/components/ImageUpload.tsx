"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelect,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="space-y-6 animate-fadeIn">
      {/* Drag and Drop Area - Creative Design */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-3 border-dashed transition-all duration-300 cursor-pointer group ${
          isDragging
            ? "border-purple-500 bg-gradient-to-br from-purple-100 to-indigo-100/50 scale-105"
            : "border-purple-300/50 bg-gradient-to-br from-slate-50 to-purple-50/30 hover:border-purple-400 hover:from-purple-50 hover:to-indigo-50/50"
        }`}
      >
        {/* Background animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 py-16 px-8">
          {/* Animated Icon */}
          <div className={`text-7xl transition-all duration-300 ${
            isDragging ? "scale-125 rotate-12" : "group-hover:scale-110"
          }`}>
            📸
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              Upload Your Image
            </h3>
            <p className="text-lg text-gray-600 mb-6 font-medium">
              {isDragging ? "Drop it here! 🎯" : "Drag and drop or click to browse"}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`relative px-8 py-4 font-bold text-lg rounded-2xl transition-all duration-300 transform group/btn overflow-hidden ${
              isDragging
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl scale-105"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            }`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -skew-x-12 animate-pulse"></div>
            
            <span className="relative flex items-center justify-center gap-2">
              {isDragging ? "Drop Now" : "Choose Image"}
              <span className={`transition-transform ${isDragging ? "rotate-180" : ""}`}>↓</span>
            </span>
          </button>

          {/* Supported formats */}
          <div className="pt-4 border-t border-gray-300/40 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
              ✓ JPG • PNG • GIF • WebP
            </p>
          </div>
        </div>

        {/* Border glow on drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-3xl border-2 border-purple-400 animate-pulse pointer-events-none"></div>
        )}
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
