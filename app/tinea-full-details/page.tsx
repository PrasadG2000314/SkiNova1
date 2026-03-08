'use client';

import { useState } from 'react';
import Link from 'next/link';

const TINEA_DETAILS = [
  {
    id: 'tinea_corporis',
    name: 'Tinea Corporis (Ringworm of the Body)',
    icon: '🦵',
    area: 'Body (Arms, Legs, Chest, Back)',
    description: 'One of the most common fungal infections, appearing as circular or ring-shaped lesions.',
    color: 'from-orange-500 to-orange-600',
    symptoms: [
      'Isolated patches of itching and redness',
      'Red, raised, scaly patches that may blister',
      'Clear center of the lesion with a raised border',
      'Patches may merge or spread',
      'Pruritus (itching) especially in warm, moist environments',
      'Patches typically 1-5cm in diameter',
    ],
    causes: [
      'Direct contact with infected person or animal',
      'Contaminated clothing or bedding',
      'Poor hygiene and warm, moist environments',
      'Shared grooming tools or towels',
      'Contact with contaminated soil',
    ],
    treatment: [
      'Topical antifungals: Clotrimazole, Miconazole, Terbinafine (apply 2-3 times daily)',
      'Oral antifungals: Griseofulvin or Terbinafine for 2-4 weeks if extensive',
      'Keep area dry and clean',
      'Wear breathable, loose clothing',
      'Antifungal powder for additional protection',
      'Wash affected area gently 2-3 times daily',
    ],
    prevention: [
      'Maintain good personal hygiene',
      'Keep skin dry, especially in skin folds',
      'Avoid sharing personal items (towels, combs, clothes)',
      'Wash hands regularly, especially after touching animals',
      'Disinfect shared surfaces and equipment',
      'Avoid walking barefoot in public areas',
      'Wear clean, breathable clothing',
    ],
    duration: '2-4 weeks with treatment',
    contagious: 'Yes, until 48 hours after starting treatment',
  },
  {
    id: 'tinea_cruris',
    name: 'Tinea Cruris (Jock Itch)',
    icon: '👖',
    area: 'Groin & Inner Thighs',
    description: 'Common fungal infection affecting the groin area, more prevalent in men and in warm climates.',
    color: 'from-red-500 to-red-600',
    symptoms: [
      'Intense itching in groin area',
      'Red, inflamed patches with clear borders',
      'Scaly, flaking skin',
      'Rash often extends to buttocks and upper inner thighs',
      'Burning sensation, especially during urination',
      'Symptoms worsen with sweating and friction',
    ],
    causes: [
      'Warm, moist environment',
      'Poor hygiene in groin area',
      'Friction from tight clothing',
      'Excessive sweating (athletes, overweight individuals)',
      'Direct contact with infected person',
      'Use of contaminated towels or underwear',
    ],
    treatment: [
      'Topical antifungals: Clotrimazole, Miconazole cream (2-3 times daily)',
      'Oral antifungals if topical treatment fails after 2 weeks',
      'Keep area clean and dry',
      'Dry thoroughly after bathing',
      'Apply antifungal powder to prevent moisture buildup',
      'Continue treatment for 2 weeks after rash disappears',
    ],
    prevention: [
      'Keep groin area clean and dry',
      'Wear loose, breathable underwear',
      'Change underwear immediately after exercise or sweating',
      'Avoid sharing towels and personal items',
      'Dry thoroughly after bathing, especially between thighs',
      'Apply antifungal powder during humid weather',
      'Maintain healthy weight to reduce skin folds',
    ],
    duration: '1-2 weeks with treatment',
    contagious: 'Yes, contagious until treatment begins',
  },
  {
    id: 'tinea_pedis',
    name: 'Tinea Pedis (Athlete\'s Foot)',
    icon: '🦶',
    area: 'Feet & Between Toes',
    description: 'Most common fungal infection, especially affecting areas between toes and soles.',
    color: 'from-amber-500 to-amber-600',
    symptoms: [
      'Intense itching between toes and on soles',
      'Burning and stinging sensations',
      'Cracked, peeling, or macerated skin',
      'White, soggy skin between toes',
      'Odor from affected area',
      'Blistering and inflammation in severe cases',
      'Red, swollen appearance (acute infection)',
    ],
    causes: [
      'Fungus thrives in warm, dark, moist environments',
      'Walking barefoot in public areas (pools, gyms, locker rooms)',
      'Poor foot hygiene',
      'Excessive foot perspiration',
      'Tight footwear that promotes moisture',
      'Sharing bathmats or footwear with infected person',
    ],
    treatment: [
      'Topical antifungals: Tolnaftate, Clotrimazole, Terbinafine spray',
      'Powder formulations for moisture control',
      'Wash feet twice daily with soap and water',
      'Dry feet completely, especially between toes',
      'Oral antifungals for severe cases: Griseofulvin or Terbinafine',
      'Treatment duration: 4-6 weeks minimum',
    ],
    prevention: [
      'Wear shower shoes in communal areas (pools, gyms, locker rooms)',
      'Keep feet clean and completely dry',
      'Wear breathable shoes and moisture-wicking socks',
      'Change socks if feet get sweaty or damp',
      'Trim toenails short to prevent fungus accumulation',
      'Avoid walking barefoot except at home',
      'Use antifungal powder regularly',
    ],
    duration: '4-6 weeks with consistent treatment',
    contagious: 'Yes, highly contagious in communal areas',
  },
  {
    id: 'tinea_capitis',
    name: 'Tinea Capitis (Ringworm of the Scalp)',
    icon: '💇',
    area: 'Scalp',
    description: 'Fungal infection of the scalp, more common in children than adults.',
    color: 'from-yellow-500 to-yellow-600',
    symptoms: [
      'Scaly patches on scalp, may resemble dandruff',
      'Circular areas of hair loss (alopecia)',
      'Itching and sometimes burning sensation',
      'Crusting and inflammation',
      'Swollen lymph nodes near neck or ears',
      'In severe cases: kerion (highly inflamed pustular lesion)',
      'Hair breakage rather than hair pulling out',
    ],
    causes: [
      'Direct contact with infected person',
      'Sharing hats, combs, brushes, or headphones',
      'Contaminated barbering tools',
      'Contact with infected animals (especially cats)',
      'Poor scalp hygiene',
      'Contaminated bedding or shared hair care products',
    ],
    treatment: [
      'Oral antifungals are PRIMARY treatment (Griseofulvin, Terbinafine, Fluconazole)',
      'Duration: 4-6 weeks typically',
      'Topical shampoos: Ketoconazole or selenium sulfide (adjunct therapy)',
      'Wash scalp daily with antifungal shampoo',
      'Keep hair and scalp clean and dry',
      'Do NOT squeeze pustules (kerion)',
    ],
    prevention: [
      'Do not share hats, combs, brushes, or headphones',
      'Maintain good scalp hygiene',
      'Avoid sharing bedding or pillows',
      'Regular inspection of scalp in children',
      'Avoid close contact with infected individuals',
      'Disinfect barbering tools and equipment',
      'Minimize contact with stray animals',
    ],
    duration: '4-6 weeks with oral antifungal treatment',
    contagious: 'Yes, until 1-2 weeks after starting treatment',
  },
  {
    id: 'tinea_unguium',
    name: 'Tinea Unguium (Nail Fungus)',
    icon: '💅',
    area: 'Fingernails & Toenails',
    description: 'Fungal infection of nails causing discoloration and deformity. Toenails more affected than fingernails.',
    color: 'from-pink-500 to-pink-600',
    symptoms: [
      'Thick, brittle nails',
      'Yellow, white, or brown discoloration',
      'Nail becomes crumbly and chalky',
      'White spots or patches on nail surface',
      'Nail separation from nail bed',
      'Crumbled nail debris may fall out',
      'Nails may have ridged appearance',
    ],
    causes: [
      'Fungus enters nail through small cracks or cuts',
      'Warm, moist environment (especially toenails)',
      'Contact with contaminated nail tools',
      'Weakened immune system',
      'Poor circulation',
      'Diabetes or other health conditions',
    ],
    treatment: [
      'Oral antifungals: Terbinafine or Itraconazole (first-line treatment)',
      'Duration: 3-6 months typically',
      'Topical antifungals: Ciclopirox lacquer (adjunct only)',
      'Keep nails short and filed down',
      'File away infected nail material',
      'Nail removal may be necessary in severe cases',
    ],
    prevention: [
      'Keep nails clean and trimmed short',
      'Disinfect nail cutting tools with rubbing alcohol',
      'Dry feet thoroughly after bathing',
      'Use clean files and nail clippers',
      'Avoid sharing nail care tools',
      'Wear shower shoes in public areas',
      'Maintain good circulation and manage diabetes',
    ],
    duration: '3-6 months or longer',
    contagious: 'Moderately contagious through contaminated tools',
  },
  {
    id: 'tinea_faciei',
    name: 'Tinea Faciei (Ringworm of the Face)',
    icon: '😊',
    area: 'Face',
    description: 'Fungal infection on the face, more visible than on other body parts.',
    color: 'from-rose-500 to-rose-600',
    symptoms: [
      'Red, scaly patches on face',
      'Clear, well-defined borders of lesions',
      'Itching and mild burning',
      'May resemble other skin conditions',
      'Patches often on cheeks or forehead',
      'Lesions may appear raised and inflamed',
    ],
    causes: [
      'Direct contact with infected person',
      'Contaminated cosmetics or skincare products',
      'Poor facial hygiene',
      'Sharing towels or face cloths',
      'Contact with contaminated objects',
    ],
    treatment: [
      'Topical antifungals: Clotrimazole, Miconazole cream (2-3 times daily)',
      'Avoid heavy makeup during treatment',
      'Wash face gently with mild soap',
      'Apply treatment for 2-4 weeks',
      'Keep face dry and clean',
      'Oral antifungals if topical treatment fails',
    ],
    prevention: [
      'Do not share towels or face cloths',
      'Use clean makeup applicators only',
      'Avoid sharing cosmetics or skincare products',
      'Maintain good facial hygiene',
      'Wash hands before touching face',
      'Avoid close contact with infected people',
    ],
    duration: '2-4 weeks with treatment',
    contagious: 'Yes, contagious through direct contact',
  },
  {
    id: 'tinea_barbae',
    name: 'Tinea Barbae (Ringworm of the Beard)',
    icon: '🧔',
    area: 'Beard & Mustache',
    description: 'Fungal infection affecting the beard and adjacent skin. More common in men.',
    color: 'from-stone-500 to-stone-600',
    symptoms: [
      'Red, inflamed patches in beard area',
      'Easy breakage of beard hair',
      'Hair loss in affected areas',
      'Pustules or nodules under hair',
      'Itching and tenderness',
      'Swollen lymph nodes (sometimes)',
      'Kerion formation in severe cases',
    ],
    causes: [
      'Direct contact with infected person or animal',
      'Contaminated barbering tools',
      'Poor shaving hygiene',
      'Sharing razors or shaving equipment',
      'Skin cuts from shaving',
    ],
    treatment: [
      'Oral antifungals: Griseofulvin or Terbinafine (typically required)',
      'Duration: 2-4 weeks',
      'Topical antifungals as adjunct therapy',
      'Do not shave affected beard area',
      'Wash beard gently with antifungal shampoo',
      'Keep area clean and dry',
    ],
    prevention: [
      'Use clean razor or electric shaver only',
      'Do not share razors or shaving equipment',
      'Wash hands before shaving',
      'Maintain clean barbering tools',
      'Avoid close shaving if skin is irritated',
      'Avoid contact with infected individuals',
    ],
    duration: '2-4 weeks with oral antifungal',
    contagious: 'Yes, contagious through direct contact',
  },
];

export default function TineaFullDetails() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <Link href="/dosha-quiz" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6">
            ← Back to Dosha Quiz
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            🍄 Complete Tinea Guide
          </h1>
          <p className="text-xl text-gray-300">
            Comprehensive information about all types of fungal infections, their symptoms, treatment, and prevention
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-amber-400">7</div>
            <div className="text-gray-300">Types of Tinea</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-orange-400">1-6</div>
            <div className="text-gray-300">Weeks Treatment Duration</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-red-400">90%+</div>
            <div className="text-gray-300">Cure Rate with Treatment</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">100%</div>
            <div className="text-gray-300">Preventable</div>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-8 border border-blue-500/30 mb-12">
          <h2 className="text-3xl font-bold mb-6">What is Tinea?</h2>
          <div className="space-y-4 text-gray-200">
            <p>
              Tinea is a fungal infection caused by dermatophytes (fungi that feed on dead skin, hair, and nails). These infections are also commonly called "ringworm," though they're not caused by worms.
            </p>
            <p>
              <span className="font-bold text-amber-400">Key Facts:</span>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Affects up to 20-25% of the world's population at any given time</li>
              <li>Can spread through direct contact with infected skin or contaminated objects</li>
              <li>Thrives in warm, moist, dark environments</li>
              <li>More common in warm climates and during summer months</li>
              <li>Highly treatable with proper medication and hygiene</li>
            </ul>
          </div>
        </div>

        {/* Detailed Information for Each Type */}
        <div className="space-y-6">
          {TINEA_DETAILS.map((tinea) => (
            <div key={tinea.id} className="border border-white/20 rounded-xl overflow-hidden hover:border-white/40 transition-all">
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === tinea.id ? null : tinea.id)}
                className="w-full"
              >
                <div className={`bg-gradient-to-r ${tinea.color} p-6 hover:shadow-xl transition-all cursor-pointer`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{tinea.icon}</span>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-white">{tinea.name}</h3>
                        <p className="text-white/80 text-sm">{tinea.area}</p>
                      </div>
                    </div>
                    <span className="text-3xl text-white/80">
                      {expandedId === tinea.id ? '−' : '+'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === tinea.id && (
                <div className="bg-slate-800/50 p-8 space-y-8 border-t border-white/20">
                  <div>
                    <p className="text-gray-300 text-lg mb-4">{tinea.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Symptoms */}
                    <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                      <h4 className="text-xl font-bold text-blue-300 mb-4">🔍 Symptoms</h4>
                      <ul className="space-y-2">
                        {tinea.symptoms.map((symptom, i) => (
                          <li key={i} className="flex gap-2 text-gray-300">
                            <span className="text-blue-400 mt-1">✓</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Causes */}
                    <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
                      <h4 className="text-xl font-bold text-yellow-300 mb-4">⚠️ Causes</h4>
                      <ul className="space-y-2">
                        {tinea.causes.map((cause, i) => (
                          <li key={i} className="flex gap-2 text-gray-300">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Treatment */}
                    <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                      <h4 className="text-xl font-bold text-green-300 mb-4">💊 Treatment</h4>
                      <ul className="space-y-2">
                        {tinea.treatment.map((treatment, i) => (
                          <li key={i} className="flex gap-2 text-gray-300">
                            <span className="text-green-400 mt-1">→</span>
                            <span>{treatment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention */}
                    <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                      <h4 className="text-xl font-bold text-purple-300 mb-4">🛡️ Prevention</h4>
                      <ul className="space-y-2">
                        {tinea.prevention.map((prevention, i) => (
                          <li key={i} className="flex gap-2 text-gray-300">
                            <span className="text-purple-400 mt-1">✓</span>
                            <span>{prevention}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="text-lg font-bold text-amber-400">{tinea.duration}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Contagious</div>
                      <div className="text-lg font-bold text-red-400">{tinea.contagious}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Severity</div>
                      <div className="text-lg font-bold text-orange-400">Treatable</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* General Tips */}
        <div className="mt-12 bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-8 border border-green-500/30">
          <h2 className="text-3xl font-bold mb-6">💡 General Tips for All Tinea Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-green-300 mb-4">When to See a Doctor</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✓ No improvement after 2 weeks of treatment</li>
                <li>✓ Infection spreads or gets worse</li>
                <li>✓ Signs of secondary bacterial infection (pus, increasing redness)</li>
                <li>✓ Severe symptoms affecting daily life</li>
                <li>✓ Immunocompromised (HIV, diabetes, etc.)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-teal-300 mb-4">Treatment Tips</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✓ Continue treatment 1-2 weeks after symptom disappearance</li>
                <li>✓ Do not stop early even if skin looks better</li>
                <li>✓ Apply medication exactly as directed</li>
                <li>✓ Keep affected area clean, dry, and uncovered when possible</li>
                <li>✓ Wash hands after treatment application</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
