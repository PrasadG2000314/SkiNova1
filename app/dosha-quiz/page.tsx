'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GradCAMVisualization from '@/components/GradCAMVisualization';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    dosha: 'vata' | 'pitta' | 'kapha';
  }[];
}

interface DoshaInfo {
  name: string;
  emoji: string;
  icon: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  description: string;
  characteristics: string[];
  skinAdvice: string[];
  dietAdvice: string[];
  balancingActivities: string[];
  tineaRisk: {
    risk: 'Low' | 'Moderate' | 'High';
    description: string;
  };
}

const DOSHA_INFO: Record<'vata' | 'pitta' | 'kapha', DoshaInfo> = {
  vata: {
    name: 'Vata',
    emoji: '💨',
    icon: 'Wind',
    color: 'blue',
    gradientStart: 'from-blue-400',
    gradientEnd: 'to-cyan-400',
    description: 'The element of Space & Air. You are the creative, energetic, and adaptable type.',
    characteristics: [
      'Adaptable and flexible',
      'Creative and imaginative',
      'Quick-thinking and communicative',
      'Tends to be anxious or restless',
      'Prefers warm environments',
      'Variable energy levels',
      'Thin, light build',
      'Dry skin tendency',
    ],
    skinAdvice: [
      'Use warm, nourishing oils (sesame, almond)',
      'Apply moisturizers regularly',
      'Avoid harsh soaps and chemicals',
      'Keep skin warm and protected',
      'Stay hydrated internally',
      'Use herbal face masks weekly',
    ],
    dietAdvice: [
      'Eat warm, cooked foods',
      'Include healthy oils and ghee',
      'Consume grounding grains and roots',
      'Add warm spices (cumin, ginger)',
      'Maintain regular meal times',
      'Avoid dry, raw foods',
    ],
    balancingActivities: [
      'Yoga (especially Hatha yoga)',
      'Meditation and grounding exercises',
      'Oil massage (Abhyanga)',
      'Gentle walking',
      'Aromatherapy with warming oils',
      'Warm baths and treatments',
    ],
    tineaRisk: {
      risk: 'Moderate',
      description: 'Vata types may be prone to tinea due to dry skin and weak immune barrier. Focus on nourishing treatments.',
    },
  },
  pitta: {
    name: 'Pitta',
    emoji: '🔥',
    icon: 'Fire',
    color: 'orange',
    gradientStart: 'from-orange-400',
    gradientEnd: 'to-red-400',
    description: 'The element of Fire & Water. You are the ambitious, driven, and intelligent type.',
    characteristics: [
      'Ambitious and goal-oriented',
      'Sharp intellect and leadership',
      'Strong metabolism and digestion',
      'Can be perfectionist or impatient',
      'Prefers cool environments',
      'Medium, muscular build',
      'Warm, oily, sensitive skin',
      'Strong body odor',
    ],
    skinAdvice: [
      'Use cooling products (coconut, neem)',
      'Avoid heating oils and treatments',
      'Apply sunscreen regularly',
      'Use anti-inflammatory masks',
      'Keep skin cool and calm',
      'Avoid excessive sun exposure',
    ],
    dietAdvice: [
      'Eat cooling vegetables and fruits',
      'Consume coconut and aloe vera',
      'Avoid spicy and heating foods',
      'Include bitter and sweet tastes',
      'Drink cooling herbal teas',
      'Limit alcohol and caffeine',
    ],
    balancingActivities: [
      'Swimming and water activities',
      'Cooling pranayama (Sitali breath)',
      'Moon gazing meditation',
      'Gentle yoga practices',
      'Spending time in nature',
      'Creative pursuits',
    ],
    tineaRisk: {
      risk: 'High',
      description: 'Pitta types are prone to inflammatory tinea due to heat and moisture. Maintain cool, dry conditions.',
    },
  },
  kapha: {
    name: 'Kapha',
    emoji: '🌊',
    icon: 'Water',
    color: 'green',
    gradientStart: 'from-green-400',
    gradientEnd: 'to-emerald-400',
    description: 'The element of Water & Earth. You are the stable, grounded, and compassionate type.',
    characteristics: [
      'Calm and grounded nature',
      'Loyal and compassionate',
      'Strong and stable health',
      'Can be stubborn or lethargic',
      'Prefers warm, dry environments',
      'Good strength and endurance',
      'Heavy, sturdy build',
      'Thick, moist skin',
    ],
    skinAdvice: [
      'Use light, stimulating treatments',
      'Regular dry brushing (Garshana)',
      'Avoid heavy oils',
      'Use warming spices in masks',
      'Maintain dry skin conditions',
      'Do regular exfoliation',
    ],
    dietAdvice: [
      'Eat light, warm foods',
      'Include warming spices',
      'Reduce heavy, oily foods',
      'Add bitter and pungent tastes',
      'Limit dairy and sweets',
      'Consume stimulating foods',
    ],
    balancingActivities: [
      'Vigorous exercise and cardio',
      'Invigorating yoga practices',
      'Dynamic activities and sports',
      'Early morning wake-ups',
      'Sauna and steam treatments',
      'Social engagement and travel',
    ],
    tineaRisk: {
      risk: 'Low',
      description: 'Kapha types have stronger immunity but moisture creates risk. Keep skin dry and maintain hygiene.',
    },
  },
};

const questions: Question[] = [
  {
    id: 1,
    question: 'What is your pulse rate?',
    options: [
      { text: 'High & irregular (80+ bpm)', dosha: 'vata' },
      { text: 'Moderate & regular (70-80 bpm)', dosha: 'pitta' },
      { text: 'Slow & steady (below 70 bpm)', dosha: 'kapha' },
    ],
  },
  {
    id: 2,
    question: 'What is your body frame?',
    options: [
      { text: 'Thin, light build', dosha: 'vata' },
      { text: 'Medium, muscular build', dosha: 'pitta' },
      { text: 'Heavy, sturdy build', dosha: 'kapha' },
    ],
  },
  {
    id: 3,
    question: 'How would you describe your skin?',
    options: [
      { text: 'Dry, thin, cool', dosha: 'vata' },
      { text: 'Warm, oily, sensitive', dosha: 'pitta' },
      { text: 'Thick, moist, cool', dosha: 'kapha' },
    ],
  },
  {
    id: 4,
    question: 'What is your appetite like?',
    options: [
      { text: 'Irregular, easily skips meals', dosha: 'vata' },
      { text: 'Strong, must eat on time', dosha: 'pitta' },
      { text: 'Steady, eats slowly', dosha: 'kapha' },
    ],
  },
  {
    id: 5,
    question: 'How do you typically feel?',
    options: [
      { text: 'Anxious, restless, energetic', dosha: 'vata' },
      { text: 'Ambitious, driven, focused', dosha: 'pitta' },
      { text: 'Calm, grounded, stable', dosha: 'kapha' },
    ],
  },
  {
    id: 6,
    question: 'What is your sleep pattern?',
    options: [
      { text: 'Light, interrupted, restless', dosha: 'vata' },
      { text: 'Medium, sound, interrupted by heat', dosha: 'pitta' },
      { text: 'Deep, heavy, tendency to oversleep', dosha: 'kapha' },
    ],
  },
  {
    id: 7,
    question: 'How do you prefer the weather?',
    options: [
      { text: 'Warm, humid weather', dosha: 'vata' },
      { text: 'Cool weather', dosha: 'pitta' },
      { text: 'Warm, dry weather', dosha: 'kapha' },
    ],
  },
  {
    id: 8,
    question: 'What is your typical digestion like?',
    options: [
      { text: 'Variable, prone to bloating', dosha: 'vata' },
      { text: 'Strong, quick, prone to diarrhea', dosha: 'pitta' },
      { text: 'Slow, sluggish, prone to constipation', dosha: 'kapha' },
    ],
  },
  {
    id: 9,
    question: 'What is your energy level throughout the day?',
    options: [
      { text: 'Fluctuating, bursts of energy', dosha: 'vata' },
      { text: 'Consistent and high', dosha: 'pitta' },
      { text: 'Steady but slow to wake up', dosha: 'kapha' },
    ],
  },
  {
    id: 10,
    question: 'How do you handle stress?',
    options: [
      { text: 'Get nervous, anxious', dosha: 'vata' },
      { text: 'Get irritable, angry', dosha: 'pitta' },
      { text: 'Get withdrawn, depressed', dosha: 'kapha' },
    ],
  },
  {
    id: 11,
    question: 'What is your hair type?',
    options: [
      { text: 'Thin, dry, early graying', dosha: 'vata' },
      { text: 'Fine, straight, premature balding', dosha: 'pitta' },
      { text: 'Thick, wavy, oily, luxuriant', dosha: 'kapha' },
    ],
  },
  {
    id: 12,
    question: 'What are your hands and feet usually like?',
    options: [
      { text: 'Small, thin, cool', dosha: 'vata' },
      { text: 'Medium, warm, reddish', dosha: 'pitta' },
      { text: 'Large, thick, cool', dosha: 'kapha' },
    ],
  },
  {
    id: 13,
    question: 'How is your memory?',
    options: [
      { text: 'Quick to learn, quick to forget', dosha: 'vata' },
      { text: 'Sharp, detailed, good retention', dosha: 'pitta' },
      { text: 'Slow to learn, excellent long-term', dosha: 'kapha' },
    ],
  },
  {
    id: 14,
    question: 'What is your speaking style?',
    options: [
      { text: 'Fast, talks a lot, gets excited', dosha: 'vata' },
      { text: 'Clear, precise, persuasive', dosha: 'pitta' },
      { text: 'Slow, measured, doesn\'t talk much', dosha: 'kapha' },
    ],
  },
  {
    id: 15,
    question: 'How do you typically move?',
    options: [
      { text: 'Quick, energetic, fidgety', dosha: 'vata' },
      { text: 'Determined, purposeful', dosha: 'pitta' },
      { text: 'Slow, graceful, deliberate', dosha: 'kapha' },
    ],
  },
  {
    id: 16,
    question: 'What is your body temperature tendency?',
    options: [
      { text: 'Cold hands and feet', dosha: 'vata' },
      { text: 'Warm, tendency to sweat easily', dosha: 'pitta' },
      { text: 'Normal, rarely feel too cold or hot', dosha: 'kapha' },
    ],
  },
  {
    id: 17,
    question: 'How do you spend your leisure time?',
    options: [
      { text: 'Traveling, socializing, new activities', dosha: 'vata' },
      { text: 'Competitive sports, goal-oriented', dosha: 'pitta' },
      { text: 'Relaxing, watching movies, comfortable activities', dosha: 'kapha' },
    ],
  },
  {
    id: 18,
    question: 'What is your natural body odor?',
    options: [
      { text: 'Minimal, slight', dosha: 'vata' },
      { text: 'Strong, pungent', dosha: 'pitta' },
      { text: 'Heavy, strong, but not unpleasant', dosha: 'kapha' },
    ],
  },
  {
    id: 19,
    question: 'How do you handle cold weather?',
    options: [
      { text: 'Dislike it, feel cold easily', dosha: 'vata' },
      { text: 'Prefer cooler weather', dosha: 'pitta' },
      { text: 'Tolerate well, don\'t mind it', dosha: 'kapha' },
    ],
  },
  {
    id: 20,
    question: 'What is your typical bowel habit?',
    options: [
      { text: 'Irregular, dry stools, tendency to constipation', dosha: 'vata' },
      { text: 'Regular, soft, tendency to loose stools', dosha: 'pitta' },
      { text: 'Regular, well-formed, heavy', dosha: 'kapha' },
    ],
  },
  {
    id: 21,
    question: 'How is your sense of humor?',
    options: [
      { text: 'Changeable, enjoys playfulness', dosha: 'vata' },
      { text: 'Sharp, sarcastic, witty', dosha: 'pitta' },
      { text: 'Gentle, likes family humor', dosha: 'kapha' },
    ],
  },
  {
    id: 22,
    question: 'What are your nails like?',
    options: [
      { text: 'Thin, fragile, easily break', dosha: 'vata' },
      { text: 'Medium, strong, pink', dosha: 'pitta' },
      { text: 'Thick, strong, pale', dosha: 'kapha' },
    ],
  },
  {
    id: 23,
    question: 'How do you react to loud noise?',
    options: [
      { text: 'Very sensitive, easily disturbed', dosha: 'vata' },
      { text: 'Somewhat bothered', dosha: 'pitta' },
      { text: 'Not particularly bothered', dosha: 'kapha' },
    ],
  },
  {
    id: 24,
    question: 'What is your financial spending pattern?',
    options: [
      { text: 'Impulsive, erratic spending', dosha: 'vata' },
      { text: 'Calculated, ambitious investment', dosha: 'pitta' },
      { text: 'Conservative, savings-oriented', dosha: 'kapha' },
    ],
  },
  {
    id: 25,
    question: 'How do you typically react to new situations?',
    options: [
      { text: 'Enthusiastic but anxious', dosha: 'vata' },
      { text: 'Confident and strategic', dosha: 'pitta' },
      { text: 'Cautious and slow to adapt', dosha: 'kapha' },
    ],
  },
  {
    id: 26,
    question: 'What is your eye color and type?',
    options: [
      { text: 'Small, active, dark', dosha: 'vata' },
      { text: 'Sharp, bright, penetrating', dosha: 'pitta' },
      { text: 'Large, calm, clear', dosha: 'kapha' },
    ],
  },
];

export default function DoshaAssessmentPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<('vata' | 'pitta' | 'kapha')[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'quiz' | 'result'>('info');
  const [doshaScores, setDoshaScores] = useState<Record<'vata' | 'pitta' | 'kapha', number>>({
    vata: 0,
    pitta: 0,
    kapha: 0,
  });
  const [xaiData, setXaiData] = useState<any>(null);
  const [loadingXAI, setLoadingXAI] = useState(false);

  const handleAnswer = (dosha: 'vata' | 'pitta' | 'kapha') => {
    const newAnswers = [...answers, dosha];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateDosha(newAnswers);
      setActiveTab('result');
    }
  };

  const calculateDosha = (answers: ('vata' | 'pitta' | 'kapha')[]) => {
    const scores: Record<'vata' | 'pitta' | 'kapha', number> = {
      vata: answers.filter(a => a === 'vata').length,
      pitta: answers.filter(a => a === 'pitta').length,
      kapha: answers.filter(a => a === 'kapha').length,
    };
    setDoshaScores(scores);
    setShowResults(true);
    
    // Compute XAI/GradCAM data
    computeXAI(answers, scores);
  };

  const computeXAI = async (answers: ('vata' | 'pitta' | 'kapha')[], scores: Record<'vata' | 'pitta' | 'kapha', number>) => {
    try {
      setLoadingXAI(true);
      const primaryDosha = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as 'vata' | 'pitta' | 'kapha';
      
      // Map answers to question data
      const answerData = answers.map((dosha, idx) => ({
        questionId: idx + 1,
        question: questions[idx].question,
        selectedAnswer: questions[idx].options.find(opt => opt.dosha === dosha)?.text || '',
        dosha: dosha,
      }));

      const response = await fetch('http://localhost:4000/api/xai/compute-xai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answerData,
          primaryDosha: primaryDosha,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setXaiData(data.data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to compute XAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
      }
    } catch (error) {
      console.error('Error computing XAI:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
      });
    } finally {
      setLoadingXAI(false);
    }
  };

  const getPrimaryDosha = () => {
    const entries = Object.entries(doshaScores) as [string, number][];
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] as 'vata' | 'pitta' | 'kapha';
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setActiveTab('info');
    setDoshaScores({ vata: 0, pitta: 0, kapha: 0 });
    setXaiData(null);
  };

  const generateReport = () => {
    if (!primaryDosha) return;

    const doshaInfo = DOSHA_INFO[primaryDosha];
    const timestamp = new Date().toLocaleString();

    // Create HTML content for the report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dosha Assessment Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #e084f5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #7c3aed;
            font-size: 2.5em;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .primary-dosha {
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
            border-left: 5px solid #7c3aed;
          }
          .primary-dosha h2 {
            color: #7c3aed;
            font-size: 2em;
            margin: 10px 0;
          }
          .primary-dosha p {
            color: #555;
            font-size: 1.05em;
          }
          .scores {
            margin-bottom: 30px;
          }
          .scores h3 {
            color: #7c3aed;
            border-bottom: 2px solid #e084f5;
            padding-bottom: 10px;
          }
          .score-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .score-item:last-child {
            border-bottom: none;
          }
          .score-label {
            font-weight: bold;
            text-transform: capitalize;
            color: #333;
          }
          .score-bar {
            flex: 1;
            margin: 0 20px;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            height: 20px;
          }
          .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #7c3aed, #ec4899);
            transition: width 0.3s ease;
          }
          .score-value {
            font-weight: bold;
            color: #7c3aed;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h3 {
            color: #7c3aed;
            border-bottom: 2px solid #e084f5;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .section ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .section li {
            padding: 8px 0;
            padding-left: 30px;
            position: relative;
            color: #555;
          }
          .section li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #7c3aed;
            font-weight: bold;
            font-size: 1.2em;
          }
          .risk-warning {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 4px;
          }
          .risk-warning h4 {
            color: #991b1b;
            margin-top: 0;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 0.9em;
          }
          .timestamp {
            color: #aaa;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧘 Dosha Assessment Report</h1>
            <p>Your Ayurvedic Constitution & Skin Profile</p>
            <p class="timestamp">Generated on ${timestamp}</p>
          </div>

          <div class="primary-dosha">
            <div style="font-size: 3em; margin-bottom: 10px;">${doshaInfo.emoji}</div>
            <h2>${doshaInfo.name} Dosha</h2>
            <p>${doshaInfo.description}</p>
          </div>

          <div class="scores">
            <h3>📊 Your Constitution Scores</h3>
            <div class="score-item">
              <span class="score-label">Vata</span>
              <div class="score-bar">
                <div class="score-fill" style="width: ${(doshaScores.vata / 8) * 100}%"></div>
              </div>
              <span class="score-value">${doshaScores.vata}/8</span>
            </div>
            <div class="score-item">
              <span class="score-label">Pitta</span>
              <div class="score-bar">
                <div class="score-fill" style="width: ${(doshaScores.pitta / 8) * 100}%"></div>
              </div>
              <span class="score-value">${doshaScores.pitta}/8</span>
            </div>
            <div class="score-item">
              <span class="score-label">Kapha</span>
              <div class="score-bar">
                <div class="score-fill" style="width: ${(doshaScores.kapha / 8) * 100}%"></div>
              </div>
              <span class="score-value">${doshaScores.kapha}/8</span>
            </div>
          </div>

          <div class="section">
            <h3>✨ Your Characteristics</h3>
            <ul>
              ${doshaInfo.characteristics.map(char => `<li>${char}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h3>💆 Skincare Advice</h3>
            <ul>
              ${doshaInfo.skinAdvice.map(advice => `<li>${advice}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h3>🍽️ Diet Recommendations</h3>
            <ul>
              ${doshaInfo.dietAdvice.map(advice => `<li>${advice}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h3>🧘 Balancing Activities</h3>
            <ul>
              ${doshaInfo.balancingActivities.map(activity => `<li>${activity}</li>`).join('')}
            </ul>
          </div>

          <div class="risk-warning">
            <h4>⚠️ Tinea Risk Assessment</h4>
            <p><strong>Risk Level:</strong> ${doshaInfo.tineaRisk.risk}</p>
            <p>${doshaInfo.tineaRisk.description}</p>
          </div>

          <div class="footer">
            <p>This assessment is based on Ayurvedic principles and is for informational purposes only.</p>
            <p>Please consult with a qualified healthcare professional for medical advice.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Use html2pdf to generate PDF
    const element = document.createElement('div');
    element.innerHTML = reportHTML;
    
    const opt = {
      margin: 10,
      filename: `Dosha_Assessment_${primaryDosha.toUpperCase()}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // Dynamically import html2pdf
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default().set(opt).from(element).save();
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const primaryDosha = showResults ? getPrimaryDosha() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 pt-8">
          <h1 className="text-5xl font-bold text-white mb-3">Dosha Assessment</h1>
          <p className="text-xl text-pink-200">Discover Your Ayurvedic Constitution & Skin Profile</p>
          <Link href="/tinea">
            <button className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-300 rounded-lg transition-all text-sm">
              ← Back to Tinea Detection
            </button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            📚 Learn Doshas
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            ❓ Take Quiz
          </button>
          <button
            onClick={() => showResults && setActiveTab('result')}
            disabled={!showResults}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'result'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50'
            }`}
          >
            🎯 Results
          </button>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">What are Doshas?</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                In Ayurvedic medicine, the three doshas (Vata, Pitta, and Kapha) represent the fundamental energies that govern physical and mental
                characteristics. Understanding your dosha can help optimize your skincare routine and overall wellness.
              </p>
            </div>

            {/* Heart Rate Monitor Button */}
            <button
              onClick={() => window.open('http://172.20.10.6', '_blank')}
              className="w-full px-8 py-4 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-2xl transition-all text-lg mb-8 flex items-center justify-center gap-3"
            >
              <span className="text-2xl animate-pulse">❤️</span>
              Check Heart Rate Monitor
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['vata', 'pitta', 'kapha'] as const).map(dosha => {
                const info = DOSHA_INFO[dosha];
                return (
                  <div
                    key={dosha}
                    className={`bg-gradient-to-br ${info.gradientStart} ${info.gradientEnd} rounded-xl p-6 text-white shadow-2xl hover:scale-105 transition-transform`}
                  >
                    <div className="text-5xl mb-4">{info.emoji}</div>
                    <h3 className="text-2xl font-bold mb-3">{info.name}</h3>
                    <p className="text-sm opacity-90 mb-6">{info.description}</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-sm mb-2">✨ Key Traits:</h4>
                        <ul className="text-xs space-y-1">
                          {info.characteristics.slice(0, 4).map((char, i) => (
                            <li key={i}>• {char}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm mb-2">🍽️ Diet Tips:</h4>
                        <ul className="text-xs space-y-1">
                          {info.dietAdvice.slice(0, 2).map((advice, i) => (
                            <li key={i}>• {advice}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-white/30">
                        <p className="text-xs font-semibold">⚠️ Tinea Risk: {info.tineaRisk.risk}</p>
                        <p className="text-xs mt-1 opacity-80">{info.tineaRisk.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-2xl transition-all text-lg"
            >
              Start Your Assessment →
            </button>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="animate-fadeIn">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-semibold">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-pink-300 font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 border border-white/20 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` } as unknown as React.CSSProperties}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-10 mb-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-10">{question.question}</h2>

              <div className="space-y-4">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.dosha)}
                    className="w-full p-5 text-left bg-white/5 hover:bg-white/20 border-2 border-white/20 hover:border-white/50 rounded-lg transition-all duration-200 text-white font-semibold hover:shadow-lg hover:scale-105"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                    setAnswers(answers.slice(0, -1));
                  }
                }}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
              >
                ← Previous
              </button>

              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'result' && primaryDosha && (
          <div className="animate-fadeIn space-y-8">
            {/* Primary Dosha Display */}
            <div
              className={`bg-gradient-to-r ${DOSHA_INFO[primaryDosha].gradientStart} ${DOSHA_INFO[primaryDosha].gradientEnd} rounded-xl shadow-2xl p-10 text-white text-center`}
            >
              <div className="text-7xl mb-6">{DOSHA_INFO[primaryDosha].emoji}</div>
              <h2 className="text-5xl font-bold mb-3">{DOSHA_INFO[primaryDosha].name} Dosha</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">{DOSHA_INFO[primaryDosha].description}</p>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-8">Your Constitution Scores</h3>
              <div className="space-y-6">
                {(['vata', 'pitta', 'kapha'] as const).map(dosha => (
                  <div key={dosha}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold capitalize text-lg">{dosha}</span>
                      <span className="text-pink-300 font-bold text-lg">{doshaScores[dosha]}/8</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 border border-white/20 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          dosha === 'vata'
                            ? 'bg-blue-400'
                            : dosha === 'pitta'
                              ? 'bg-orange-400'
                              : 'bg-green-400'
                        }`}
                        style={{ width: `${(doshaScores[dosha] / 8) * 100}%` } as unknown as React.CSSProperties}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XAI/GradCAM Visualization */}
            {loadingXAI && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
                <p className="text-white font-semibold">Computing AI Explanations...</p>
              </div>
            )}

            {xaiData && !loadingXAI && (
              <GradCAMVisualization 
                doshaType={primaryDosha}
                gradcamData={xaiData.results}
                totalScore={xaiData.overallConfidence}
              />
            )}

            {/* Characteristics */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Your Characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOSHA_INFO[primaryDosha].characteristics.map((char, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <span className="text-white">{char}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skincare Advice */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">💆 Skincare Advice</h3>
              <ul className="space-y-3">
                {DOSHA_INFO[primaryDosha].skinAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <span className="text-xl">💧</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diet Advice */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">🍽️ Diet Recommendations</h3>
              <ul className="space-y-3">
                {DOSHA_INFO[primaryDosha].dietAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <span className="text-xl">🥗</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Balancing Activities */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">🧘 Balancing Activities</h3>
              <ul className="space-y-3">
                {DOSHA_INFO[primaryDosha].balancingActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <span className="text-xl">⚡</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tinea Risk */}
            <div className="bg-red-500/20 border-2 border-red-500/50 backdrop-blur-md rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">⚠️ Tinea Risk Assessment</h3>
              <p className="text-lg text-white mb-3">
                <span className="font-bold">Risk Level: {DOSHA_INFO[primaryDosha].tineaRisk.risk}</span>
              </p>
              <p className="text-white/80">{DOSHA_INFO[primaryDosha].tineaRisk.description}</p>
              <Link href="/tinea-full-details">
                <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:shadow-xl transition-all">
                  View Full Tinea Details →
                </button>
              </Link>
            </div>

            {/* Report Generation */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 backdrop-blur-md rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">📋 Generate Report</h3>
              <p className="text-white/80 mb-6">
                Download a comprehensive PDF report of your Dosha Assessment including your scores, characteristics, recommendations, and personalized advice.
              </p>
              <button
                onClick={generateReport}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>📥</span>
                Download PDF Report
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg font-semibold transition-all"
              >
                Retake Quiz
              </button>
              <Link href="/dashboard">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

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
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}
