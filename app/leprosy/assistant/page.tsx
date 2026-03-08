'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Calendar, HelpCircle, Pill, Activity, ArrowLeft, User, Plus, X, ExternalLink, History, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RiskAnalysisComponent from '../components/RiskAnalysis';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  sources?: {
    name: string;
    url?: string;
    organization?: string;
  }[];
  disclaimer?: string;
}

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  activity: string;
  description: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SymptomLogEntry {
  _id: string;
  userId: string;
  symptoms: {
    skinPatches: boolean;
    numbness: boolean;
    weakness: boolean;
    eyeIssues: boolean;
    painfulNerves: boolean;
    nerveThickening: boolean;
    lossSensation: boolean;
    other: string;
  };
  clinicalMeasurements?: {
    numberOfLesions?: number;
    largestLesionSizeCm?: number;
    skinSmearRight?: number;
    skinSmearLeft?: number;
    bacillusIndex?: number;
    morphologicalIndex?: number;
  };
  spreadingRate?: string;
  notes: string;
  timestamp: Date;
  createdAt: Date;
}

const COMMON_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'What should I do if I notice new patches on my skin?',
    answer: 'New patches should be reported to your healthcare provider immediately. Take clear photos and note the location and date. Do not delay seeking medical attention as early detection is crucial.',
    category: 'Detection'
  },
  {
    id: '2',
    question: 'How should I take care of my skin daily?',
    answer: 'Daily care includes: (1) Gentle cleansing with mild soap, (2) Keeping skin moisturized, (3) Protecting from sun exposure, (4) Checking for any new patches, (5) Applying prescribed medications as directed.',
    category: 'Care'
  },
  {
    id: '3',
    question: 'What should I avoid to prevent complications?',
    answer: 'Avoid: (1) Prolonged sun exposure, (2) Extreme temperature changes, (3) Trauma to affected areas, (4) Tight clothing over affected skin, (5) Sharing personal items like towels or razors.',
    category: 'Prevention'
  },
  {
    id: '4',
    question: 'How important is medication adherence?',
    answer: 'Medication adherence is critical. Missing doses can lead to treatment failure, drug resistance, and complications. Set reminders, keep a medication log, and always take your medications as prescribed.',
    category: 'Medication'
  },
  {
    id: '5',
    question: 'Can I exercise with leprosy?',
    answer: 'Yes, light to moderate exercise is beneficial. However, avoid activities that may cause injury to affected areas. Start with gentle exercises and gradually increase intensity. Always consult with your healthcare provider.',
    category: 'Lifestyle'
  },
  {
    id: '6',
    question: 'How often should I visit my doctor?',
    answer: 'Initially, monthly visits are common during active treatment. As your condition improves, this may be reduced. Always keep scheduled appointments and report any new symptoms immediately.',
    category: 'Medical'
  },
  {
    id: '7',
    question: 'What dietary changes should I make?',
    answer: 'Focus on: (1) Nutritious, balanced diet, (2) Adequate protein for skin healing, (3) Fruits and vegetables rich in vitamins, (4) Adequate hydration, (5) Limit processed foods and sugar.',
    category: 'Nutrition'
  },
  {
    id: '8',
    question: 'How do I manage nerve-related complications?',
    answer: 'Nerve complications require special attention. Protect affected limbs from injury, perform regular sensation checks, use protective eyewear if eyes are affected, and do regular nerve function exercises as instructed.',
    category: 'Complications'
  }
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: '1',
    day: 'Monday',
    time: '08:00 AM',
    activity: 'Morning Medication',
    description: 'Take prescribed MDT (Multi-Drug Therapy) medications with water'
  },
  {
    id: '2',
    day: 'Monday',
    time: '09:00 AM',
    activity: 'Skin Care Routine',
    description: 'Gentle cleansing, moisturizing affected areas'
  },
  {
    id: '3',
    day: 'Monday',
    time: '06:00 PM',
    activity: 'Evening Medication',
    description: 'Take evening dose of medications'
  },
  {
    id: '4',
    day: 'Tuesday',
    time: '08:00 AM',
    activity: 'Morning Medication',
    description: 'Take prescribed MDT medications'
  },
  {
    id: '5',
    day: 'Tuesday',
    time: '03:00 PM',
    activity: 'Nerve Function Check',
    description: 'Check sensation in affected areas, perform mobility exercises'
  },
  {
    id: '6',
    day: 'Wednesday',
    time: '08:00 AM',
    activity: 'Light Exercise',
    description: 'Gentle stretching and light physical activity'
  },
  {
    id: '7',
    day: 'Friday',
    time: '10:00 AM',
    activity: 'Symptom Documentation',
    description: 'Record any new symptoms or changes in existing conditions'
  },
  {
    id: '8',
    day: 'Sunday',
    time: '06:00 PM',
    activity: 'Weekly Review',
    description: 'Review the week, prepare for upcoming week, note any concerns'
  }
];

export default function LeprosyAssistantPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'symptoms' | 'schedule' | 'qa' | 'profile' | 'risk-analysis'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Leprosy Care Assistant. I\'m here to help you manage your leprosy treatment journey. You can discuss your symptoms, ask questions about self-care, or get information about your treatment plan. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [symptoms, setSymptoms] = useState({
    skinPatches: false,
    numbness: false,
    weakness: false,
    eyeIssues: false,
    painfulNerves: false,
    nerveThickening: false,
    lossSensation: false,
    other: ''
  });
  const [clinicalMeasurements, setClinicalMeasurements] = useState({
    numberOfLesions: '' as string | number,
    largestLesionSizeCm: '' as string | number,
    skinSmearRight: '' as string | number,
    skinSmearLeft: '' as string | number,
    bacillusIndex: '' as string | number,
    morphologicalIndex: '' as string | number
  });
  const [spreadingRate, setSpreadingRate] = useState('static');
  const [symptomNotes, setSymptomNotes] = useState('');
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [searchFAQ, setSearchFAQ] = useState('');
  
  // Profile state
  const [profile, setProfile] = useState({
    personalInfo: {
      age: undefined as number | undefined,
      gender: '',
      weight: undefined as number | undefined,
      height: undefined as number | undefined,
      householdContacts: undefined as number | undefined
    },
    medical: {
      leprosyType: '',
      treatmentDuration: undefined as number | undefined,
      treatmentStatus: 'ongoing',
      prevTreatment: false,
      currentMedications: [] as string[],
      allergies: [] as string[],
      comorbidities: [] as string[]
    },
    leprosy: {
      affectedAreas: [] as string[],
      nerveInvolvement: false,
      eyeInvolvement: false,
      disabilities: [] as string[],
      treatmentResponse: 'unknown'
    },
    lifestyle: {
      occupation: '',
      physicalActivity: 'moderate',
      dietQuality: 'moderate',
      sleepHours: 7,
      smokingStatus: 'never',
      stressLevel: 'moderate',
      treatmentAccess: 'good',
      hygiene_conditions: 'moderate'
    },
    goals: [] as string[],
    notes: ''
  });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [comorbidityInput, setComorbidityInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [disabilityInput, setDisabilityInput] = useState('');
  const [goalInput, setGoalInput] = useState('');


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/leprosy/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (error) {
        console.log('No profile found, starting fresh');
      }
    };
    
    loadProfile();
  }, []);

  // Load symptom logs on mount and when symptoms section is viewed
  useEffect(() => {
    const loadSymptomLogs = async () => {
      try {
        setLoadingLogs(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/leprosy/symptom-logs', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.logs) {
            setSymptomLogs(data.logs);
          }
        }
      } catch (error) {
        console.error('Error loading symptom logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    };
    
    loadSymptomLogs();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('http://localhost:4000/api/leprosy/chat/leprosy-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: user.id,
          context: 'leprosy_care'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || 'I understand. Please provide more details so I can better assist you.',
          sender: 'assistant',
          timestamp: new Date(),
          sources: data.sources || [],
          disclaimer: data.disclaimer
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response if API fails
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAssistantResponse(inputMessage),
          sender: 'assistant',
          timestamp: new Date(),
          disclaimer: 'Always consult your healthcare provider for personalized advice.'
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAssistantResponse(inputMessage),
        sender: 'assistant',
        timestamp: new Date(),
        disclaimer: 'Always consult your healthcare provider for personalized advice.'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAssistantResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return 'Medication adherence is crucial for leprosy treatment. Please take your MDT (Multi-Drug Therapy) medications exactly as prescribed. Do not skip doses even if you feel better. If you experience side effects, report them to your healthcare provider immediately.';
    }
    if (lowerMessage.includes('skin') || lowerMessage.includes('patch')) {
      return 'Skin monitoring is important. Check your skin regularly for any new patches or changes. If you notice anything new or unusual, document it with photos and report to your doctor at your next visit.';
    }
    if (lowerMessage.includes('nerve') || lowerMessage.includes('sensation')) {
      return 'Nerve damage is a concern with leprosy. Regularly check the sensation in your hands, feet, and face. Perform gentle exercises as instructed. If you notice any numbness or weakness, contact your healthcare provider.';
    }
    if (lowerMessage.includes('treatment') || lowerMessage.includes('cure')) {
      return 'Leprosy is curable with proper treatment. Most patients become non-infectious after the first dose of MDT. Complete treatment usually takes 6-12 months depending on the type. Regular follow-up is essential even after treatment completion.';
    }
    if (lowerMessage.includes('contagious') || lowerMessage.includes('spread')) {
      return 'Untreated leprosy can be contagious through respiratory droplets with close, prolonged contact. However, once you start treatment, you become non-infectious within a few weeks. People in close contact should be monitored by a healthcare provider.';
    }
    
    return 'Thank you for your question. Based on your concern, I recommend discussing this with your healthcare provider for personalized guidance. In the meantime, ensure you\'re following your medication schedule and keeping your skin care routine consistent.';
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id || user.userId;

      if (!userId) {
        setProfileMessage('✗ User ID not found. Please log in again.');
        setProfileLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:4000/api/leprosy/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          ...profile
        })
      });

      if (response.ok) {
        setProfileMessage('✓ Profile saved successfully! Your personalized guidance will now be tailored to your needs.');
        setTimeout(() => setProfileMessage(''), 3000);
      } else {
        const error = await response.json();
        setProfileMessage('✗ Failed to save profile: ' + (error.error || error.message || 'Unknown error'));
      }
    } catch (error) {
      setProfileMessage('✗ Error saving profile. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSymptomSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id || user.userId;

      if (!token) {
        alert('Error: Not logged in. Please log in first.');
        console.error('No token found in localStorage');
        return;
      }

      if (!userId) {
        alert('Error: User ID not found. Please log in again.');
        console.error('No user ID found in localStorage', { user });
        return;
      }

      console.log('Submitting symptoms for user:', userId);

      const response = await fetch('http://localhost:4000/api/leprosy/symptom-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          symptoms: {
            skinPatches: symptoms.skinPatches,
            numbness: symptoms.numbness,
            weakness: symptoms.weakness,
            eyeIssues: symptoms.eyeIssues,
            painfulNerves: symptoms.painfulNerves,
            nerveThickening: symptoms.nerveThickening,
            lossSensation: symptoms.lossSensation,
            other: symptoms.other
          },
          clinicalMeasurements: {
            numberOfLesions: clinicalMeasurements.numberOfLesions !== '' ? Number(clinicalMeasurements.numberOfLesions) : undefined,
            largestLesionSizeCm: clinicalMeasurements.largestLesionSizeCm !== '' ? Number(clinicalMeasurements.largestLesionSizeCm) : undefined,
            skinSmearRight: clinicalMeasurements.skinSmearRight !== '' ? Number(clinicalMeasurements.skinSmearRight) : undefined,
            skinSmearLeft: clinicalMeasurements.skinSmearLeft !== '' ? Number(clinicalMeasurements.skinSmearLeft) : undefined,
            bacillusIndex: clinicalMeasurements.bacillusIndex !== '' ? Number(clinicalMeasurements.bacillusIndex) : undefined,
            morphologicalIndex: clinicalMeasurements.morphologicalIndex !== '' ? Number(clinicalMeasurements.morphologicalIndex) : undefined
          },
          spreadingRate,
          notes: symptomNotes,
          timestamp: new Date()
        })
      });

      console.log('Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Symptoms logged successfully:', data);
        alert('Symptoms logged successfully!');
        setSymptoms({ skinPatches: false, numbness: false, weakness: false, eyeIssues: false, painfulNerves: false, nerveThickening: false, lossSensation: false, other: '' });
        setClinicalMeasurements({ numberOfLesions: '', largestLesionSizeCm: '', skinSmearRight: '', skinSmearLeft: '', bacillusIndex: '', morphologicalIndex: '' });
        setSpreadingRate('static');
        setSymptomNotes('');
        
        // Reload symptom logs
        const logsResponse = await fetch('http://localhost:4000/api/leprosy/symptom-logs', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          if (logsData.logs) {
            setSymptomLogs(logsData.logs);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error:', response.status, errorData);
        alert(`Error: ${errorData.error || 'Failed to log symptoms (Status: ' + response.status + ')'}`);
      }
    } catch (error) {
      console.error('Network/Fetch error submitting symptoms:', error);
      alert(`Failed to log symptoms: ${error instanceof Error ? error.message : 'Network error - is the backend running on port 5000?'}`);
    }
  };

  const filteredFAQs = COMMON_FAQS.filter(faq =>
    faq.question.toLowerCase().includes(searchFAQ.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchFAQ.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pt-20 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-4xl font-bold">Leprosy Care Assistant</h1>
            <p className="text-red-100 mt-2">Personalized support for your treatment journey</p>
          </div>
          <Heart className="w-12 h-12 text-red-200 opacity-80" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'chat'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'symptoms'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Activity className="w-5 h-5" />
            Symptoms
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'schedule'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'qa'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Q&A
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('risk-analysis')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'risk-analysis'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Risk Analysis
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-red-50/50 to-white">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-xs lg:max-w-md">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-red-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-red-100' : 'text-gray-600'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {/* Show sources and disclaimer for assistant messages */}
                      {message.sender === 'assistant' && (message.sources?.length || message.disclaimer) && (
                        <div className="mt-3 max-w-md text-xs text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
                          {message.sources && message.sources.length > 0 && (
                            <div className="mb-2">
                              <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                📌 Sources:
                              </p>
                              <ul className="space-y-1">
                                {message.sources.map((source, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-blue-600">•</span>
                                    {source.url ? (
                                      <a 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                                      >
                                        {source.organization || source.name}
                                        <ExternalLink size={12} />
                                      </a>
                                    ) : (
                                      <span className="text-gray-700">{source.organization || source.name}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {message.disclaimer && (
                            <div className="pt-2 border-t border-blue-100">
                              <p className="italic text-gray-600">{message.disclaimer}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about your treatment, symptoms, or self-care..."
                    className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === 'symptoms' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 max-h-[800px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Log Your Symptoms</h2>
            <p className="text-gray-600 mb-6">Track your symptoms regularly to monitor your condition and share with your healthcare provider.</p>

            {/* Symptom Checkboxes */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Clinical Symptoms</h3>
              {[
                { key: 'skinPatches', label: 'New or changing skin patches' },
                { key: 'numbness', label: 'Numbness or loss of sensation' },
                { key: 'weakness', label: 'Weakness in hands or feet' },
                { key: 'eyeIssues', label: 'Eye issues or vision problems' },
                { key: 'painfulNerves', label: 'Painful nerves' },
                { key: 'nerveThickening', label: 'Nerve thickening (palpable)' },
                { key: 'lossSensation', label: 'Loss of touch sensation' }
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:bg-red-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={symptoms[item.key as keyof typeof symptoms] as boolean}
                    onChange={(e) => setSymptoms(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className="w-5 h-5 text-red-600 rounded cursor-pointer"
                  />
                  <span className="font-medium text-gray-800">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Spreading Rate */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Spreading Rate</label>
              <select
                value={spreadingRate}
                onChange={(e) => setSpreadingRate(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
              >
                <option value="static">Static (no change)</option>
                <option value="slow">Slow progression</option>
                <option value="rapid">Rapid progression</option>
              </select>
            </div>

            {/* Clinical Measurements */}
            <div className="mb-6 p-4 rounded-2xl border border-blue-200 bg-blue-50">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Clinical Measurements (optional — for AI analysis)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Lesions</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={clinicalMeasurements.numberOfLesions}
                    onChange={(e) => setClinicalMeasurements(prev => ({ ...prev, numberOfLesions: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Largest Lesion Size (cm)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 3.5"
                    value={clinicalMeasurements.largestLesionSizeCm}
                    onChange={(e) => setClinicalMeasurements(prev => ({ ...prev, largestLesionSizeCm: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Skin Smear — Right (0–6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    step="0.5"
                    placeholder="0–6"
                    value={clinicalMeasurements.skinSmearRight}
                    onChange={(e) => setClinicalMeasurements(prev => ({ ...prev, skinSmearRight: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Skin Smear — Left (0–6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    step="0.5"
                    placeholder="0–6"
                    value={clinicalMeasurements.skinSmearLeft}
                    onChange={(e) => setClinicalMeasurements(prev => ({ ...prev, skinSmearLeft: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Bacillus Index (BI, 0–6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    value={clinicalMeasurements.bacillusIndex}
                    onChange={(e) => setClinicalMeasurements(prev => ({ ...prev, bacillusIndex: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Morphological Index (MI, 0–100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="e.g. 40"
                    value={clinicalMeasurements.morphologicalIndex}
                    onChange={(e) => setClinicalMeasurements(prev => ({ ...prev, morphologicalIndex: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">These values are used by the AI model to classify leprosy type and improve risk predictions.</p>
            </div>

            {/* Additional Symptom Notes */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Other symptoms or notes</label>
              <textarea
                value={symptomNotes}
                onChange={(e) => setSymptomNotes(e.target.value)}
                placeholder="Describe any other symptoms, severity, or additional observations..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleSymptomSubmit}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-bold hover:shadow-lg transition-all mb-8"
            >
              Log Symptoms
            </button>

            {/* Symptom History Section */}
            <div className="border-t pt-8">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-red-600" />
                <h3 className="text-2xl font-bold text-gray-900">Symptom History</h3>
              </div>

              {loadingLogs ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading your symptom history...</p>
                </div>
              ) : symptomLogs.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-gray-600">No symptom logs yet. Start tracking by logging your symptoms above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {symptomLogs.map((log) => (
                    <div key={log._id} className="p-4 rounded-2xl border border-gray-200 hover:border-red-300 hover:bg-red-50/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(log.timestamp || log.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {log.symptoms.skinPatches && (
                          <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-full">
                            🔴 Skin patches
                          </span>
                        )}
                        {log.symptoms.numbness && (
                          <span className="text-sm px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                            🟠 Numbness
                          </span>
                        )}
                        {log.symptoms.weakness && (
                          <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                            🟡 Weakness
                          </span>
                        )}
                        {log.symptoms.eyeIssues && (
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            🔵 Eye issues
                          </span>
                        )}
                        {log.symptoms.painfulNerves && (
                          <span className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            🟣 Painful nerves
                          </span>
                        )}
                        {log.symptoms.nerveThickening && (
                          <span className="text-sm px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                            🫀 Nerve thickening
                          </span>
                        )}
                        {log.symptoms.lossSensation && (
                          <span className="text-sm px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                            ✋ Loss of sensation
                          </span>
                        )}
                        {log.symptoms.other && (
                          <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            ⚪ Other
                          </span>
                        )}
                      </div>

                      {log.clinicalMeasurements && Object.values(log.clinicalMeasurements).some(v => v !== undefined && v !== null) && (
                        <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-700 font-semibold mb-1">Clinical Measurements:</p>
                          <div className="grid grid-cols-2 gap-1 text-xs text-blue-900">
                            {log.clinicalMeasurements.numberOfLesions !== undefined && <span>Lesions: {log.clinicalMeasurements.numberOfLesions}</span>}
                            {log.clinicalMeasurements.largestLesionSizeCm !== undefined && <span>Size: {log.clinicalMeasurements.largestLesionSizeCm} cm</span>}
                            {log.clinicalMeasurements.skinSmearRight !== undefined && <span>Smear R: {log.clinicalMeasurements.skinSmearRight}</span>}
                            {log.clinicalMeasurements.skinSmearLeft !== undefined && <span>Smear L: {log.clinicalMeasurements.skinSmearLeft}</span>}
                            {log.clinicalMeasurements.bacillusIndex !== undefined && <span>BI: {log.clinicalMeasurements.bacillusIndex}</span>}
                            {log.clinicalMeasurements.morphologicalIndex !== undefined && <span>MI: {log.clinicalMeasurements.morphologicalIndex}%</span>}
                          </div>
                        </div>
                      )}

                      {log.symptoms.other && (
                        <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 font-semibold">Other symptoms:</p>
                          <p className="text-sm text-gray-700">{log.symptoms.other}</p>
                        </div>
                      )}

                      {log.notes && (
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-600 font-semibold">Notes:</p>
                          <p className="text-sm text-blue-900">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Care Schedule</h2>
            <p className="text-gray-600 mb-8">Follow this personalized schedule to manage your treatment and self-care effectively.</p>

            <div className="space-y-4">
              {schedule.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          {item.day}
                        </span>
                        <span className="font-bold text-gray-900">{item.time}</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{item.activity}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <Pill className="w-6 h-6 text-red-600 flex-shrink-0 mt-2" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Set phone reminders for each activity to ensure consistency. Adherence to your schedule is crucial for successful treatment.
              </p>
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

            <div className="mb-6">
              <input
                type="text"
                value={searchFAQ}
                onChange={(e) => setSearchFAQ(e.target.value)}
                placeholder="Search questions..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setSelectedFAQ(selectedFAQ?.id === faq.id ? null : faq)}
                  className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{faq.question}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                        {faq.category}
                      </span>
                    </div>
                    <div className={`text-red-600 transition-transform ${selectedFAQ?.id === faq.id ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>

                  {selectedFAQ?.id === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No questions match your search. Try different keywords.</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Health Profile</h2>
            <p className="text-gray-600 mb-6">
              Provide your health information for personalized guidance from your AI assistant.
            </p>

            {profileMessage && (
              <div className={`mb-6 p-4 rounded-2xl text-center font-semibold ${
                profileMessage.includes('✓') 
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {profileMessage}
              </div>
            )}

            <div className="space-y-8">
              {/* Personal Information */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Age"
                    value={profile.personalInfo.age || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      personalInfo: { ...profile.personalInfo, age: e.target.value ? parseInt(e.target.value) : undefined }
                    })}
                    className="px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />
                  <select
                    value={profile.personalInfo.gender}
                    onChange={(e) => setProfile({
                      ...profile,
                      personalInfo: { ...profile.personalInfo, gender: e.target.value }
                    })}
                    className="px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={profile.personalInfo.weight || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      personalInfo: { ...profile.personalInfo, weight: e.target.value ? parseInt(e.target.value) : undefined }
                    })}
                    className="px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={profile.personalInfo.height || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      personalInfo: { ...profile.personalInfo, height: e.target.value ? parseInt(e.target.value) : undefined }
                    })}
                    className="px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="number"
                    placeholder="Household Contacts (for AI model)"
                    min="0"
                    value={profile.personalInfo.householdContacts ?? ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      personalInfo: { ...profile.personalInfo, householdContacts: e.target.value ? parseInt(e.target.value) : undefined }
                    })}
                    className="px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-red-600" />
                  Medical Information
                </h3>
                <div className="space-y-4">
                  <select
                    value={profile.medical.leprosyType}
                    onChange={(e) => setProfile({
                      ...profile,
                      medical: { ...profile.medical, leprosyType: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="">Select Leprosy Type</option>
                    <option value="multibacillary">Multibacillary</option>
                    <option value="paucibacillary">Paucibacillary</option>
                    {/* <option value="borderline">Borderline</option> */}
                    {/* <option value="lepromatous">Lepromatous</option> */}
                    <option value="unknown">Unknown</option>
                  </select>

                  <select
                    value={profile.medical.treatmentStatus}
                    onChange={(e) => setProfile({
                      ...profile,
                      medical: { ...profile.medical, treatmentStatus: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="ongoing">Treatment Ongoing</option>
                    <option value="completed">Treatment Completed</option>
                    <option value="not_started">Not Started</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Treatment Duration (months)"
                    value={profile.medical.treatmentDuration || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      medical: { ...profile.medical, treatmentDuration: e.target.value ? parseInt(e.target.value) : undefined }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />

                  <label className="flex items-center gap-3 cursor-pointer p-2">
                    <input
                      type="checkbox"
                      checked={profile.medical.prevTreatment}
                      onChange={(e) => setProfile({
                        ...profile,
                        medical: { ...profile.medical, prevTreatment: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                    />
                    <span className="text-sm font-semibold text-gray-700">Previously treated for leprosy</span>
                  </label>

                  {/* Medications */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
                    <div className="space-y-2 mb-3">
                      {profile.medical.currentMedications.map((med, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl">
                          <span className="flex-1 text-sm">{med}</span>
                          <button
                            onClick={() => setProfile({
                              ...profile,
                              medical: {
                                ...profile.medical,
                                currentMedications: profile.medical.currentMedications.filter((_, i) => i !== idx)
                              }
                            })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={medicationInput}
                        onChange={(e) => setMedicationInput(e.target.value)}
                        placeholder="Add medication (e.g., Rifampicin)"
                        className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                      />
                      <button
                        onClick={() => {
                          if (medicationInput.trim()) {
                            setProfile({
                              ...profile,
                              medical: {
                                ...profile.medical,
                                currentMedications: [...profile.medical.currentMedications, medicationInput]
                              }
                            });
                            setMedicationInput('');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Known Allergies</label>
                    <div className="space-y-2 mb-3">
                      {profile.medical.allergies.map((allergy, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl">
                          <span className="flex-1 text-sm">{allergy}</span>
                          <button
                            onClick={() => setProfile({
                              ...profile,
                              medical: {
                                ...profile.medical,
                                allergies: profile.medical.allergies.filter((_, i) => i !== idx)
                              }
                            })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={allergyInput}
                        onChange={(e) => setAllergyInput(e.target.value)}
                        placeholder="Add allergy"
                        className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                      />
                      <button
                        onClick={() => {
                          if (allergyInput.trim()) {
                            setProfile({
                              ...profile,
                              medical: {
                                ...profile.medical,
                                allergies: [...profile.medical.allergies, allergyInput]
                              }
                            });
                            setAllergyInput('');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comorbidities */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Other Medical Conditions</label>
                    <div className="space-y-2 mb-3">
                      {profile.medical.comorbidities.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl">
                          <span className="flex-1 text-sm">{condition}</span>
                          <button
                            onClick={() => setProfile({
                              ...profile,
                              medical: {
                                ...profile.medical,
                                comorbidities: profile.medical.comorbidities.filter((_, i) => i !== idx)
                              }
                            })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={comorbidityInput}
                        onChange={(e) => setComorbidityInput(e.target.value)}
                        placeholder="Add condition (e.g., Diabetes)"
                        className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                      />
                      <button
                        onClick={() => {
                          if (comorbidityInput.trim()) {
                            setProfile({
                              ...profile,
                              medical: {
                                ...profile.medical,
                                comorbidities: [...profile.medical.comorbidities, comorbidityInput]
                              }
                            });
                            setComorbidityInput('');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leprosy Specifics */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Leprosy Specifics</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Affected Areas</label>
                    <div className="space-y-2 mb-3">
                      {profile.leprosy.affectedAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl">
                          <span className="flex-1 text-sm">{area}</span>
                          <button
                            onClick={() => setProfile({
                              ...profile,
                              leprosy: {
                                ...profile.leprosy,
                                affectedAreas: profile.leprosy.affectedAreas.filter((_, i) => i !== idx)
                              }
                            })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={areaInput}
                        onChange={(e) => setAreaInput(e.target.value)}
                        placeholder="Add affected area (e.g., Left hand)"
                        className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                      />
                      <button
                        onClick={() => {
                          if (areaInput.trim()) {
                            setProfile({
                              ...profile,
                              leprosy: {
                                ...profile.leprosy,
                                affectedAreas: [...profile.leprosy.affectedAreas, areaInput]
                              }
                            });
                            setAreaInput('');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.leprosy.nerveInvolvement}
                        onChange={(e) => setProfile({
                          ...profile,
                          leprosy: { ...profile.leprosy, nerveInvolvement: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">Nerve Involvement</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.leprosy.eyeInvolvement}
                        onChange={(e) => setProfile({
                          ...profile,
                          leprosy: { ...profile.leprosy, eyeInvolvement: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">Eye Involvement</span>
                    </label>
                  </div>

                  <select
                    value={profile.leprosy.treatmentResponse}
                    onChange={(e) => setProfile({
                      ...profile,
                      leprosy: { ...profile.leprosy, treatmentResponse: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="unknown">Treatment Response</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="moderate">Moderate</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              {/* Lifestyle */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lifestyle</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Occupation"
                    value={profile.lifestyle.occupation}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, occupation: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />

                  <select
                    value={profile.lifestyle.physicalActivity}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, physicalActivity: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="sedentary">Sedentary (Little activity)</option>
                    <option value="light">Light Activity</option>
                    <option value="moderate">Moderate Activity</option>
                    <option value="vigorous">Vigorous Activity</option>
                  </select>

                  <select
                    value={profile.lifestyle.dietQuality}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, dietQuality: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="poor">Poor Diet Quality</option>
                    <option value="moderate">Moderate Diet Quality</option>
                    <option value="good">Good Diet Quality</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Average Sleep Hours (per day)"
                    min="0"
                    max="24"
                    value={profile.lifestyle.sleepHours}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, sleepHours: parseInt(e.target.value) || 7 }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  />

                  <select
                    value={profile.lifestyle.smokingStatus}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, smokingStatus: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="current">Current Smoker</option>
                  </select>

                  <select
                    value={profile.lifestyle.stressLevel}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, stressLevel: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="low">Stress Level — Low</option>
                    <option value="moderate">Stress Level — Moderate</option>
                    <option value="high">Stress Level — High</option>
                  </select>

                  <select
                    value={profile.lifestyle.treatmentAccess}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, treatmentAccess: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="good">Treatment Access — Good</option>
                    <option value="limited">Treatment Access — Limited</option>
                    <option value="poor">Treatment Access — Poor</option>
                  </select>

                  <select
                    value={profile.lifestyle.hygiene_conditions}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, hygiene_conditions: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                  >
                    <option value="good">Hygiene Conditions — Good</option>
                    <option value="moderate">Hygiene Conditions — Moderate</option>
                    <option value="poor">Hygiene Conditions — Poor</option>
                  </select>
                </div>
              </div>

              {/* Goals & Notes */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Goals</label>
                    <div className="space-y-2 mb-3">
                      {profile.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl">
                          <span className="flex-1 text-sm">{goal}</span>
                          <button
                            onClick={() => setProfile({
                              ...profile,
                              goals: profile.goals.filter((_, i) => i !== idx)
                            })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="Add goal (e.g., Complete treatment)"
                        className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600"
                      />
                      <button
                        onClick={() => {
                          if (goalInput.trim()) {
                            setProfile({
                              ...profile,
                              goals: [...profile.goals, goalInput]
                            });
                            setGoalInput('');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={profile.notes}
                    onChange={(e) => setProfile({
                      ...profile,
                      notes: e.target.value
                    })}
                    placeholder="Any additional notes or concerns..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 font-semibold transition-colors"
              >
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="flex-1 px-6 py-3 border-2 border-red-600 text-red-600 rounded-2xl hover:bg-red-50 font-semibold transition-colors"
              >
                Back to Chat
              </button>
            </div>
          </div>
        )}

        {/* Risk Analysis Tab */}
        {activeTab === 'risk-analysis' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200">
            <RiskAnalysisComponent />
          </div>
        )}
      </div>
    </div>
  );
}
