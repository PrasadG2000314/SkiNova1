"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PsoriasisPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold mb-8"
        >
          ← Back to Home
        </Link>

        {/* Main Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 sm:p-12 mb-12 shadow-xl">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Chronic immune-driven
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Psoriasis</h1>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                Patches of skin grow too quickly, piling into thick, silvery-red plates that may itch, sting, or crack. Often linked with stress, genetics, and immune over-activity.
              </p>
            </div>
            <div className="text-6xl">💊</div>
          </div>
        </div>

        {/* Information Content */}
        <div className="space-y-8">
          {/* What is Psoriasis */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Psoriasis?</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Psoriasis is a chronic autoimmune skin condition where the body's immune system attacks healthy skin cells, causing them to multiply rapidly. This results in thick, scaly patches that are often red, inflamed, and itchy. It typically appears on the elbows, knees, scalp, and lower back, but can occur anywhere on the body.
            </p>
          </section>

          {/* Symptoms */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Symptoms</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 bg-purple-50 p-5 rounded-2xl">
                <span className="text-3xl">🔴</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Red, Inflamed Patches</p>
                  <p className="text-gray-600">Thick, scaly plaques on the skin</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-pink-50 p-5 rounded-2xl">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Itching & Burning</p>
                  <p className="text-gray-600">Intense itching and pain</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-red-50 p-5 rounded-2xl">
                <span className="text-3xl">💔</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Cracked Skin</p>
                  <p className="text-gray-600">May bleed and become infected</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-orange-50 p-5 rounded-2xl">
                <span className="text-3xl">💅</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Nail Changes</p>
                  <p className="text-gray-600">Pitting, discoloration, or thickening</p>
                </div>
              </div>
            </div>
          </section>

          {/* Types of Psoriasis */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Psoriasis</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-l-4 border-purple-500 pl-5 py-3 bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Plaque Psoriasis</p>
                <p className="text-sm text-gray-600">Most common type (80-90% of cases) with thick, scaly plaques</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-5 py-3 bg-pink-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Guttate Psoriasis</p>
                <p className="text-sm text-gray-600">Small, drop-shaped lesions often triggered by infection</p>
              </div>
              <div className="border-l-4 border-red-500 pl-5 py-3 bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Inverse Psoriasis</p>
                <p className="text-sm text-gray-600">Smooth lesions in skin folds, less visible but irritating</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-5 py-3 bg-orange-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 text-lg">Pustular Psoriasis</p>
                <p className="text-sm text-gray-600">Pus-filled bumps, rare and severe form</p>
              </div>
            </div>
          </section>

          {/* Triggers */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Triggers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {["Stress & Anxiety", "Infections", "Cold Weather", "Skin Injuries", "Medications", "Alcohol", "Smoking", "Poor Sleep"].map((trigger) => (
                <div key={trigger} className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl text-gray-900 font-medium text-center">
                  ⚠️ {trigger}
                </div>
              ))}
            </div>
          </section>

          {/* Treatment Options */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Treatment Options</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-blue-50 p-5 rounded-2xl border-l-4 border-blue-500">
                <p className="font-semibold text-gray-900 text-lg">💊 Topical Treatments</p>
                <p className="text-gray-600 mt-2">Creams, ointments, and lotions containing corticosteroids or vitamin D</p>
              </div>
              <div className="bg-green-50 p-5 rounded-2xl border-l-4 border-green-500">
                <p className="font-semibold text-gray-900 text-lg">☀️ Phototherapy</p>
                <p className="text-gray-600 mt-2">UV light therapy to reduce inflammation and improve skin health</p>
              </div>
              <div className="bg-yellow-50 p-5 rounded-2xl border-l-4 border-yellow-500">
                <p className="font-semibold text-gray-900 text-lg">💉 Systemic Medications</p>
                <p className="text-gray-600 mt-2">Oral or injectable medications for severe cases</p>
              </div>
              <div className="bg-purple-50 p-5 rounded-2xl border-l-4 border-purple-500">
                <p className="font-semibold text-gray-900 text-lg">🧬 Biologics</p>
                <p className="text-gray-600 mt-2">Targeted therapies that modify immune response</p>
              </div>
            </div>
          </section>

          {/* Self-Care Tips */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Self-Care & Management Tips</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Keep skin moisturized with fragrance-free lotions",
                "Take short, lukewarm baths instead of hot showers",
                "Use gentle, fragrance-free soaps",
                "Avoid scratching - use moisturizer instead",
                "Manage stress through meditation or exercise",
                "Avoid triggers like cold weather and infections",
                "Wear soft, breathable clothing",
                "Stay hydrated by drinking plenty of water",
                "Limit alcohol and avoid smoking",
                "Get regular sleep and exercise"
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* When to See a Doctor */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">When to See a Dermatologist</h2>
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
              <p className="text-gray-700 font-semibold text-lg mb-4">
                Seek professional medical advice if psoriasis is:
              </p>
              <ul className="space-y-2">
                {[
                  "Covering a large area of your body",
                  "Causing severe pain or itching",
                  "Affecting your joints (arthritis symptoms)",
                  "Interfering with daily activities",
                  "Not responding to home treatments"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    <span className="text-red-500 font-bold">⚠️</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
