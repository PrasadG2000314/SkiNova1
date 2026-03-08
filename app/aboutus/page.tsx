"use client";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            About skinova
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing skin health through AI-powered diagnostics and personalized care.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              skinova is dedicated to making dermatological care accessible to everyone. We combine cutting-edge AI 
              technology with medical expertise to provide accurate skin disease detection and personalized treatment plans.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🩺</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Expert Diagnostics</h3>
                <p className="text-gray-600">AI-powered analysis with doctor-level accuracy</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Mobile Access</h3>
                <p className="text-gray-600">Instant analysis from your smartphone</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl p-12 shadow-2xl">
              <div className="text-white text-center">
                <h3 className="text-4xl font-bold mb-4">4</h3>
                <p className="text-xl">Skin Conditions Detected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">👨‍⚕️</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Dr. Medical Expert</h3>
              <p className="text-gray-600 mb-4">Chief Dermatologist</p>
              <p className="text-sm text-gray-500">20+ years experience in skin disease diagnosis</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="font-bold text-xl mb-2">AI Specialist</h3>
              <p className="text-gray-600 mb-4">Machine Learning Engineer</p>
              <p className="text-sm text-gray-500">Specialist in computer vision & deep learning</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Product Lead</h3>
              <p className="text-gray-600 mb-4">Healthcare Innovator</p>
              <p className="text-sm text-gray-500">Building accessible health solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
