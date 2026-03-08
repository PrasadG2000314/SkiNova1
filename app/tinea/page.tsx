'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tineaModel } from './tineaModelClient';

interface TineaResult {
  success: boolean;
  tineaType?: string;
  confidence?: number;
  affected_area?: string;
  severity?: string;
  recommendations?: string[];
  details?: string;
  totalInferences?: number;
  message?: string;
  error?: string;
}

interface DoishaResult {
  dominantDoisha: 'vata' | 'pitta' | 'kapha';
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  characteristics: string[];
  recommendations: string[];
  skinAdvice: string[];
}

const TINEA_TYPES = [
  {
    id: 'tinea_corporis',
    name: 'Tinea Corporis',
    area: 'Body (Arms, Legs, Chest, Back)',
    description: 'Circular or ring-shaped red rash with raised, scaly edges',
    icon: '🦵',
    symptoms: ['Red rash', 'Itching', 'Raised edges', 'Clear center'],
    color: 'from-orange-100 to-orange-200'
  },
  {
    id: 'tinea_cruris',
    name: 'Tinea Cruris',
    area: 'Groin & Inner Thighs',
    description: 'Red, itchy rash with clear borders and scaling',
    icon: '👖',
    symptoms: ['Groin rash', 'Clear borders', 'Worse with sweating', 'Scaling'],
    color: 'from-red-100 to-red-200'
  },
  {
    id: 'tinea_pedis',
    name: 'Tinea Pedis',
    area: 'Feet & Between Toes',
    description: 'Itching and burning with cracked, peeling skin',
    icon: '🦶',
    symptoms: ['Itching between toes', 'Cracked skin', 'White soggy skin', 'Burning'],
    color: 'from-amber-100 to-amber-200'
  },
  {
    id: 'tinea_capitis',
    name: 'Tinea Capitis',
    area: 'Scalp',
    description: 'Scaly patches, hair loss, and possible swelling',
    icon: '💇',
    symptoms: ['Scaly patches', 'Hair loss', 'Swelling', 'Pus (kerion)'],
    color: 'from-yellow-100 to-yellow-200'
  },
  {
    id: 'tinea_unguium',
    name: 'Tinea Unguium',
    area: 'Fingernails & Toenails',
    description: 'Thick, discolored, brittle nails that crumble',
    icon: '💅',
    symptoms: ['Thick nails', 'Yellow/white color', 'Brittle', 'Nail separation'],
    color: 'from-pink-100 to-pink-200'
  },
  {
    id: 'tinea_faciei',
    name: 'Tinea Faciei',
    area: 'Face',
    description: 'Red, scaly patches on face with clear borders',
    icon: '😊',
    symptoms: ['Red patches', 'Scaling', 'Clear borders', 'Itching'],
    color: 'from-rose-100 to-rose-200'
  },
  {
    id: 'tinea_barbae',
    name: 'Tinea Barbae',
    area: 'Beard & Mustache',
    description: 'Red, swollen patches with easy hair breakage',
    icon: '🧔',
    symptoms: ['Red patches', 'Hair loss', 'Swelling', 'Nodules'],
    color: 'from-red-100 to-orange-200'
  },
];

const DOISHA_QUESTIONS = [
  {
    id: 1,
    question: 'What is your body frame?',
    answers: [
      { text: 'Thin, light frame', doisha: 'vata' as const, value: 1 },
      { text: 'Medium, athletic frame', doisha: 'pitta' as const, value: 1 },
      { text: 'Larger, sturdy frame', doisha: 'kapha' as const, value: 1 }
    ]
  },
  {
    id: 2,
    question: 'How is your skin typically?',
    answers: [
      { text: 'Dry, thin', doisha: 'vata' as const, value: 1 },
      { text: 'Warm, oily, sensitive', doisha: 'pitta' as const, value: 1 },
      { text: 'Thick, oily, smooth', doisha: 'kapha' as const, value: 1 }
    ]
  },
  {
    id: 3,
    question: 'What is your digestion like?',
    answers: [
      { text: 'Irregular, variable', doisha: 'vata' as const, value: 1 },
      { text: 'Strong, quick', doisha: 'pitta' as const, value: 1 },
      { text: 'Slow, heavy', doisha: 'kapha' as const, value: 1 }
    ]
  },
  {
    id: 4,
    question: 'How do you handle change?',
    answers: [
      { text: 'Adaptable but anxious', doisha: 'vata' as const, value: 1 },
      { text: 'Focused and driven', doisha: 'pitta' as const, value: 1 },
      { text: 'Resistant but steady', doisha: 'kapha' as const, value: 1 }
    ]
  },
  {
    id: 5,
    question: 'What is your sleep pattern?',
    answers: [
      { text: 'Light, variable', doisha: 'vata' as const, value: 1 },
      { text: 'Moderate, waking easily', doisha: 'pitta' as const, value: 1 },
      { text: 'Deep, heavy sleeper', doisha: 'kapha' as const, value: 1 }
    ]
  },
  {
    id: 6,
    question: 'How do you handle stress?',
    answers: [
      { text: 'With worry and anxiety', doisha: 'vata' as const, value: 1 },
      { text: 'With irritability', doisha: 'pitta' as const, value: 1 },
      { text: 'With withdrawal', doisha: 'kapha' as const, value: 1 }
    ]
  }
];

const DOISHA_INFO = {
  vata: {
    name: 'Vata (Air & Space)',
    color: 'from-blue-100 to-blue-200',
    icon: '🌬️',
    description: 'Vata is associated with movement, creativity, and change. Vata types are often creative, energetic, and adaptable.',
    characteristics: ['Creative and imaginative', 'Quick learner', 'Adaptable to change', 'Enthusiastic', 'Light sleeper'],
    skinAdvice: [
      'Keep skin well moisturized',
      'Use warming oils for massage',
      'Avoid excessive air exposure',
      'Maintain regular sleep schedule',
      'Eat warm, grounding foods'
    ],
    tineaRisk: 'Moderate - Dry skin may be affected by scaling types'
  },
  pitta: {
    name: 'Pitta (Fire & Water)',
    color: 'from-orange-100 to-orange-200',
    icon: '🔥',
    description: 'Pitta is associated with transformation, metabolism, and intelligence. Pitta types are often ambitious, focused, and sharp.',
    characteristics: ['Sharp intellect', 'Good metabolism', 'Strong digestion', 'Determined', 'Heat sensitive'],
    skinAdvice: [
      'Keep skin cool with aloe vera',
      'Use cooling oils',
      'Avoid spicy foods',
      'Reduce sun exposure',
      'Manage stress and anger'
    ],
    tineaRisk: 'Higher - Inflammatory conditions may worsen fungal issues'
  },
  kapha: {
    name: 'Kapha (Earth & Water)',
    color: 'from-green-100 to-green-200',
    icon: '🌍',
    description: 'Kapha is associated with structure, stability, and grounding. Kapha types are often calm, steady, and nurturing.',
    characteristics: ['Calm and patient', 'Strong constitution', 'Good endurance', 'Stable emotions', 'Steady'],
    skinAdvice: [
      'Keep skin dry and clean',
      'Use warming, stimulating oils',
      'Increase physical activity',
      'Avoid heavy, oily foods',
      'Maintain good circulation'
    ],
    tineaRisk: 'Moderate to Higher - Moisture retention may favor fungal growth'
  }
};

export default function TinePage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TineaResult | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'detect'>('info');
  const [detectionMode, setDetectionMode] = useState<'tinea' | 'doisha'>('tinea');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [doishaAnswers, setDoishaAnswers] = useState<string[]>([]);
  const [doishaResult, setDoishaResult] = useState<DoishaResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError('');
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  };

  // Initialize TensorFlow.js model on component mount
  useEffect(() => {
    const initializeModel = async () => {
      try {
        console.log('[Tinea Page] Initializing TensorFlow.js model...');
        await tineaModel.loadModel();
        console.log('[Tinea Page] Model initialized successfully');
      } catch (err) {
        console.error('[Tinea Page] Failed to initialize model:', err);
        // Model loading failure is non-critical - can still use backend
      }
    };

    initializeModel();

    // Cleanup on unmount
    return () => {
      if (tineaModel.isLoaded()) {
        tineaModel.unloadModel();
      }
    };
  }, []);

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Try frontend TensorFlow.js model first
      if (tineaModel.isLoaded() && preview) {
        console.log('[Tinea Analysis] Using frontend TensorFlow.js model');
        
        // Create image element from preview
        const img = new Image();
        img.src = preview;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Run ensemble prediction (5 runs for better accuracy)
        const ensembleResult = await tineaModel.ensemblePredict(img, 5);
        
        // Map model output to UI results
        let tineaType = 'Not Detected';
        let recommendations: string[] = [];
        let severity = 'Low';
        let affected_area = 'Not Specified';
        let details = '';

        if (ensembleResult.isTinea) {
          // Find most likely tinea type based on common characteristics
          tineaType = 'Tinea (Fungal Infection)';
          severity = ensembleResult.confidence > 0.85 ? 'High' : 
                    ensembleResult.confidence > 0.70 ? 'Moderate' : 'Low';
          
          affected_area = 'Face/Body (See Image)';
          
          recommendations = [
            '✓ Consult a dermatologist for proper diagnosis',
            '✓ Avoid sharing towels, clothing, or personal items',
            '✓ Keep affected area clean and dry',
            '✓ Use antifungal creams as prescribed by doctor',
            '✓ Wear loose, breathable clothing',
            '✓ Avoid scratching to prevent spreading',
            '✓ Monitor for signs of improvement over 2-4 weeks',
            '✓ Practice good hygiene and wash hands frequently'
          ];

          details = `Tinea (ringworm) detected with ${(ensembleResult.confidence * 100).toFixed(2)}% confidence across 5 independent analyses. The fungal infection shows characteristics consistent with dermatophyte infection. Seek professional medical evaluation for confirmation and treatment.`;
        } else {
          tineaType = 'No Tinea Detected';
          severity = 'None';
          affected_area = 'N/A';
          
          recommendations = [
            '✓ Maintain good skin hygiene',
            '✓ Keep skin clean and dry',
            '✓ Avoid close contact with infected individuals',
            '✓ Use public facilities with caution',
            '✓ Regular skin check-ups recommended'
          ];

          details = `No tinea infection detected. Confidence: ${((1 - ensembleResult.confidence) * 100).toFixed(2)}%. The skin analysis does not show characteristics typical of fungal infection. Continue monitoring and maintain good hygiene practices.`;
        }

        setResult({
          success: true,
          tineaType,
          confidence: ensembleResult.confidence,
          affected_area,
          severity,
          recommendations,
          details,
          totalInferences: ensembleResult.allResults.length,
          message: ensembleResult.isTinea 
            ? `Tinea detected with ${(ensembleResult.confidence * 100).toFixed(2)}% confidence. Please consult a dermatologist.`
            : `No tinea detected. Confidence: ${((1 - ensembleResult.confidence) * 100).toFixed(2)}%`
        });

        return;
      }

      // Fallback to backend API if frontend model is not available
      console.log('[Tinea Analysis] Using backend API');
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch('http://localhost:4000/api/detect/tinea', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('[Tinea Analysis] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleDoishaAnswer = (doisha: string) => {
    const newAnswers = [...doishaAnswers, doisha];
    setDoishaAnswers(newAnswers);

    if (currentQuestion < DOISHA_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate doisha result
      const scores = {
        vata: newAnswers.filter(a => a === 'vata').length,
        pitta: newAnswers.filter(a => a === 'pitta').length,
        kapha: newAnswers.filter(a => a === 'kapha').length
      };

      const doishKey = Object.entries(scores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as 'vata' | 'pitta' | 'kapha';

      const info = DOISHA_INFO[doishKey];
      setDoishaResult({
        dominantDoisha: doishKey,
        scores,
        characteristics: info.characteristics,
        recommendations: info.skinAdvice,
        skinAdvice: info.skinAdvice
      });
    }
  };

  const resetDoisha = () => {
    setCurrentQuestion(0);
    setDoishaAnswers([]);
    setDoishaResult(null);
    setDetectionMode('tinea');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-red-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Link */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-800 font-semibold transition-colors">
            ← Back Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">🦠 Tinea (Ringworm)</h1>
          <p className="text-lg text-gray-700">AI-Powered Detection & Comprehensive Information</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-white/40'
            }`}
          >
            📚 Information
          </button>
          <button
            onClick={() => setActiveTab('detect')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              activeTab === 'detect'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-white/40'
            }`}
          >
            🔍 AI Detection
          </button>
        </div>

        {/* Information Tab */}
        {activeTab === 'info' && (
          <div className="space-y-8 animate-fade-in">
            {/* What is Tinea */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/40 hover:shadow-2xl transition-all">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🦠 What is Tinea?</h2>
              <p className="text-gray-700 text-lg mb-4">
                <strong>Tinea</strong> is a common <strong>fungal skin infection</strong> caused by dermatophyte fungi. It affects the skin, scalp, nails, and groin, and spreads easily through direct contact or shared items.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 border border-orange-300">
                  <p className="font-semibold text-orange-900 mb-2">✓ How it spreads:</p>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Direct contact with infected person</li>
                    <li>• Shared towels & clothing</li>
                    <li>• Contaminated surfaces</li>
                    <li>• Warm, moist environments</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 border border-red-300">
                  <p className="font-semibold text-red-900 mb-2">⚠️ Prevention Tips:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Keep skin clean & dry</li>
                    <li>• Avoid sharing personal items</li>
                    <li>• Wear breathable clothes</li>
                    <li>• Dry feet after washing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7 Types of Tinea */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7 Types of Tinea</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {TINEA_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className={`bg-gradient-to-br ${type.color} rounded-2xl shadow-lg p-6 border border-white/40 hover:shadow-xl hover:border-white/60 transition-all hover:-translate-y-1 cursor-pointer backdrop-blur-sm`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{type.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                        <p className="text-sm text-orange-700 font-semibold">{type.area}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 text-sm">{type.description}</p>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">SYMPTOMS:</p>
                      <div className="flex flex-wrap gap-2">
                        {type.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white/60 text-orange-700 px-3 py-1 rounded-full font-medium"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis & Treatment */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/40 hover:shadow-2xl transition-all">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">🧬 Diagnosis & Treatment</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">🧪 Diagnosis Methods</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Visual Examination</strong> - Dermatologist assessment</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>KOH Test</strong> - Skin scraping analysis</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Fungal Culture</strong> - Identifies fungus type</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Wood's Lamp</strong> - Detects fluorescence patterns</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">💊 Treatment Options</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Topical Antifungals</strong> - Creams, powders, lotions</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Oral Medications</strong> - For severe cases</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Home Care</strong> - Keep area dry & clean</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Duration</strong> - Usually 2-4 weeks for recovery</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Detection Tab */}
        {activeTab === 'detect' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/40 animate-fade-in">
            {/* Detection Mode Selector */}
            {!doishaResult && detectionMode === 'tinea' && !result && (
              <div className="mb-8">
                <p className="text-center text-gray-700 font-semibold mb-6">Choose what you want to detect:</p>
                <div className="mb-8">
                  <button
                    onClick={() => setDetectionMode('tinea')}
                    className={`w-full p-6 rounded-2xl font-semibold transition-all ${
                      detectionMode === 'tinea'
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                        : 'bg-white/60 border border-orange-300 text-gray-900 hover:border-orange-500'
                    }`}
                  >
                    🔍 Tinea Detection
                    <p className="text-sm mt-2 opacity-90">Image-based fungal infection analysis</p>
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Want a comprehensive assessment?</p>
                  <Link href="/dosha-quiz">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-full font-bold hover:shadow-xl transition-all hover:scale-105">
                      📊 Full Dosha Dashboard →
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Tinea Detection Mode */}
            {detectionMode === 'tinea' && (
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Tinea AI Detection</h1>
                <p className="text-gray-700 text-lg mb-8">Upload or capture an image for instant AI-powered analysis</p>

            {!result ? (
              <div className="space-y-8">
                {/* Image Preview Area */}
                {preview ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden shadow-xl bg-white border-3 border-medical-300">
                      <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md transform hover:scale-105"
                      >
                        📁 Change Image
                      </button>
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all shadow-md transform hover:scale-105"
                      >
                        📷 Take Photo
                      </button>
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-medical-600 to-orange-600 text-white font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      {loading ? '⏳ Analyzing Image...' : '🔍 Analyze Image'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upload Options */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-8 border-3 border-dashed border-medical-400 rounded-2xl hover:bg-medical-50 transition-all group hover:border-medical-600 hover:shadow-lg"
                      >
                        <div className="text-6xl mb-3 group-hover:scale-125 transition-transform">📁</div>
                        <p className="font-semibold text-gray-900 text-lg">Upload Image</p>
                        <p className="text-sm text-gray-600">JPG, PNG, WebP</p>
                      </button>
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="p-8 border-3 border-dashed border-blue-400 rounded-2xl hover:bg-blue-50 transition-all group hover:border-blue-600 hover:shadow-lg"
                      >
                        <div className="text-6xl mb-3 group-hover:scale-125 transition-transform">📷</div>
                        <p className="font-semibold text-gray-900 text-lg">Take Photo</p>
                        <p className="text-sm text-gray-600">Use your camera</p>
                      </button>
                    </div>

                    {/* Drag and Drop Area */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-gray-600 font-medium">Or drag and drop your image here</p>
                    </div>

                    {/* Hidden Inputs */}
                    <label htmlFor="fileInput" className="hidden">
                      Upload image file
                    </label>
                    <input
                      id="fileInput"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <label htmlFor="cameraInput" className="hidden">
                      Capture image from camera
                    </label>
                    <input
                      id="cameraInput"
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />

                    {/* Info Box */}
                    <div className="bg-blue-100/50 border-l-4 border-blue-500 rounded-lg p-4">
                      <p className="text-blue-900 font-semibold">💡 Tip:</p>
                      <p className="text-blue-800 text-sm mt-1">Take clear photos of the affected area in good lighting for best results. The AI will analyze the image instantly.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-100/80 border-2 border-red-400 rounded-xl p-4 animate-shake">
                    <p className="text-red-800 font-semibold">❌ Error: {error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {/* Result Display */}
                {result.success ? (
                  <div className="space-y-6">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-5xl animate-bounce">✅</div>
                        <div>
                          <h2 className="text-3xl font-bold text-green-900">Detection Successful</h2>
                          <p className="text-green-700 font-semibold text-lg">{result.message || 'Tinea infection detected'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detected Type - Primary Card */}
                    {result.tineaType && (
                      <div className="bg-gradient-to-br from-medical-50 to-orange-50 rounded-2xl p-8 border-2 border-medical-300 shadow-lg">
                        <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">🎯 Detected Type</p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{result.tineaType}</h3>
                        <p className="text-gray-700">Classification identified fungal infection</p>
                      </div>
                    )}

                    {/* Confidence Score */}
                    {result.confidence !== undefined && (
                      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                        <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">📊 Confidence Level</p>
                        <div className="space-y-4">
                          <div className="flex items-end gap-4">
                            <div className="text-5xl font-bold text-medical-600">
                              {(result.confidence * 100).toFixed(1)}
                            </div>
                            <div className="text-2xl text-gray-600 mb-2">%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-md">
                            <div
                              className="bg-gradient-to-r from-medical-500 to-orange-600 h-4 rounded-full transition-all duration-700"
                              style={{ width: `${(result.confidence * 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {result.confidence > 0.9 ? 'High confidence detection' : result.confidence > 0.7 ? 'Moderate confidence' : 'Low confidence - please verify'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Severity */}
                    {result.severity && (
                      <div className={`rounded-2xl p-8 border-2 shadow-lg ${
                        result.severity === 'Severe' ? 'bg-red-50 border-red-300' :
                        result.severity === 'Moderate' ? 'bg-orange-50 border-orange-300' :
                        'bg-yellow-50 border-yellow-300'
                      }`}>
                        <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">⚠️ Severity Level</p>
                        <p className={`text-3xl font-bold ${
                          result.severity === 'Severe' ? 'text-red-700' :
                          result.severity === 'Moderate' ? 'text-orange-700' :
                          'text-yellow-700'
                        }`}>
                          {result.severity}
                        </p>
                      </div>
                    )}

                    {/* Affected Area */}
                    {result.affected_area && (
                      <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-300 shadow-lg">
                        <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">📍 Affected Area</p>
                        <p className="text-xl text-gray-900 font-semibold">{result.affected_area}</p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                        <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">📋 Recommendations</p>
                        <ul className="space-y-3">
                          {result.recommendations.slice(0, 5).map((rec, idx) => (
                            <li key={idx} className="flex gap-4 text-gray-900 p-4 bg-gray-50 rounded-lg border-l-4 border-medical-500">
                              <span className="text-medical-600 font-bold text-lg flex-shrink-0">✓</span>
                              <span className="text-gray-800">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Details */}
                    {result.details && (
                      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                        <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">📖 Analysis Details</p>
                        <p className="text-gray-800 leading-relaxed">{result.details}</p>
                      </div>
                    )}

                    {/* Important Notice */}
                    <div className="bg-amber-50 border-4 border-amber-400 rounded-2xl p-8 shadow-lg">
                      <div className="flex gap-4">
                        <span className="text-4xl flex-shrink-0">⚠️</span>
                        <div>
                          <p className="font-bold text-amber-900 text-lg mb-2">Medical Disclaimer</p>
                          <p className="text-amber-900 leading-relaxed">This AI analysis is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a licensed dermatologist for accurate diagnosis and treatment recommendations.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 shadow-lg">
                    <div className="flex gap-4">
                      <span className="text-5xl">❌</span>
                      <div>
                        <h2 className="text-3xl font-bold text-red-900 mb-2">Detection Failed</h2>
                        <p className="text-lg text-red-800">{result.error || 'Unable to analyze image. Please try another image.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-medical-600 to-orange-600 text-white font-bold hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    🔄 Scan Another Image
                  </button>
                  <button
                    onClick={() => setActiveTab('info')}
                    className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all transform hover:scale-105"
                  >
                    📚 Learn More
                  </button>
                  <Link href="/dashboard" className="flex-1">
                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg transition-all transform hover:scale-105">
                      💾 Save & Continue
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Doisha Detection Mode */}
            {detectionMode !== 'tinea' && !doishaResult && (
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">🧘 Doisha Assessment</h1>
                <p className="text-gray-700 text-lg mb-8">Discover your Ayurvedic constitution through this simple quiz</p>
                
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-gray-600">Question {currentQuestion + 1} of {DOISHA_QUESTIONS.length}</p>
                    <p className="text-sm font-semibold text-gray-600">{Math.round(((currentQuestion + 1) / DOISHA_QUESTIONS.length) * 100)}%</p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / DOISHA_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 border border-purple-300 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                    {DOISHA_QUESTIONS[currentQuestion].question}
                  </h2>
                  <div className="space-y-3">
                    {DOISHA_QUESTIONS[currentQuestion].answers.map((answer, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDoishaAnswer(answer.doisha)}
                        className="w-full p-4 rounded-xl text-left font-semibold transition-all border-2 border-white/50 hover:border-white hover:bg-white/80 bg-white/60 text-gray-900 hover:shadow-lg"
                      >
                        {answer.text}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Doisha Result */}
            {detectionMode !== 'tinea' && doishaResult && (
              <div className="space-y-8 animate-fade-in">
                <div className={`bg-gradient-to-r ${DOISHA_INFO[doishaResult.dominantDoisha].color} rounded-2xl p-8 border-2 border-purple-400`}>
                  <div className="text-center mb-6">
                    <p className="text-6xl mb-4">{DOISHA_INFO[doishaResult.dominantDoisha].icon}</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{DOISHA_INFO[doishaResult.dominantDoisha].name}</h2>
                    <p className="text-gray-800">{DOISHA_INFO[doishaResult.dominantDoisha].description}</p>
                  </div>
                </div>

                {/* Doisha Scores */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-blue-100 rounded-xl p-6 border border-blue-300 text-center">
                    <p className="text-4xl mb-2">🌬️</p>
                    <p className="font-bold text-gray-900">Vata</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{doishaResult.scores.vata}/6</p>
                  </div>
                  <div className="bg-orange-100 rounded-xl p-6 border border-orange-300 text-center">
                    <p className="text-4xl mb-2">🔥</p>
                    <p className="font-bold text-gray-900">Pitta</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{doishaResult.scores.pitta}/6</p>
                  </div>
                  <div className="bg-green-100 rounded-xl p-6 border border-green-300 text-center">
                    <p className="text-4xl mb-2">🌍</p>
                    <p className="font-bold text-gray-900">Kapha</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{doishaResult.scores.kapha}/6</p>
                  </div>
                </div>

                {/* Characteristics */}
                <div className="bg-white/60 rounded-xl p-6 border border-purple-300">
                  <p className="text-sm font-semibold text-gray-600 mb-4">✨ YOUR CHARACTERISTICS:</p>
                  <div className="space-y-2">
                    {doishaResult.characteristics.map((char, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-600 font-bold">✓</span>
                        <span className="text-gray-900">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin Advice */}
                <div className="bg-white/60 rounded-xl p-6 border border-purple-300">
                  <p className="text-sm font-semibold text-gray-600 mb-4">💆 SKINCARE RECOMMENDATIONS:</p>
                  <ul className="space-y-2">
                    {doishaResult.skinAdvice.map((advice, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-900 p-2 bg-purple-50 rounded-lg">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tinea Risk */}
                <div className="bg-yellow-100/60 border-2 border-yellow-400 rounded-xl p-6">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ TINEA RISK PROFILE:</p>
                  <p className="text-yellow-900">{DOISHA_INFO[doishaResult.dominantDoisha].tineaRisk}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetDoisha}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    🔄 Retake Quiz
                  </button>
                  <button
                    onClick={() => setDetectionMode('tinea')}
                    className="flex-1 px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-all transform hover:scale-105"
                  >
                    🔍 Analyze Image
                  </button>
                  <Link href="/dosha-quiz" className="flex-1">
                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                      📊 Full Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
