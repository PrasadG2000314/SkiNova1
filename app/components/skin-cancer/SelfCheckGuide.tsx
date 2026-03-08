"use client";

import React, { useState } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  ScanFace,
  Shirt,
  Hand,
  Footprints,
  Maximize2,
  Lightbulb,
  Search,
  Sparkles,
  Shield,
  type LucideIcon
} from "lucide-react";

interface SelfCheckGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnimatedIcon = ({ 
  icon: Icon, 
  size = "w-24 h-24", 
  color = "text-green-600" 
}: { 
  icon: LucideIcon; 
  size?: string; 
  color?: string; 
}) => (
  <div className={`relative ${size}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl blur-xl opacity-20 animate-pulse" />
    <Icon className={`${size} ${color} relative z-10`} />
  </div>
);

const steps: any[] = [
  {
    id: "intro",
    title: "Self-Skin Check",
    subtitle: "Your Personal Skin Health Guide",
    layout: "center",
    visual: { icon: Search, color: "text-green-600" },
    content: (
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-gray-900">Early Detection Saves Lives</h3>
          <p className="text-lg text-gray-600 leading-relaxed max-w-md">
            Doing a self-skin check at home is the simplest way to notice changes before they become serious.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 shadow-sm">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">10-15 Minutes</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 shadow-sm">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-900">Once a Month</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "prep",
    title: "Gather Your Tools",
    subtitle: "You'll Need These 4 Items",
    layout: "grid",
    items: [
      { icon: Maximize2, title: "Full-Length Mirror", desc: "To see your entire body from head to toe" },
      { icon: Search, title: "Hand Mirror", desc: "For checking hard-to-reach areas like your back" },
      { icon: Lightbulb, title: "Bright Lighting", desc: "Natural daylight window is ideal" },
      { icon: ScanFace, title: "Comb/Hair Dryer", desc: "To part your hair and inspect the scalp thoroughly" },
    ]
  },
  {
    id: "step1",
    title: "Step 1: Face & Scalp",
    subtitle: "Start from the top and work your way down",
    layout: "split",
    visual: { icon: ScanFace, color: "text-green-600" },
    instructions: [
      "Stand in front of the mirror with good face lighting",
      "Examine your face, nose, lips, and both ears front and back",
      "Use bright light and a comb to part hair and check your scalp",
      "Ask someone to help check areas you can't see easily"
    ]
  },
  {
    id: "step2",
    title: "Step 2: Upper Body",
    subtitle: "Check neck, chest, arms, and underarms",
    layout: "split",
    visual: { icon: Shirt, color: "text-emerald-600" },
    instructions: [
      "Check your neck, collarbone, chest, and abdomen",
      "Don't forget to check underneath your breasts",
      "Raise your arms and examine both sides thoroughly",
      "Pay special attention to your underarms and armpits"
    ]
  },
  {
    id: "step3",
    title: "Step 3: Hands & Nails",
    subtitle: "Examine palms, fingers, and nails",
    layout: "split",
    visual: { icon: Hand, color: "text-teal-600" },
    instructions: [
      "Look at the palms and backs of your hands with a mirror",
      "Check between each finger carefully",
      "Examine your fingernails and the skin underneath",
      "Check your wrists and forearms on all sides"
    ]
  },
  {
    id: "step4",
    title: "Step 4: Back & Shoulders",
    subtitle: "Use mirrors to check what you can't see",
    layout: "split",
    visual: { icon: Maximize2, color: "text-green-500" },
    instructions: [
      "Turn around and face your full-length mirror",
      "Use the hand mirror to see your back reflection",
      "Carefully examine your neck, shoulders, and shoulder blades",
      "Scan your entire back down to your lower back"
    ]
  },
  {
    id: "step5",
    title: "Step 5: Lower Body",
    subtitle: "Don't forget legs, feet, and private areas",
    layout: "split",
    visual: { icon: Footprints, color: "text-emerald-500" },
    instructions: [
      "Sit down and examine your legs from thigh to ankle",
      "Check the front and back of your legs carefully",
      "Examine your feet, soles, and between your toes",
      "Check toenails and examine genital and buttock areas"
    ]
  },
  {
    id: "abcde",
    title: "The ABCDE Rule",
    subtitle: "Universal Warning Signs for Skin Cancer",
    layout: "cards",
    intro: "Use these five criteria to identify suspicious spots and moles:",
    cards: [
      { 
        letter: "A", 
        title: "Asymmetry", 
        shortDesc: "One half doesn't match the other",
        fullDesc: "Imagine a line through the center of the mole. A normal mole should look the same on both sides. If one half is larger, a different shape, or color than the other—that's a red flag.",
        color: "from-green-500 to-green-600"
      },
      { 
        letter: "B", 
        title: "Border", 
        shortDesc: "Irregular or poorly defined edges",
        fullDesc: "Healthy moles have smooth, even, well-defined borders. If the edges are ragged, notched, scalloped, or fade into surrounding skin—get it checked. Clean edges = healthy mole.",
        color: "from-emerald-500 to-green-600"
      },
      { 
        letter: "C", 
        title: "Color", 
        shortDesc: "Multiple colors in one spot",
        fullDesc: "Normal moles are a single shade of brown, tan, or black. Concerning spots have multiple colors—red, white, blue, dark brown, or black all in one mole. Variety = warning sign.",
        color: "from-teal-500 to-emerald-600"
      },
      { 
        letter: "D", 
        title: "Diameter", 
        shortDesc: "Larger than a pencil eraser",
        fullDesc: "Any mole larger than 6 millimeters (size of a pencil eraser) needs attention. Especially if it's combined with other ABCE features. Size matters—bigger isn't always better.",
        color: "from-green-600 to-emerald-700"
      },
      { 
        letter: "E", 
        title: "Evolving", 
        shortDesc: "Changing over time",
        fullDesc: "Watch for any changes—growing larger, shape shifting, color changing, or new symptoms (itching, bleeding, oozing). Moles that stay the same are safe. Changes = seek help.",
        color: "from-emerald-500 to-teal-600"
      },
    ]
  },
  {
    id: "tips",
    title: "Final Tips",
    subtitle: "Make checking your skin a healthy habit",
    layout: "tips",
    items: [
      { 
        icon: Camera, 
        title: "Document Your Moles", 
        desc: "Take clear photos of existing moles on the same date each month. This creates a visual timeline to track any subtle changes.",
        color: "from-green-600 to-emerald-600"
      },
      { 
        icon: Calendar, 
        title: "Schedule It Monthly", 
        desc: "Pick the same day each month—like the 1st—to perform your check. Set a phone reminder so you never miss your appointment with yourself.",
        color: "from-emerald-600 to-teal-600"
      },
      { 
        icon: AlertTriangle, 
        title: "Act on Concerns", 
        desc: "If you notice anything changing, itching, bleeding, or different—don't wait. Schedule a dermatologist appointment immediately.",
        color: "from-teal-600 to-green-700"
      },
    ]
  }
];

export default function SelfCheckGuide({ isOpen, onClose }: SelfCheckGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const next = () => {
    if (isLast) {
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep(c => c + 1);
    }
  };

  const prev = () => setCurrentStep(c => Math.max(0, c - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-green-100/30 flex flex-col h-[650px] transition-all duration-300">
          
          {/* Premium Header */}
          <div className="relative px-8 py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border-b border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="relative z-10 flex justify-between items-start gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-black text-white mb-1">{step.title}</h2>
                <p className="text-white/80 text-sm font-medium">{step.subtitle}</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 hover:bg-white/20 rounded-full transition-all hover:scale-110 text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Animated Progress Bar */}
            <div className="mt-6 relative h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-lg shadow-green-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-white/70 font-semibold">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-8 py-8 scroll-smooth">
            
            {/* Centered Intro */}
            {step.layout === 'center' && (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto animate-in fade-in duration-500">
                <div className="mb-8">
                  <AnimatedIcon icon={step.visual.icon} size="w-32 h-32" color={step.visual.color} />
                </div>
                {step.content}
              </div>
            )}

            {/* Grid Tools */}
            {step.layout === 'grid' && step.items && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                {step.items.map((item: any, i: number) => (
                  <div 
                    key={i} 
                    className="group relative glass-effect p-6 rounded-2xl border border-white/10 hover:border-green-400/50 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="p-3 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                        <item.icon className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Split Instructions */}
            {step.layout === 'split' && step.instructions && (
              <div className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in duration-500">
                <div className="flex-1 hidden lg:block">
                  <div className="sticky top-8">
                    <div className="relative h-64 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 rounded-2xl" />
                      <div className="h-full flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl blur-xl opacity-20 animate-pulse" />
                          {React.createElement(step.visual.icon, { className: `w-32 h-32 ${step.visual.color} relative` })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {step.instructions.map((inst: string, i: number) => (
                    <div key={i} className="group flex gap-4 p-4 rounded-xl bg-white/40 border border-white/20 hover:bg-white/60 hover:border-green-300/50 transition-all hover:shadow-md">
                      <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-green-500/50 transition-all group-hover:scale-110">
                          {i + 1}
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium leading-snug pt-1">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABCDE Cards */}
            {step.layout === 'cards' && step.cards && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-lg font-bold text-gray-900">{step.intro}</p>
                  <p className="text-sm text-gray-600">Learn to identify these five key warning signs</p>
                </div>
                
                <div className="space-y-4">
                  {step.cards.map((card: any, i: number) => (
                    <div 
                      key={i}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer"
                    >
                      {/* Gradient bg */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-5 group-hover:opacity-15 transition-all`} />
                      
                      {/* Border gradient */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-clip-padding transition-all group-hover:border-green-400/50" style={{
                        borderImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3)) 1`
                      }} />
                      
                      <div className="relative p-7 backdrop-blur-sm bg-white/50 border border-white/40 ">
                        <div className="flex items-start gap-6">
                          {/* Letter Circle */}
                          <div className={`flex-shrink-0 relative w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br ${card.color} shadow-lg group-hover:shadow-green-500/30 group-hover:scale-110 transition-all overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                            <span className="text-5xl font-black text-white relative z-10">{card.letter}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <h4 className="font-black text-2xl text-gray-900 mb-2 uppercase tracking-tight">{card.title}</h4>
                            <p className="text-gray-700 font-semibold mb-3 leading-snug">{card.shortDesc}</p>
                            <p className="text-gray-600 leading-relaxed text-sm">{card.fullDesc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Alert Box */}
                <div className="relative overflow-hidden rounded-2xl mt-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-10" />
                  <div className="relative p-6 backdrop-blur-sm bg-white/50 border-2 border-amber-300/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Shield className="w-8 h-8 text-amber-600 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">⚠️ Additional Warning Signs</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            "Sore that doesn't heal in 3 weeks",
                            "New mole appearing suddenly",
                            "Any spot that itches or burns",
                            "Spots growing quickly or changing"
                          ].map((warning, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Section */}
            {step.layout === 'tips' && step.items && (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-3 mb-8">
                  <h3 className="text-3xl font-black text-gray-900">Make It a Habit</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">Transform skin checking into a routine part of your health care</p>
                </div>
                
                <div className="space-y-6">
                  {step.items.map((item: any, i: number) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-102">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-all`} />
                      <div className="relative p-8 backdrop-blur-sm bg-white/50 border-2 border-white/40 hover:border-green-300/50 transition-all">
                        <div className="flex items-start gap-6">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg group-hover:shadow-green-500/30 group-hover:scale-110 transition-all flex-shrink-0`}>
                            <item.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h4>
                            <p className="text-gray-700 text-base leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Success State */}
                <div className="text-center pt-8 pb-4">
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-30 animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                        <CheckCircle2 className="w-14 h-14 text-white animate-bounce" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">You Did It!</h3>
                  <p className="text-gray-600 text-lg mb-4">You now have the knowledge to perform complete self-skin checks</p>
                  <div className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full inline-block shadow-lg shadow-green-500/40">
                    <p className="text-white font-bold">✓ Check your skin once a month!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium Footer */}
          <div className="px-8 py-6 bg-gradient-to-r from-white/80 to-white/50 backdrop-blur-xl border-t border-green-200/20 flex justify-between items-center gap-4">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                currentStep === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            <button
              onClick={next}
              className="group flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/40"
            >
              {isLast ? 'Complete Guide' : 'Continue'}
              {!isLast && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
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
        .glass-effect {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
}
