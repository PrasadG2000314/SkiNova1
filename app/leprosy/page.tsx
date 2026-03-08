"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LeprosyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 font-semibold mb-8"
        >
          ← Back to Home
        </Link>

        {/* Main Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 mb-12 shadow-xl">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Infectious bacterial disease
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Leprosy (Hansen's Disease)</h1>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                A chronic infectious disease caused by Mycobacterium leprae. Early detection and treatment can prevent disability and complications. Explore our comprehensive tools for detection and management.
              </p>
            </div>
            <div className="text-6xl">🔬</div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          <button
            onClick={() => router.push("/leprosy/detect")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-blue-200 hover:border-blue-500"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Detection Tool</h3>
            <p className="text-gray-600 mb-4">Upload images for AI-powered leprosy detection</p>
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
              Start Detection →
            </span>
          </button>

          <button
            onClick={() => router.push("/leprosy/assistant")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-indigo-200 hover:border-indigo-500"
          >
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Assistant</h3>
            <p className="text-gray-600 mb-4">Chat with our intelligent leprosy assistant</p>
            <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold text-sm">
              Open Assistant →
            </span>
          </button>

          <button
            onClick={() => router.push("/leprosy/predict")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-purple-200 hover:border-purple-500"
          >
            <div className="text-4xl mb-3">🧬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Type Prediction</h3>
            <p className="text-gray-600 mb-4">Classify leprosy type from clinical measurements</p>
            <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm">
              Run Prediction →
            </span>
          </button>
        </div>

        {/* Information Content */}
        <div className="space-y-8">
          {/* What is Leprosy */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Leprosy (Hansen's Disease)?</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Leprosy is a chronic infectious disease caused by the bacterium Mycobacterium leprae. It primarily affects the skin and peripheral nerves. With early detection and proper treatment, it is curable and disability can be prevented. The disease has been largely eliminated in most countries through antibiotic therapy.
            </p>
          </section>

          {/* Symptoms */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Symptoms</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 bg-blue-50 p-5 rounded-2xl">
                <span className="text-3xl">🟤</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Skin Patches</p>
                  <p className="text-gray-600">Pale or hypopigmented spots on the skin</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-indigo-50 p-5 rounded-2xl">
                <span className="text-3xl">🔴</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Loss of Sensation</p>
                  <p className="text-gray-600">Numbness or decreased feeling in affected areas</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-purple-50 p-5 rounded-2xl">
                <span className="text-3xl">💪</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Muscle Weakness</p>
                  <p className="text-gray-600">Weakness in hands, feet, and facial muscles</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-pink-50 p-5 rounded-2xl">
                <span className="text-3xl">👁️</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Eye Problems</p>
                  <p className="text-gray-600">Eye inflammation or vision changes</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-cyan-50 p-5 rounded-2xl">
                <span className="text-3xl">🦴</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Nerve Pain</p>
                  <p className="text-gray-600">Painful or thickened peripheral nerves</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-teal-50 p-5 rounded-2xl">
                <span className="text-3xl">⚡</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Slow Symptoms</p>
                  <p className="text-gray-600">Symptoms develop slowly over months or years</p>
                </div>
              </div>
            </div>
          </section>

          {/* Types of Leprosy */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Classification of Leprosy</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-l-4 border-blue-500 pl-5 py-3 bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Tuberculoid Leprosy</p>
                <p className="text-sm text-gray-600">Few skin lesions, strong immune response, limited transmission</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-5 py-3 bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Lepromatous Leprosy</p>
                <p className="text-sm text-gray-600">Extensive skin lesions, weak immune response, highly infectious</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-5 py-3 bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Borderline Tuberculoid</p>
                <p className="text-sm text-gray-600">Intermediate features, moderate immune response</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-5 py-3 bg-pink-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Borderline Lepromatous</p>
                <p className="text-sm text-gray-600">More extensive lesions, weaker immune response</p>
              </div>
            </div>
          </section>

          {/* Transmission and Risk */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Transmission & Risk Factors</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-2xl mb-6">
              <p className="font-semibold text-gray-900 text-lg mb-3">How is Leprosy Transmitted?</p>
              <p className="text-gray-700">
                Leprosy spreads through respiratory droplets from an untreated patient with lepromatous or borderline lepromatous leprosy. Close, prolonged contact is usually needed. The risk is significantly reduced with proper treatment.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                "Prolonged contact with untreated leprosy patient",
                "Close family members (higher exposure)",
                "Poor living conditions and hygiene",
                "Malnutrition or immunosuppression",
                "Genetic predisposition",
                "Living in endemic areas"
              ].map((risk, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg">
                  <span className="text-orange-500 font-bold text-xl">⚠️</span>
                  <span className="text-gray-700">{risk}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Treatment Options */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Treatment & Cure</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-green-50 p-5 rounded-2xl border-l-4 border-green-500">
                <p className="font-semibold text-gray-900 text-lg">💊 Multidrug Therapy (MDT)</p>
                <p className="text-gray-600 mt-2">WHO-recommended combination of antibiotics for 6-12 months</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border-l-4 border-blue-500">
                <p className="font-semibold text-gray-900 text-lg">✓ Highly Effective</p>
                <p className="text-gray-600 mt-2">Over 95% cure rate when completed properly</p>
              </div>
              <div className="bg-yellow-50 p-5 rounded-2xl border-l-4 border-yellow-500">
                <p className="font-semibold text-gray-900 text-lg">⏱️ Early Detection</p>
                <p className="text-gray-600 mt-2">Early treatment prevents disability and transmission</p>
              </div>
              <div className="bg-purple-50 p-5 rounded-2xl border-l-4 border-purple-500">
                <p className="font-semibold text-gray-900 text-lg">🏥 Free Treatment</p>
                <p className="text-gray-600 mt-2">MDT is available free through health programs</p>
              </div>
            </div>
          </section>

          {/* Prevention */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Prevention & Management</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Seek early diagnosis if symptoms appear",
                "Complete full course of MDT treatment",
                "Regular follow-up examinations",
                "Good nutrition and hygiene practices",
                "Protect skin from injuries",
                "Proper footwear to prevent ulcers",
                "Eye care to prevent blindness",
                "Mental health support for patients",
                "Educate family members",
                "Early intervention for permanent disabilities"
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* When to Seek Help */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">When to Seek Medical Help</h2>
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
              <p className="text-gray-700 font-semibold text-lg mb-4">
                Consult a healthcare provider immediately if you have:
              </p>
              <ul className="space-y-2">
                {[
                  "Pale or reddish skin patches with loss of sensation",
                  "Numbness or weakness in hands, feet, or face",
                  "Thickened or tender peripheral nerves",
                  "Eye inflammation or vision problems",
                  "Symptoms that persist for more than a few weeks",
                  "Suspected exposure to leprosy"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <span className="text-red-500 font-bold">🚨</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Important Note */}
          <section className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">💡 Important Note</h2>
            <p className="text-white/95 leading-relaxed">
              Leprosy is a treatable disease, not a curse. With early diagnosis and complete treatment, recovery is possible with minimal or no disability. Our AI detection tool and assistant are designed to help with early identification. Always consult qualified healthcare professionals for diagnosis and treatment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
