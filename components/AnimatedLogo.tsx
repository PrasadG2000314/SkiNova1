"use client";

import { useEffect, useState } from "react";

export default function AnimatedLogo() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Animation completes after 2.5 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes logoFloat {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(100px);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes logoShrinkToNav {
          0% {
            width: 200px;
            height: 200px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            width: 56px;
            height: 56px;
            top: 12px;
            left: 24px;
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes rotateLogo {
          0% {
            transform: rotate(0deg) scale(0.5);
          }
          50% {
            transform: rotate(360deg) scale(1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .animated-logo {
          animation: logoFloat 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .logo-glow {
          animation: rotateLogo 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .shrink-to-nav {
          animation: logoShrinkToNav 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          position: fixed;
          z-index: 40;
        }
      `}</style>

      {!animationComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 pointer-events-none">
          <div className="relative w-56 h-56">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 opacity-20 blur-3xl logo-glow animate-pulse"></div>
            
            {/* Main logo */}
            <div className="animated-logo relative flex items-center justify-center w-full h-full">
              <img
                src="/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png"
                alt="SkinNova Logo"
                className="w-48 h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {animationComplete && (
        <div className="fixed top-2 left-6 z-40 md:hidden">
          <img
            src="/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png"
            alt="SkinNova Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      )}
    </>
  );
}
