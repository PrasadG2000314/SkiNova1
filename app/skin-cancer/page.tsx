'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, AlertCircle, Droplet, Heart, CheckCircle, Sun, Zap, Eye, Users, TrendingUp, Award } from 'lucide-react';

export default function SkinCancer() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Skin Cancer Information</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Hero Section with Visual */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center gap-3">
                  <Shield className="text-yellow-300" size={40} />
                  Protect Your Skin
                </h2>
                <p className="text-lg text-blue-50 leading-relaxed mb-6">
                  Skin cancer is the most common type of cancer globally, but with early detection and proper prevention, 90% of cases can be successfully treated.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <p className="text-white text-sm">Early Detection</p>
                    <p className="text-2xl font-bold text-yellow-300">90%</p>
                    <p className="text-xs text-blue-100">Success Rate</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <p className="text-white text-sm">Prevention Impact</p>
                    <p className="text-2xl font-bold text-yellow-300">60%</p>
                    <p className="text-xs text-blue-100">Risk Reduction</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-full min-h-300">
                  {/* Animated skin illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                      {/* Outer glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                      
                      {/* Main circle */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                        {/* Inner pattern */}
                        <div className="text-center">
                          <Sun className="w-20 h-20 text-orange-500 mx-auto mb-2 animate-spin" style={{ animationDuration: '6s' }} />
                          <p className="text-white font-bold text-sm">UV Protection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section with Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="text-blue-600" size={32} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Most Common Cancer</p>
                  <p className="text-2xl font-bold text-blue-600">1 in 5</p>
                  <p className="text-xs text-gray-500">Americans diagnosed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={32} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Early Detection</p>
                  <p className="text-2xl font-bold text-green-600">5-Year</p>
                  <p className="text-xs text-gray-500">Survival Rate: 99%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="text-purple-600" size={32} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Prevention Works</p>
                  <p className="text-2xl font-bold text-purple-600">80%</p>
                  <p className="text-xs text-gray-500">Preventable cases</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Types of Skin Cancer with Enhanced Visuals */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Types of Skin Cancer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basal Cell Carcinoma */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105">
              {/* Image placeholder with gradient */}
              <div className="h-40 bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
                    <div className="bg-blue-300 rounded-lg"></div>
                    <div className="bg-blue-400 rounded-lg"></div>
                    <div className="bg-cyan-300 rounded-lg"></div>
                    <div className="bg-cyan-400 rounded-lg"></div>
                  </div>
                </div>
                <div className="relative z-10 text-center">
                  <Droplet className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">Most Common (80%)</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Basal Cell Carcinoma</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The most common type of skin cancer. Usually appears as a waxy, translucent bump or a red, scaly patch. Grows slowly and rarely spreads.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Color:</strong> Pale or pearly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Growth:</strong> Slow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Spread Risk:</strong> Very low</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-800"><strong>Survival Rate:</strong> 99%+ when treated early</p>
                </div>
              </div>
            </div>

            {/* Squamous Cell Carcinoma */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105">
              {/* Image placeholder with gradient */}
              <div className="h-40 bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-orange-300 rounded-lg transform rotate-45 animate-pulse"></div>
                  </div>
                </div>
                <div className="relative z-10 text-center">
                  <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">Second Most Common</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Squamous Cell Carcinoma</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The second most common type. Appears as a red, scaly, or crusty bump. Grows faster than basal cell and has higher spread risk if untreated.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Color:</strong> Red or brown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Growth:</strong> Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Spread Risk:</strong> Moderate</span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-800"><strong>Survival Rate:</strong> 95%+ when caught early</p>
                </div>
              </div>
            </div>

            {/* Melanoma */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105 border-2 border-red-200">
              {/* Image placeholder with gradient */}
              <div className="h-40 bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-red-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="relative z-10 text-center">
                  <Heart className="w-16 h-16 text-white mx-auto mb-2 animate-pulse" />
                  <p className="text-white font-bold text-sm">Most Serious</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Melanoma ⚠️</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The most serious type of skin cancer. Develops in melanocytes and can spread to other organs. Early detection is critical for survival.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Color:</strong> Dark, irregular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Growth:</strong> Fast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-sm text-gray-600"><strong>Spread Risk:</strong> High</span>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-800"><strong>Survival Rate:</strong> 99% if caught in Stage 1</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Factors Visual */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Risk Factors Explained</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Factors */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <Sun className="text-yellow-500" size={28} />
                Environmental Risk Factors
              </h3>
              <div className="space-y-4">
                {[
                  { factor: 'UV Exposure', severity: 'Critical', progress: 95 },
                  { factor: 'Sunburns', severity: 'High', progress: 85 },
                  { factor: 'Tanning Beds', severity: 'High', progress: 80 },
                  { factor: 'Reflective Surfaces', severity: 'Medium', progress: 60 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{item.factor}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        item.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                        item.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.severity === 'Critical' ? 'bg-red-500' :
                          item.severity === 'High' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Factors */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-3">
                <Users className="text-purple-600" size={28} />
                Personal Risk Factors
              </h3>
              <div className="space-y-4">
                {[
                  { factor: 'Family History', severity: 'High', progress: 70 },
                  { factor: 'Multiple Moles', severity: 'High', progress: 75 },
                  { factor: 'Fair Skin', severity: 'High', progress: 80 },
                  { factor: 'Age', severity: 'Medium', progress: 55 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{item.factor}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        item.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                        item.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.severity === 'Critical' ? 'bg-red-500' :
                          item.severity === 'High' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABCDE Rule - Enhanced Visual */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">The ABCDE Rule for Melanoma</h2>
          <div className="bg-gradient-to-br from-red-50 via-pink-50 to-red-50 rounded-2xl shadow-xl border-2 border-red-300 p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-red-600" size={32} />
              <p className="text-gray-700 font-semibold">Learn to identify dangerous moles. Consult a dermatologist immediately if any apply.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { letter: 'A', title: 'Asymmetry', desc: 'One half doesn\'t match the other' },
                { letter: 'B', title: 'Border', desc: 'Jagged, scalloped, or notched edges' },
                { letter: 'C', title: 'Color', desc: 'Multiple colors (brown, black, red, blue)' },
                { letter: 'D', title: 'Diameter', desc: 'Larger than 6mm (pencil eraser size)' },
                { letter: 'E', title: 'Evolution', desc: 'Changing in size, shape, or color' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-3xl">{item.letter}</span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Visual Examples */}
            <div className="mt-8 pt-8 border-t-2 border-red-300">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Visual Guide</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">Asymmetrical Mole</span>
                  </div>
                  <p className="text-xs text-gray-700">Notice how the left side differs from the right side - this is a warning sign.</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="w-full h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">Multiple Colors</span>
                  </div>
                  <p className="text-xs text-gray-700">Multiple shades within one mole (brown, black, red) requires evaluation.</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="w-full h-32 bg-gradient-to-br from-red-300 to-purple-300 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">Changing Mole</span>
                  </div>
                  <p className="text-xs text-gray-700">Any change in size, shape, or color over time is concerning.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Symptoms Visual */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Warning Signs to Watch For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🔴', symptom: 'New Moles', desc: 'Sudden appearance of new moles' },
              { icon: '🔺', symptom: 'Size Change', desc: 'Mole growing larger over months' },
              { icon: '🎨', symptom: 'Color Change', desc: 'Mole darkening or changing color' },
              { icon: '✂️', symptom: 'Itching', desc: 'Persistent itching or tenderness' },
              { icon: '💧', symptom: 'Bleeding', desc: 'Bleeding or oozing from mole' },
              { icon: '⚠️', symptom: 'Asymmetry', desc: 'Uneven shape or irregular borders' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 border-l-4 border-red-500">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-gray-800 mb-2">{item.symptom}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prevention Tips - Visual Checklist */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Prevention Checklist</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { category: 'Daily Habits', icon: '☀️', tips: [
                'Apply SPF 30+ sunscreen daily',
                'Reapply every 2 hours',
                'Wear UV-blocking clothing',
                'Use wide-brimmed hat'
              ]},
              { category: 'Lifestyle', icon: '🏃', tips: [
                'Avoid peak sun hours (10 AM - 4 PM)',
                'Stay in shade when possible',
                'Avoid tanning beds completely',
                'Check medications for sun sensitivity'
              ]},
              { category: 'Monitoring', icon: '🔍', tips: [
                'Monthly self-skin checks',
                'Annual dermatologist visit',
                'Photo documentation of moles',
                'Track any changes'
              ]},
              { category: 'Family Care', icon: '👨‍👩‍👧‍👦', tips: [
                'Protect children with sunscreen',
                'Teach sun safety habits',
                'Model healthy behavior',
                'Regular family check-ups'
              ]},
            ].map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-3xl">{section.icon}</span>
                  {section.category}
                </h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline for Early Detection */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Early Detection Timeline</h2>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {[
                { stage: 'Stage 1', survival: '99%', desc: 'Cancer limited to skin surface', color: 'bg-green-100 border-green-500' },
                { stage: 'Stage 2', survival: '85-95%', desc: 'Cancer in dermis layer', color: 'bg-yellow-100 border-yellow-500' },
                { stage: 'Stage 3', survival: '50-70%', desc: 'Lymph node involvement', color: 'bg-orange-100 border-orange-500' },
                { stage: 'Stage 4', survival: '15-20%', desc: 'Spread to distant organs', color: 'bg-red-100 border-red-500' },
              ].map((item, i) => (
                <div key={i} className={`border-l-4 ${item.color} rounded-r-lg p-6`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-xl text-gray-800">{item.stage}</h4>
                    <span className="text-lg font-bold text-gray-700">{item.survival}</span>
                  </div>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-800 font-semibold">
                💡 <strong>Key Insight:</strong> Early detection improves survival rates by up to 99%! Monthly self-checks and annual dermatology visits are your best defense.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 rounded-2xl shadow-2xl p-8 sm:p-12 text-center text-white overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Take Action Today 🛡️</h2>
              <p className="text-lg mb-8 text-blue-50 max-w-2xl mx-auto">
                Your skin is your body's largest organ. Regular monitoring and early detection can save your life. Start with a self-examination today and schedule a dermatologist appointment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => router.push('/patient/reports')}
                  className="px-8 py-4 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-lg hover:shadow-xl border-2 border-white"
                >
                  View Your Skin Reports
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center py-8 border-t-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">Consult with our healthcare professionals for personalized skin cancer prevention and detection advice.</p>
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg">
            Schedule a Consultation
          </button>
        </section>

        {/* Footer Spacing */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
