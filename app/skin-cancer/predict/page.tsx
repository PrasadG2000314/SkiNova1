'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface PredictionQuestion {
  id: number;
  question: string;
  description?: string;
  type: 'radio' | 'checkbox' | 'slider';
  options?: { text: string; value: number }[];
  minLabel?: string;
  maxLabel?: string;
}

const PREDICTION_QUESTIONS: PredictionQuestion[] = [
  {
    id: 1,
    question: 'Do you have a personal history of skin cancer?',
    type: 'radio',
    options: [
      { text: 'Yes', value: 10 },
      { text: 'No', value: 0 },
      { text: 'Not sure', value: 5 },
    ],
  },
  {
    id: 2,
    question: 'Do you have a family history of skin cancer or melanoma?',
    type: 'radio',
    options: [
      { text: 'Yes, multiple family members', value: 10 },
      { text: 'Yes, one family member', value: 7 },
      { text: 'No', value: 0 },
      { text: 'Not sure', value: 4 },
    ],
  },
  {
    id: 3,
    question: 'What is your skin type?',
    type: 'radio',
    options: [
      { text: 'Very fair (always burns, never tans)', value: 9 },
      { text: 'Fair (usually burns, tans minimally)', value: 7 },
      { text: 'Medium (sometimes burns, tans gradually)', value: 4 },
      { text: 'Olive (rarely burns, tans easily)', value: 2 },
      { text: 'Dark (rarely/never burns)', value: 1 },
    ],
  },
  {
    id: 4,
    question: 'Do you have many moles (atypical nevi)?',
    description: 'Atypical moles are larger than 6mm, irregular shape, or varied color',
    type: 'radio',
    options: [
      { text: 'Yes, many (>50 moles)', value: 10 },
      { text: 'Some (20-50 moles)', value: 6 },
      { text: 'Few (5-20 moles)', value: 3 },
      { text: 'None or very few (<5 moles)', value: 0 },
    ],
  },
  {
    id: 5,
    question: 'Have you had severe sunburns in the past?',
    type: 'radio',
    options: [
      { text: 'Yes, multiple severe sunburns', value: 9 },
      { text: 'Yes, a few severe sunburns', value: 6 },
      { text: 'Occasional mild sunburns', value: 3 },
      { text: 'No significant sunburns', value: 0 },
    ],
  },
  {
    id: 6,
    question: 'How much sun exposure do you get regularly?',
    type: 'radio',
    options: [
      { text: 'Very high (outdoor job, frequent sun exposure)', value: 8 },
      { text: 'Moderate (outdoor hobbies, regular exposure)', value: 5 },
      { text: 'Low (mostly indoors)', value: 2 },
      { text: 'Very low (always avoid sun)', value: 0 },
    ],
  },
  {
    id: 7,
    question: 'Do you use sunscreen regularly?',
    type: 'radio',
    options: [
      { text: 'Never or rarely', value: 5 },
      { text: 'Sometimes (occasionally)', value: 3 },
      { text: 'Usually (most of the time)', value: 1 },
      { text: 'Always (daily SPF 30+)', value: 0 },
    ],
  },
  {
    id: 8,
    question: 'Have you used tanning beds?',
    type: 'radio',
    options: [
      { text: 'Yes, frequently or for many years', value: 7 },
      { text: 'Yes, occasionally', value: 4 },
      { text: 'Rarely', value: 2 },
      { text: 'Never', value: 0 },
    ],
  },
  {
    id: 9,
    question: 'Have you noticed any changes in existing moles or new skin growths?',
    type: 'radio',
    options: [
      { text: 'Yes, significant changes', value: 9 },
      { text: 'Yes, minor changes', value: 5 },
      { text: 'No changes noticed', value: 0 },
    ],
  },
  {
    id: 10,
    question: 'Do you have any of these warning signs (ABCDE)?',
    description: 'Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving (changing)',
    type: 'checkbox',
    options: [
      { text: 'Asymmetrical shape', value: 8 },
      { text: 'Irregular/scalloped border', value: 7 },
      { text: 'Multiple colors or color variation', value: 8 },
      { text: 'Diameter larger than 6mm (pencil eraser)', value: 6 },
      { text: 'Currently evolving/changing', value: 9 },
      { text: 'None of the above', value: 0 },
    ],
  },
  {
    id: 11,
    question: 'Do you have any immune system issues?',
    type: 'radio',
    options: [
      { text: 'Yes (HIV, organ transplant, immunosuppression)', value: 8 },
      { text: 'No', value: 0 },
    ],
  },
  {
    id: 12,
    question: 'What is your age range?',
    type: 'radio',
    options: [
      { text: 'Under 20', value: 2 },
      { text: '20-30', value: 3 },
      { text: '30-40', value: 4 },
      { text: '40-50', value: 5 },
      { text: '50-60', value: 6 },
      { text: '60+', value: 7 },
    ],
  },
];

interface Answers {
  [key: number]: number[];
}

export default function SkinCancerPredict() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [riskScore, setRiskScore] = useState(0);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [value],
    }));
  };

  const handleCheckboxAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(value)) {
        return {
          ...prev,
          [questionId]: current.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [questionId]: [...current, value],
        };
      }
    });
  };

  const handleNext = () => {
    if (currentQuestion < PREDICTION_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateRisk();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateRisk = () => {
    let totalScore = 0;
    let maxScore = 0;

    PREDICTION_QUESTIONS.forEach((q) => {
      if (answers[q.id]) {
        const questionScore = Math.max(...answers[q.id]);
        totalScore += questionScore;
        
        if (q.type === 'checkbox') {
          maxScore += 10; // Maximum possible score per checkbox question
        } else {
          const maxValue = Math.max(...(q.options?.map((o) => o.value) || []));
          maxScore += maxValue;
        }
      }
    });

    const riskPercentage = Math.round((totalScore / maxScore) * 100);
    setRiskScore(riskPercentage);
    setShowResults(true);
  };

  const getRiskLevel = () => {
    if (riskScore < 25) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (riskScore < 50) return { level: 'Low-Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (riskScore < 75) return { level: 'Moderate-High', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const question = PREDICTION_QUESTIONS[currentQuestion];
  const riskLevel = getRiskLevel();
  const isAnswered = answers[question.id] && answers[question.id].length > 0;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
                setRiskScore(0);
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <ArrowLeft size={20} />
              <span>Start Over</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Your Skin Cancer Risk Assessment</h1>
          </div>
        </div>

        {/* Results */}
        <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <div className="space-y-6">
            {/* Risk Score Card */}
            <div className={`rounded-2xl ${riskLevel.bg} p-8 sm:p-12 text-center shadow-lg`}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Estimated Risk Level</h2>
              <div className={`text-5xl sm:text-6xl font-bold ${riskLevel.color} mb-4`}>
                {riskScore}%
              </div>
              <p className={`text-2xl font-bold ${riskLevel.color} mb-4`}>{riskLevel.level}</p>
              <p className="text-gray-700 text-sm sm:text-base">
                Based on your responses to health and lifestyle questions
              </p>
            </div>

            {/* Risk Interpretation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <HelpCircle className="text-blue-600" size={24} />
                What This Means
              </h3>
              <div className="space-y-4 text-gray-700">
                {riskScore < 25 && (
                  <>
                    <p>Your skin cancer risk appears to be <strong>low</strong> based on the provided information.</p>
                    <p>However, it's still important to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Practice regular sun protection and use SPF 30+ sunscreen daily</li>
                      <li>Perform monthly self-skin checks using the ABCDE method</li>
                      <li>Get regular skin checks from a dermatologist every 1-2 years</li>
                      <li>Avoid tanning beds and excessive sun exposure</li>
                    </ul>
                  </>
                )}
                {riskScore >= 25 && riskScore < 50 && (
                  <>
                    <p>Your skin cancer risk appears to be <strong>low to moderate</strong> based on your responses.</p>
                    <p>Recommended actions:</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Increase sun protection measures - wear protective clothing and use SPF 30+ sunscreen</li>
                      <li>Perform monthly self-skin checks and monitor any changes in existing moles</li>
                      <li>Schedule skin checks with a dermatologist every 6-12 months</li>
                      <li>Avoid tanning beds completely</li>
                      <li>Be extra cautious during peak sun hours (10 AM - 4 PM)</li>
                    </ul>
                  </>
                )}
                {riskScore >= 50 && riskScore < 75 && (
                  <>
                    <p>Your skin cancer risk appears to be <strong>moderate to high</strong> based on your responses.</p>
                    <p>Recommended actions:</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li><strong>Schedule a dermatology appointment soon</strong> for a professional skin evaluation</li>
                      <li>Perform monthly self-skin checks and keep records of changes</li>
                      <li>Take strict sun protection measures - protective clothing, wide-brimmed hat, SPF 50+ sunscreen</li>
                      <li>Avoid all sun exposure during peak hours and consider staying indoors</li>
                      <li>Never use tanning beds</li>
                      <li>Monitor any existing suspicious moles closely</li>
                    </ul>
                  </>
                )}
                {riskScore >= 75 && (
                  <>
                    <p>Your skin cancer risk appears to be <strong>high</strong> based on your responses.</p>
                    <p><strong>Important: Please schedule an appointment with a dermatologist as soon as possible.</strong></p>
                    <p>Recommended actions:</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li><strong>See a dermatologist immediately</strong> for comprehensive skin examination</li>
                      <li>Perform monthly self-skin checks and photograph any concerning spots</li>
                      <li>Maintain strict sun avoidance - stay indoors during peak hours, wear protective clothing</li>
                      <li>Use broad-spectrum SPF 50+ sunscreen and reapply frequently</li>
                      <li>Never use tanning beds</li>
                      <li>Follow all dermatologist recommendations closely</li>
                      <li>Consider genetic testing if you have strong family history</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* ABCDE Warning Signs */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-600" size={24} />
                ABCDE Warning Signs
              </h3>
              <p className="text-gray-700 mb-4">See a dermatologist immediately if you notice:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-l-4 border-red-600 pl-4 py-2">
                  <p className="font-bold text-red-600">A - Asymmetry</p>
                  <p className="text-sm text-gray-700">One half doesn't match the other</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4 py-2">
                  <p className="font-bold text-red-600">B - Border</p>
                  <p className="text-sm text-gray-700">Irregular, scalloped, or poorly defined edges</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4 py-2">
                  <p className="font-bold text-red-600">C - Color</p>
                  <p className="text-sm text-gray-700">Multiple colors or uneven distribution</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4 py-2">
                  <p className="font-bold text-red-600">D - Diameter</p>
                  <p className="text-sm text-gray-700">Larger than a pencil eraser (6mm)</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4 py-2 sm:col-span-2">
                  <p className="font-bold text-red-600">E - Evolving</p>
                  <p className="text-sm text-gray-700">Changing in size, shape, or color over weeks</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-8 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                onClick={() => router.push('/skin-cancer/information')}
                className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Learn More
              </button>
              <button
                onClick={() => router.push('/patient/dashboard')}
                className="px-8 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Find a Doctor
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Skin Cancer Risk Assessment</h1>
          <div className="text-sm font-semibold text-gray-600">
            {currentQuestion + 1} / {PREDICTION_QUESTIONS.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / PREDICTION_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Question */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {question.question}
            </h2>
            {question.description && (
              <p className="text-gray-600 text-sm sm:text-base">{question.description}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.type === 'radio' && (
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      checked={answers[question.id]?.includes(option.value) || false}
                      onChange={() => handleAnswer(question.id, option.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-800 font-medium">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'checkbox' && (
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={answers[question.id]?.includes(option.value) || false}
                      onChange={() => handleCheckboxAnswer(question.id, option.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-800 font-medium">{option.text}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                isAnswered
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestion === PREDICTION_QUESTIONS.length - 1 ? 'See Results' : 'Next'}
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-700">
            <strong>Disclaimer:</strong> This assessment tool is for educational purposes only and is not a substitute for professional medical diagnosis. 
            If you have concerns about skin cancer risk, please consult with a qualified dermatologist for proper evaluation and diagnosis.
          </p>
        </div>
      </main>
    </div>
  );
}
