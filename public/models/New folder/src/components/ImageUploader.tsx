'use client'

import React, { useRef } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  preview: string | null
}

export default function ImageUploader({ onImageSelect, preview }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          preview
            ? 'border-green-400 bg-green-50'
            : 'border-medical-500 bg-medical-50 hover:border-medical-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          title="Upload medical image"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-white shadow-md">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600">
              Click to change image or drag and drop
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-medical-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Upload Medical Image
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Drag and drop your image or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, or GIF up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
