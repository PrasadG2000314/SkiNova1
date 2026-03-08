'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Shield, Sun, CheckCircle, Stethoscope, Leaf, Heart, Zap } from 'lucide-react';
import { useState } from 'react';

export default function SkinCancerInformation() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 hover:scale-105 font-semibold"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Skin Health Guide
            </h1>
            <p className="text-sm text-gray-600 mt-1">Learn, Prevent & Protect Your Skin</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16 relative z-10">
        <div className="space-y-10">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 group-hover:scale-105 transform"></div>
              <div className="relative bg-white rounded-2xl p-6 text-center border-2 border-cyan-200 shadow-md hover:shadow-lg transition">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-cyan-700 font-bold">Early Detection</p>
                <p className="text-sm text-gray-600 mt-2">Improves treatment success by 90%+</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 group-hover:scale-105 transform"></div>
              <div className="relative bg-white rounded-2xl p-6 text-center border-2 border-purple-200 shadow-md hover:shadow-lg transition">
                <div className="text-4xl mb-2">☀️</div>
                <p className="text-purple-700 font-bold">UV Protection</p>
                <p className="text-sm text-gray-600 mt-2">SPF 30+ is your best defense</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 group-hover:scale-105 transform"></div>
              <div className="relative bg-white rounded-2xl p-6 text-center border-2 border-rose-200 shadow-md hover:shadow-lg transition">
                <div className="text-4xl mb-2">👨‍⚕️</div>
                <p className="text-rose-700 font-bold">Professional Care</p>
                <p className="text-sm text-gray-600 mt-2">Annual skin checks recommended</p>
              </div>
            </div>
          </div>

          {/* About Skin Cancer Section */}
          <div className="group">
            <div className="bg-white rounded-2xl border-2 border-cyan-200 p-8 sm:p-10 hover:border-cyan-400 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
              onClick={() => toggleSection('about')}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl">
                    <AlertCircle className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Understanding Skin Cancer
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Know the facts to protect yourself</p>
                  </div>
                </div>
              </div>
              
              {(expandedSection === 'about' || expandedSection === null) && (
                <div className="space-y-4 text-gray-700 animate-fadeIn">
                  <p className="text-lg leading-relaxed">
                    Skin cancer develops when skin cells grow abnormally, usually due to excessive UV radiation exposure from the sun or tanning beds. The good news? <span className="text-cyan-600 font-bold">Early detection can greatly improve treatment success rates.</span>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-red-50 rounded-2xl p-5 border-2 border-red-200 hover:border-red-400 transition-all">
                      <p className="font-bold text-red-700 text-lg mb-2">🎯 Melanoma</p>
                      <p className="text-sm text-gray-700">Most serious type. Requires immediate attention if detected.</p>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-5 border-2 border-orange-200 hover:border-orange-400 transition-all">
                      <p className="font-bold text-orange-700 text-lg mb-2">⚪ Basal Cell</p>
                      <p className="text-sm text-gray-700">Most common type. Usually highly treatable when caught early.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                      <p className="font-bold text-yellow-700 text-lg mb-2">📍 Squamous Cell</p>
                      <p className="text-sm text-gray-700">Second most common. Early detection improves outcomes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prevention Section */}
          <div className="group">
            <div className="bg-white rounded-2xl border-2 border-green-200 p-8 sm:p-10 hover:border-green-400 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
              onClick={() => toggleSection('prevention')}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                    <Shield className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Prevention Strategies
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Actionable steps to protect your skin</p>
                  </div>
                </div>
              </div>

              {(expandedSection === 'prevention' || expandedSection === null) && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                    <div className="flex items-start gap-4">
                      <Sun className="text-yellow-600 mt-1 flex-shrink-0" size={28} />
                      <div>
                        <p className="text-xl font-bold text-yellow-800 mb-3">☀️ Sun Protection</p>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> SPF 30+ sunscreen daily</li>
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Reapply every 2 hours</li>
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Hats, sunglasses & protective clothing</li>
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Shade between 10 AM - 4 PM</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-4">
                      <Leaf className="text-blue-600 mt-1 flex-shrink-0" size={28} />
                      <div>
                        <p className="text-xl font-bold text-blue-800 mb-3">🧴 Daily Habits</p>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Year-round UV protection (even cloudy days!)</li>
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Monthly self-skin checks</li>
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Avoid tanning beds completely</li>
                          <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Stay hydrated & nourish your skin</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* After Prediction Section */}
          <div className="group">
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 sm:p-10 hover:border-purple-400 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
              onClick={() => toggleSection('action')}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                    <Stethoscope className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      After a Prediction Result
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">What to do next</p>
                  </div>
                </div>
              </div>

              {(expandedSection === 'action' || expandedSection === null) && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                    <p className="text-red-700 font-bold">⚠️ Important Disclaimer</p>
                    <p className="text-gray-700 text-sm mt-2">This prediction is <span className="font-bold">NOT a medical diagnosis.</span> Always consult a healthcare professional for proper evaluation.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-2xl p-5 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">1</div>
                        <div>
                          <p className="font-bold text-blue-700">Consult a Professional</p>
                          <p className="text-sm text-gray-700 mt-1">Book an appointment with a dermatologist for examination</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-cyan-50 rounded-2xl p-5 border-l-4 border-cyan-500">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">2</div>
                        <div>
                          <p className="font-bold text-cyan-700">Monitor Changes</p>
                          <p className="text-sm text-gray-700 mt-1">Watch for changes in size, color, shape, or bleeding</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-5 border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">3</div>
                        <div>
                          <p className="font-bold text-green-700">Document Progress</p>
                          <p className="text-sm text-gray-700 mt-1">Take photos regularly to track changes over time</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-5 border-l-4 border-purple-500">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">4</div>
                        <div>
                          <p className="font-bold text-purple-700">Follow Up</p>
                          <p className="text-sm text-gray-700 mt-1">Avoid scratching and keep your area clean & protected</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ABCDE Rule */}
          <div className="group">
            <div className="bg-white rounded-2xl border-2 border-red-200 p-8 sm:p-10 hover:border-red-400 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
              onClick={() => toggleSection('abcde')}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
                    <Zap className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      ABCDE Warning Signs
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Learn to recognize suspicious moles</p>
                  </div>
                </div>
              </div>

              {(expandedSection === 'abcde' || expandedSection === null) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-400 transition-all">
                    <p className="text-3xl font-black text-red-500 mb-2">A</p>
                    <p className="font-bold text-red-700 mb-2">Asymmetry</p>
                    <p className="text-sm text-gray-700">One half doesn't match the other half</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all">
                    <p className="text-3xl font-black text-orange-500 mb-2">B</p>
                    <p className="font-bold text-orange-700 mb-2">Border</p>
                    <p className="text-sm text-gray-700">Irregular, scalloped, or poorly defined edges</p>
                  </div>
                  <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                    <p className="text-3xl font-black text-yellow-500 mb-2">C</p>
                    <p className="font-bold text-yellow-700 mb-2">Color</p>
                    <p className="text-sm text-gray-700">Multiple colors or uneven color distribution</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all">
                    <p className="text-3xl font-black text-green-500 mb-2">D</p>
                    <p className="font-bold text-green-700 mb-2">Diameter</p>
                    <p className="text-sm text-gray-700">Larger than 6mm (about the size of a pencil eraser)</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all sm:col-span-2">
                    <p className="text-3xl font-black text-blue-500 mb-2">E</p>
                    <p className="font-bold text-blue-700 mb-2">Evolving</p>
                    <p className="text-sm text-gray-700">Currently changing in size, shape, or color (most important warning sign)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Critical Notice */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-300 to-purple-300 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-white rounded-3xl border-2 border-rose-300 p-8 sm:p-10 shadow-md">
              <h3 className="text-2xl font-black text-gray-800 mb-4">
                ⚠️ Critical: This is Not Medical Advice
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="text-lg">
                  This information is for <span className="text-rose-600 font-bold">educational purposes only.</span>
                </p>
                <p>
                  It does <span className="text-rose-600 font-bold">NOT replace professional medical diagnosis or treatment.</span>
                </p>
                <p className="text-base pt-2">
                  <span className="text-purple-700 font-bold">If you have any concerns about your skin, please consult a qualified healthcare professional immediately.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.back()}
              className="group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800 rounded-xl px-8 py-4 border-2 border-gray-400">
                ← Back
              </div>
            </button>
            <button
              onClick={() => router.push('/patient/dashboard')}
              className="group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-8 py-4 flex items-center justify-center gap-2 border-2 border-green-600">
                <Stethoscope size={20} />
                Find a Doctor
              </div>
            </button>
          </div>
        </div>
      </main>

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
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
