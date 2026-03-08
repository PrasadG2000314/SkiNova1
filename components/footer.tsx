"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 text-white px-6 sm:px-8 py-6 sm:py-7 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Left block */}
            <div className="flex items-center gap-4">
              
              <div>
               <img 
                src="/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png" 
                alt="skinova Logo"
                className="h-12 w-auto object-contain"
              />
                <p className="mt-1 text-xs sm:text-sm text-gray-200 max-w-md">
                  AI‑assisted guidance for understanding your skin. Always double‑check important decisions with a qualified healthcare professional.
                </p>
              </div>
            </div>

            {/* Center links */}
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-medium text-gray-100">
              <Link href="/aboutus" className="hover:text-emerald-300 transition-colors">
                About
              </Link>
              <Link href="/contactus" className="hover:text-emerald-300 transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-emerald-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-emerald-300 transition-colors">
                Terms
              </Link>
            </div>

            {/* Right small status */}
            <div className="flex flex-col items-start sm:items-end gap-2 text-[11px] text-gray-200">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>System status: Online</span>
              </span>
              <span className="text-[10px] text-gray-300">
                © {new Date().getFullYear()} skinova. For educational use only.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
