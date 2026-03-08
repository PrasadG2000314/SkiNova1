'use client';

interface ModelLoaderProps {
  loaded: boolean;
}

export default function ModelLoader({ loaded }: ModelLoaderProps) {
  return (
    <div className={`rounded-lg p-4 flex items-center gap-3 ${
      loaded
        ? 'bg-green-50 border border-green-200'
        : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        loaded ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
      }`}></div>
      <p className={`text-sm font-semibold ${
        loaded ? 'text-green-800' : 'text-blue-800'
      }`}>
        {loaded ? '✓ Model Ready' : '⟳ Loading Model...'}
      </p>
    </div>
  );
}
