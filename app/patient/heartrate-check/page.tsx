"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeartRateCheckPage() {
  const router = useRouter();
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [status, setStatus] = useState<"idle" | "measuring" | "complete">("idle");
  const [notes, setNotes] = useState("");
  const [savedReadings, setSavedReadings] = useState<
    Array<{ rate: number; timestamp: string; notes: string }>
  >([]);

  const startMeasurement = async () => {
    setMeasuring(true);
    setStatus("measuring");

    // Simulate heart rate measurement over 15 seconds
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate realistic heart rate (60-100 bpm)
    const simulatedRate = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
    setHeartRate(simulatedRate);
    setStatus("complete");
    setMeasuring(false);
  };

  const saveReading = () => {
    if (heartRate !== null) {
      const newReading = {
        rate: heartRate,
        timestamp: new Date().toLocaleString(),
        notes: notes,
      };
      setSavedReadings([newReading, ...savedReadings]);
      setHeartRate(null);
      setNotes("");
      setStatus("idle");
      alert("✅ Heart rate reading saved successfully!");
    }
  };

  const getHeartRateStatus = (rate: number) => {
    if (rate < 60) return { label: "Low", color: "text-blue-600", bg: "bg-blue-50" };
    if (rate <= 100) return { label: "Normal", color: "text-green-600", bg: "bg-green-50" };
    if (rate <= 120) return { label: "Elevated", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "High", color: "text-red-600", bg: "bg-red-50" };
  };

  const rateStatus = heartRate ? getHeartRateStatus(heartRate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold mb-6">
            ← Back to Dashboard
          </Link>
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
            <span className="text-6xl">❤️</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Heart Rate Monitor</h1>
          <p className="text-gray-600 text-lg">Track your heart rate and wellness</p>
        </div>

        {/* Main Measurement Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center space-y-8">
            {status === "idle" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Ready to measure?</h2>
                <p className="text-gray-600">
                  Find your pulse on your wrist or neck. Keep your finger steady and tap the button below to start measuring.
                </p>
                <button
                  onClick={startMeasurement}
                  disabled={measuring}
                  className="mx-auto px-12 py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {measuring ? "Measuring..." : "🎯 Start Measurement"}
                </button>
              </>
            )}

            {status === "measuring" && (
              <>
                <div className="space-y-4">
                  <p className="text-gray-600 font-semibold">Measuring heart rate...</p>
                  <div className="flex justify-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                  <p className="text-sm text-gray-500">Keep your finger steady for accurate reading...</p>
                </div>
              </>
            )}

            {status === "complete" && heartRate !== null && (
              <>
                <div className={`p-8 rounded-2xl ${rateStatus?.bg}`}>
                  <p className="text-gray-600 font-semibold mb-2">Your Heart Rate</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className={`text-7xl font-bold ${rateStatus?.color}`}>
                      {heartRate}
                    </span>
                    <span className="text-2xl text-gray-600">bpm</span>
                  </div>
                  <p className={`text-lg font-bold ${rateStatus?.color}`}>
                    {rateStatus?.label} Heart Rate
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📝 Add Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., After exercise, feeling anxious, etc."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setHeartRate(null);
                      setStatus("idle");
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-xl transition-all"
                  >
                    ↻ Measure Again
                  </button>
                  <button
                    onClick={saveReading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    💾 Save Reading
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Heart Rate Guide */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 Heart Rate Guide</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-bold text-blue-900">Resting (60-100 bpm)</p>
              <p className="text-sm text-blue-800">Normal resting heart rate</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="font-bold text-green-900">Healthy (50-70 bpm)</p>
              <p className="text-sm text-green-800">Excellent cardiovascular fitness</p>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <p className="font-bold text-orange-900">Elevated (100-120 bpm)</p>
              <p className="text-sm text-orange-800">After exercise or stress</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="font-bold text-red-900">High (120+ bpm)</p>
              <p className="text-sm text-red-800">Seek medical advice if persistent</p>
            </div>
          </div>
        </div>

        {/* Saved Readings */}
        {savedReadings.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">📈 Saved Readings</h3>
            <div className="space-y-3">
              {savedReadings.map((reading, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border-l-4 border-rose-500">
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">❤️</span>
                      <span>{reading.rate} bpm</span>
                    </p>
                    <p className="text-sm text-gray-600">{reading.timestamp}</p>
                    {reading.notes && <p className="text-sm text-gray-700 mt-1">📝 {reading.notes}</p>}
                  </div>
                  <div className={`text-lg font-bold ${getHeartRateStatus(reading.rate).color}`}>
                    {getHeartRateStatus(reading.rate).label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
