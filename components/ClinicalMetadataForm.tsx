
"use client";

import React, { useState } from "react";

export interface MetadataForm {
  smoke: boolean;
  drink: boolean;
  pesticide: boolean;
  age: number;
  gender: string;
  skinCancerHistory: boolean;
  cancerHistory: boolean;
  region: string;
  diameter1: number;
  diameter2: number;
  itch: boolean;
  grow: boolean;
  hurt: boolean;
  changed: boolean;
  bleed: boolean;
  elevation: boolean;
}

interface Props {
  onSubmit: (data: MetadataForm) => void;
  onSkip: () => void;
}

export default function ClinicalMetadataForm({ onSubmit, onSkip }: Props) {
  const [formData, setFormData] = useState<MetadataForm>({
    smoke: false,
    drink: false, // alcohol
    pesticide: false,
    age: 30,
    gender: "male",
    skinCancerHistory: false,
    cancerHistory: false,
    region: "ARM", // Default from dataset example
    diameter1: 0,
    diameter2: 0,
    itch: false,
    grow: false,
    hurt: false,
    changed: false,
    bleed: false,
    elevation: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-fadeIn">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Clinical Metadata Assessment</h2>
        <p className="text-gray-500 mt-2">
          Provide additional patient details for a comprehensive multimodal risk analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Demographics & Lifestyle */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <span>👤</span> Patient Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleNumberChange}
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 shadow-sm transition-colors py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 shadow-sm transition-colors py-2 px-3"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region (Body Part)</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 shadow-sm transition-colors py-2 px-3"
              >
                <option value="FACE">Face</option>
                <option value="NECK">Neck</option>
                <option value="CHEST">Chest</option>
                <option value="BACK">Back</option>
                <option value="ARM">Arm</option>
                <option value="FOREARM">Forearm</option>
                <option value="HAND">Hand</option>
                <option value="THIGH">Thigh</option>
                <option value="LEG">Leg</option>
                <option value="FOOT">Foot</option>
                <option value="ABDOMEN">Abdomen</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="smoke"
                checked={formData.smoke}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Smoker</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="drink"
                checked={formData.drink}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Alcohol Consumer</span>
            </label>
             <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="pesticide"
                checked={formData.pesticide}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Pesticide Exposure</span>
            </label>
          </div>
        </div>

        {/* Section 2: Medical History */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
           <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <span>🧬</span> Medical History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="skinCancerHistory"
                checked={formData.skinCancerHistory}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">I have had Skin Cancer before</span>
            </label>
             <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="cancerHistory"
                checked={formData.cancerHistory}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Family History of Cancer</span>
            </label>
          </div>
        </div>

        {/* Section 3: Lesion Characteristics */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
           <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <span>🔍</span> Lesion Symptoms
          </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diameter 1 (mm)</label>
              <input
                type="number"
                name="diameter1"
                step="0.1"
                value={formData.diameter1}
                onChange={handleNumberChange}
                className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500 shadow-sm transition-colors py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diameter 2 (mm)</label>
               <input
                type="number"
                name="diameter2"
                step="0.1"
                value={formData.diameter2}
                onChange={handleNumberChange}
                className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500 shadow-sm transition-colors py-2 px-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {/* ABCDE Symptoms */}
             {[
               { name: "itch", label: "Itchy" },
               { name: "grow", label: "Growing" },
               { name: "hurt", label: "Painful" },
               { name: "changed", label: "Changed Appearance" },
               { name: "bleed", label: "Bleeding" },
               { name: "elevation", label: "Elevated" },
             ].map((symptom) => (
                <label key={symptom.name} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-red-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name={symptom.name}
                    checked={(formData as any)[symptom.name]}
                    onChange={handleChange}
                    className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{symptom.label}</span>
                </label>
             ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Analyze Metadata & Calculate Risk
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Skip Metadata (Image Only)
          </button>
        </div>
      </form>
    </div>
  );
}
