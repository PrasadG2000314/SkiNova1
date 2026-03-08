"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

interface Prediction {
  className: string;
  probability: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface SkinCancerChatbotProps {
  predictions?: Prediction[] | null;
}

export default function SkinCancerChatbot({ predictions }: SkinCancerChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true); // Always open initially or set to false to start minimized
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Analyze predictions if available
  const topPrediction = predictions && predictions.length > 0 
    ? [...predictions].sort((a, b) => b.probability - a.probability)[0] 
    : null;
    
  // Fix logic: "Not Melanoma" contains "melanoma", so we strongly check for "Not"
  const isNotMelanoma = topPrediction?.className.toLowerCase().includes("not melanoma") || topPrediction?.className.toLowerCase().includes("normal");
  const isMelanoma = topPrediction?.className.toLowerCase().includes("melanoma") && !isNotMelanoma;
  
  const confidence = topPrediction ? topPrediction.probability * 100 : 0;
  
  // Define thresholds
  const isUnsure = confidence < 75;

  // Effect to handle initial greeting or analysis result
  useEffect(() => {
    let initialMessage = "";
    
    if (!predictions) {
      // Default welcome message when no scan has been done yet
      initialMessage = "Hi! 👋 I'm SkinGuard AI, your skin health assistant. I can help answer questions about skin cancer, prevention, and the ABCDE rule while you get ready to scan. How can I help today?";
    } else if (topPrediction) {
      // Result-based messages
      if (isUnsure) {
        initialMessage = "Don't panic — many spots are harmless. However, since the result is uncertain (medium confidence) and I'm not a doctor, it's strictly best to visit a dermatologist to be safe. Better safe than sorry!";
      } else if (isMelanoma) {
        initialMessage = "⚠️ Analysis Result: High Risk / Melanoma detected. \n\nThis looks concerning and may indicate melanoma. Please visit a doctor or dermatologist right away for a professional check. Early detection is key! Don't delay — book an appointment today.";
      } else {
        // isNotMelanoma / Normal
        initialMessage = "✅ Analysis Result: Low Risk / Not Melanoma. \n\nGood news! This appears to be low risk based on the analysis. However, skin changes can be tricky. If you notice any changes in size, shape, or color later, please visit a doctor to confirm everything is okay.";
      }
    }

    if (initialMessage) {
        setMessages([
        {
            id: "welcome",
            text: initialMessage,
            sender: "bot",
            timestamp: new Date(),
        },
        ]);
    }
  }, [predictions, isUnsure, isMelanoma, isNotMelanoma]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = input.toLowerCase();

      // 1. Basic Greeting & farewell
      if (['hi', 'hello', 'hey'].some(greeting => lowerInput.split(' ').includes(greeting) || lowerInput.startsWith(greeting))) {
        botResponse = "Hi! 👋 How can I help you with skin health info today?";
      } else if (['bye', 'goodbye', 'thanks', 'thank'].some(w => lowerInput.includes(w))) {
        botResponse = "Take care! Stay sun-safe ☀️ Come back anytime."; 
      }
      // 2. Unrelated topics (simple check)
      else if (['weather', 'joke', 'football', 'politics'].some(topic => lowerInput.includes(topic))) {
        botResponse = "Haha, nice one! 😊 But I'm specialized in skin cancer info. Want to talk about moles, symptoms, or prevention tips?";
      }

      // 3. Core Skin Cancer / Melanoma Information & Flows
      // Flow 1: Suspicious mole description OR "ABCDE" inquiry
      else if (
        lowerInput.includes("changing") || 
        lowerInput.includes("growing") || 
        lowerInput.includes("uneven") || 
        lowerInput.includes("bleeding") ||
        lowerInput.includes("itch") ||
        lowerInput.includes("color") ||
        lowerInput.includes("abcde")
      ) {
        botResponse = `Thanks for sharing that — I'm glad you're paying attention to your skin! 😊

Changes like uneven shape (asymmetry), varying colors, or size are part of the ABCDE warning signs for melanoma:
• A = Asymmetry: One half doesn't match the other.
• B = Border: Edges are irregular, ragged, notched, or blurred.
• C = Color: Varied shades (brown, black, tan, red, etc.).
• D = Diameter: Larger than 6mm (pencil eraser).
• E = Evolving: Any change in size, shape, color, or symptoms.

Remember, I'm not a doctor. This is general information only. Any changing or suspicious spot should be checked by a dermatologist ASAP.`;
      }
       // Flow 2: "Is this melanoma?" / "Is this cancer?"
      else if (
        lowerInput.includes("is this cancer") || 
        lowerInput.includes("is this melanoma") || 
        lowerInput.includes("check my mole") ||
        lowerInput.includes("diagnose")
      ) {
        botResponse = `I cannot interpret images or give a diagnosis — I am not a doctor.
However, you can check your spot against the ABCDE rule:
• Asymmetry: Is it uneven?
• Border: Is it irregular?
• Color: Is it multi-colored?
• Diameter: Is it >6mm?
• Evolving: Is it changing?

If you answered yes to any, please see a dermatologist. Early detection saves lives!`;
      }
      // Flow 3: General Question about signs
      else if (
          lowerInput.includes("sign") || 
          lowerInput.includes("symptom") || 
          lowerInput.includes("what to look for")
      ) {
         botResponse = `Great question! The most serious type is melanoma. Watch for the ABCDE signs (Asymmetry, Border, Color, Diameter, Evolving).
Other warning signs include:
• A new spot or "Ugly Duckling" that looks different
• A sore that doesn't heal
• A dark streak under a nail
• A spot that bleeds, oozes, or hurts

I am not a doctor. If you spot anything new or changing, please see a healthcare professional.`;
      }
      // Flow 4: High risk / Prevention
      else if (
          lowerInput.includes("fair skin") || 
          lowerInput.includes("family history") || 
          lowerInput.includes("sunburn") ||
          lowerInput.includes("prevent") ||
          lowerInput.includes("protect")
      ) {
        botResponse = `You're smart to be aware! Factors like fair skin, many moles, or family history put you at higher risk.
Top prevention tips:
• Use broad-spectrum sunscreen (SPF 30+) daily.
• Wear protective clothing & hats.
• Avoid tanning beds completely.
• Do monthly self-exams.
• Consider an annual check with a dermatologist.

Staying safe in the sun is the best prevention! ☀️`;
      }
      // Treatment
      else if (lowerInput.includes("treatment") || lowerInput.includes("cure")) {
        botResponse = "Treatment depends on the type and stage. It often involves surgical removal. In advanced cases, immunotherapy or targeted therapy might be used. But remember: Melanoma is highly treatable if caught early! Only a doctor can determine the right plan.";
      }
      // Fallback
      else {
        botResponse = "I'm here to help with general skin health info. I can explain the ABCDE rule for melanoma or share prevention tips, but I cannot diagnose. Always consult a dermatologist for medical advice.";
      }

      // Append closing question if not ending convo
      if (!['bye', 'goodbye', 'thanks', 'thank'].some(w => lowerInput.includes(w))) {
          botResponse += " Would you like more info on self-exams, prevention, or the ABCDE rule?";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-80 sm:w-96' : 'w-auto'}`}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
        >
          <Bot size={24} />
          <span className="font-bold hidden sm:inline">Skin Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-t-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col w-full h-[500px] sm:h-[600px] transition-all animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-400/30">
                <Sparkles size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">SkinGuard AI</h3>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Educational Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm mr-2 flex-shrink-0 self-end mb-1">
                    <Bot size={16} />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-white rounded-br-none"
                      : "bg-white border border-gray-100 text-slate-700 rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-medium">
                    {msg.text}
                  </div>
                  <div className={`text-[10px] mt-1.5 ${msg.sender === "user" ? "text-slate-400" : "text-slate-400"} text-right`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2.5 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-slate-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-slate-400">
                 ⚠️ For informational purposes only. Not a medical diagnosis.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
