'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, AlertCircle, CheckCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface PredictionResult {
  success: boolean;
  prediction: {
    leprosy_type_id: number;
    leprosy_type_name: string;
    leprosy_type_code: string;
    risk_level: string;
    description: string;
    confidence: number;
    confidence_percent: number;
  };
  class_probabilities: Record<string, number>;
  clinical_interpretation: {
    type_classification: string;
    bacillary_load: string;
    treatment_regimen: string;
    monitoring_priority: string;
    key_clinical_notes: string[];
  };
  feature_importance: Record<string, number>;
  disclaimer: string;
  timestamp: string;
}

const LEPROSY_TYPE_COLORS: Record<string, string> = {
  TT: 'bg-green-100 text-green-800 border-green-300',
  BT: 'bg-lime-100 text-lime-800 border-lime-300',
  BB: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  BL: 'bg-orange-100 text-orange-800 border-orange-300',
  LL: 'bg-red-100 text-red-800 border-red-300',
};

const RISK_COLORS: Record<string, string> = {
  Low: 'text-green-700 bg-green-50 border-green-200',
  'Low-Moderate': 'text-lime-700 bg-lime-50 border-lime-200',
  Moderate: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  High: 'text-red-700 bg-red-50 border-red-200',
};

const BAR_COLORS: Record<string, string> = {
  TT: 'bg-green-500',
  BT: 'bg-lime-500',
  BB: 'bg-yellow-500',
  BL: 'bg-orange-500',
  LL: 'bg-red-500',
};

export default function LeprosyPredictPage() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const [form, setForm] = useState({
    age: '',
    gender: 'M',
    duration_of_illness_months: '',
    number_of_lesions: '',
    largest_lesion_size_cm: '',
    nerve_involvement: false,
    nerve_thickening: false,
    loss_of_sensation: false,
    muscle_weakness: false,
    eye_involvement: false,
    prev_treatment: false,
    household_contacts: '',
    // Advanced clinical
    skin_smear_right: '',
    skin_smear_left: '',
    bacillus_index: '',
    morphological_index: '',
  });

  const handleChange = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.age || !form.duration_of_illness_months || !form.number_of_lesions) {
      setError('Please fill in Age, Duration of Illness and Number of Lesions at minimum.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        age: Number(form.age),
        gender: form.gender,
        duration_of_illness_months: Number(form.duration_of_illness_months),
        number_of_lesions: Number(form.number_of_lesions),
        largest_lesion_size_cm: form.largest_lesion_size_cm ? Number(form.largest_lesion_size_cm) : 2,
        nerve_involvement: form.nerve_involvement ? 1 : 0,
        nerve_thickening: form.nerve_thickening ? 1 : 0,
        loss_of_sensation: form.loss_of_sensation ? 1 : 0,
        muscle_weakness: form.muscle_weakness ? 1 : 0,
        eye_involvement: form.eye_involvement ? 1 : 0,
        prev_treatment: form.prev_treatment ? 1 : 0,
        household_contacts: form.household_contacts ? Number(form.household_contacts) : 0,
        skin_smear_right: form.skin_smear_right ? Number(form.skin_smear_right) : 0,
        skin_smear_left: form.skin_smear_left ? Number(form.skin_smear_left) : 0,
        bacillus_index: form.bacillus_index ? Number(form.bacillus_index) : 0,
        morphological_index: form.morphological_index ? Number(form.morphological_index) : 0,
      };

      const response = await fetch('http://localhost:4000/api/leprosy/ai-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 503 || response.status === 504) {
          throw new Error('AI prediction server is not running. Please start leprosy_prediction_server.py first.');
        }
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Prediction failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setForm({
      age: '', gender: 'M', duration_of_illness_months: '', number_of_lesions: '',
      largest_lesion_size_cm: '', nerve_involvement: false, nerve_thickening: false,
      loss_of_sensation: false, muscle_weakness: false, eye_involvement: false,
      prev_treatment: false, household_contacts: '', skin_smear_right: '',
      skin_smear_left: '', bacillus_index: '', morphological_index: '',
    });
  };

  const typeCode = result?.prediction.leprosy_type_code ?? '';
  const riskLevel = result?.prediction.risk_level ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-20 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 text-indigo-200" />
            <div>
              <h1 className="text-3xl font-bold">AI Leprosy Type Predictor</h1>
              <p className="text-indigo-200 mt-1">Enter clinical data to classify leprosy type using the trained ML model</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          /* ── INPUT FORM ── */
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Patient Clinical Data</h2>
            <p className="text-sm text-gray-500 mb-6">Fields marked <span className="text-red-500">*</span> are required. All others improve prediction accuracy.</p>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" max="120" placeholder="e.g. 35"
                    value={form.age}
                    onChange={e => handleChange('age', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Household Contacts</label>
                  <input
                    type="number" min="0" placeholder="e.g. 3"
                    value={form.household_contacts}
                    onChange={e => handleChange('household_contacts', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            {/* Disease Info */}
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Disease Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration of Illness (months) <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" placeholder="e.g. 12"
                    value={form.duration_of_illness_months}
                    onChange={e => handleChange('duration_of_illness_months', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Lesions <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" placeholder="e.g. 5"
                    value={form.number_of_lesions}
                    onChange={e => handleChange('number_of_lesions', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Largest Lesion Size (cm)</label>
                  <input
                    type="number" min="0" step="0.1" placeholder="e.g. 3.5"
                    value={form.largest_lesion_size_cm}
                    onChange={e => handleChange('largest_lesion_size_cm', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            {/* Clinical Symptoms */}
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Clinical Symptoms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'nerve_involvement', label: 'Nerve Involvement', icon: '🧠' },
                  { key: 'nerve_thickening', label: 'Nerve Thickening (palpable)', icon: '🫀' },
                  { key: 'loss_of_sensation', label: 'Loss of Sensation', icon: '✋' },
                  { key: 'muscle_weakness', label: 'Muscle Weakness', icon: '💪' },
                  { key: 'eye_involvement', label: 'Eye Involvement', icon: '👁️' },
                  { key: 'prev_treatment', label: 'Previously Treated', icon: '💊' },
                ].map(item => (
                  <label key={item.key} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    form[item.key as keyof typeof form]
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form[item.key as keyof typeof form] as boolean}
                      onChange={e => handleChange(item.key, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Advanced Clinical Measurements */}
            <section className="mb-8">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced Clinical Measurements
                <span className="text-xs font-normal text-gray-400">(improves accuracy)</span>
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  {[
                    { key: 'skin_smear_right', label: 'Skin Smear — Right (0–6)', step: '0.5', max: '6' },
                    { key: 'skin_smear_left', label: 'Skin Smear — Left (0–6)', step: '0.5', max: '6' },
                    { key: 'bacillus_index', label: 'Bacillus Index — BI (0–6)', step: '0.1', max: '6' },
                    { key: 'morphological_index', label: 'Morphological Index — MI (0–100%)', step: '1', max: '100' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">{field.label}</label>
                      <input
                        type="number" min="0" max={field.max} step={field.step}
                        placeholder="0"
                        value={form[field.key as keyof typeof form] as string}
                        onChange={e => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Running AI Model...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Predict Leprosy Type
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              This prediction is for research/informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        ) : (
          /* ── RESULTS ── */
          <div className="space-y-6">
            {/* Primary Result Card */}
            <div className={`rounded-3xl border-2 p-8 shadow-xl ${LEPROSY_TYPE_COLORS[typeCode] || 'bg-gray-50 text-gray-800 border-gray-300'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">AI Prediction Result</p>
                  <h2 className="text-4xl font-extrabold mb-1">{result.prediction.leprosy_type_name}</h2>
                  <p className="text-base opacity-80 mb-4">{result.prediction.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${RISK_COLORS[riskLevel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {riskLevel} Risk
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-white/60 border border-current">
                      {result.prediction.confidence_percent.toFixed(1)}% Confidence
                    </span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-6xl font-black opacity-30">{typeCode}</div>
                  <CheckCircle className="w-8 h-8 mx-auto mt-2 opacity-60" />
                </div>
              </div>
            </div>

            {/* Probability Distribution */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Probability by Leprosy Type</h3>
              <div className="space-y-3">
                {Object.entries(result.class_probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([typeName, prob]) => {
                    const pct = Math.round(Number(prob) * 100);
                    const code = Object.entries({
                      'Tuberculoid (TT)': 'TT', 'Borderline Tuberculoid (BT)': 'BT',
                      'Mid-Borderline (BB)': 'BB', 'Borderline Lepromatous (BL)': 'BL',
                      'Lepromatous (LL)': 'LL'
                    }).find(([k]) => typeName.includes(k.split(' ')[0]) || typeName.includes(k.split('(')[1]?.replace(')', '')))?.[1]
                      ?? typeName.match(/\(([A-Z]+)\)/)?.[1] ?? '';
                    const isTop = typeName === result.prediction.leprosy_type_name;
                    const barColor = BAR_COLORS[code] || 'bg-indigo-400';
                    return (
                      <div key={typeName}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${isTop ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                            {isTop && '▶ '}{typeName}
                          </span>
                          <span className={`text-sm font-bold ${isTop ? 'text-gray-900' : 'text-gray-500'}`}>{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${isTop ? barColor : 'bg-gray-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Clinical Interpretation */}
            {result.clinical_interpretation && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Clinical Interpretation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Classification', value: result.clinical_interpretation.type_classification, icon: '🏷️' },
                    { label: 'Bacillary Load', value: result.clinical_interpretation.bacillary_load, icon: '🦠' },
                    { label: 'Recommended Treatment', value: result.clinical_interpretation.treatment_regimen, icon: '💊' },
                    { label: 'Monitoring Priority', value: result.clinical_interpretation.monitoring_priority, icon: '📋' },
                  ].map(item => (
                    <div key={item.label} className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {result.clinical_interpretation.key_clinical_notes?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-amber-800 mb-2">⚠️ Key Clinical Notes</p>
                    <ul className="space-y-1.5">
                      {result.clinical_interpretation.key_clinical_notes.map((note, i) => (
                        <li key={i} className="text-sm text-amber-900">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Feature Importance */}
            {result.feature_importance && Object.keys(result.feature_importance).length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Top Contributing Factors</h3>
                <p className="text-xs text-gray-500 mb-4">Features the model weighted most in this prediction</p>
                <div className="space-y-2">
                  {Object.entries(result.feature_importance).slice(0, 8).map(([feat, imp]) => {
                    const pct = Math.round(Number(imp) * 100);
                    const label = feat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <div key={feat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{label}</span>
                          <span className="text-gray-500">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500 italic text-center">
              {result.disclaimer}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                New Prediction
              </button>
              <button
                onClick={() => router.push('/leprosy/assistant')}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                Open Care Assistant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
