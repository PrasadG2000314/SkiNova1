"use client";

import React, { useState } from "react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hover area on the very left edge */}
      <div
        className="fixed top-0 left-0 h-screen w-2 z-40"
        onMouseEnter={() => setIsOpen(true)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64
          bg-white/20 backdrop-blur-md shadow-md
        `}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-6 font-extrabold text-2xl border-b border-white/40 text-black">
          Skin Nova
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-4">
            <li>
              <a
                href="/psoriasis"
                className="block py-2 px-3 rounded font-semibold text-purple-600 hover:text-purple-100 hover:bg-purple-500/40"
              >
                Psoriasis
              </a>
            </li>
            <li>
              <a
                href="/tinea"
                className="block py-2 px-3 rounded font-semibold text-yellow-600 hover:text-yellow-100 hover:bg-yellow-500/40"
              >
                Tinea
              </a>
            </li>
            <li>
              <a
                href="/leprosy"
                className="block py-2 px-3 rounded font-semibold text-red-600 hover:text-red-100 hover:bg-red-500/40"
              >
                Leprosy
              </a>
            </li>
            <li>
              <a
                href="/melanoma"
                className="block py-2 px-3 rounded font-semibold text-red-600 hover:text-red-100 hover:bg-red-500/40"
              >
                Melanoma
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
