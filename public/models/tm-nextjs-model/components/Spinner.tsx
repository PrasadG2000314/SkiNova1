"use client";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Gradient Orbs */}
      <div className="relative w-24 h-24">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-indigo-500 animate-spin"></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-2 rounded-full border-2 border-purple-300/30 animate-pulse"></div>
        
        {/* Inner glowing orb */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 blur-lg opacity-70 animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-700 font-semibold text-sm">Loading AI Model</p>
        <p className="text-xs text-gray-500 mt-1 animate-pulse">Please wait...</p>
      </div>
    </div>
  );
}
