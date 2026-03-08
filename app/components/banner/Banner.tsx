'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BannerPost {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  textStyle?: 'normal' | 'italic' | 'bold';
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  createdAt: string;
}

export default function Banner() {
  const [banners, setBanners] = useState<BannerPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/banners/all`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setBanners(data.data);
        } else {
          // Set default banner if no banners exist
          setBanners([
            {
              _id: 'default-1',
              title: 'Welcome to skinova',
              description: 'Your comprehensive skin health companion',
              imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop',
              link: '/',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        // Set default banner on error
        setBanners([
          {
            _id: 'default-1',
            title: 'Welcome to SkinNova',
            description: 'Your comprehensive skin health companion',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop',
            link: '/',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, banners.length]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative group w-full">
      {/* Main Carousel Container */}
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner Image */}
        <img
          src={currentBanner.imageUrl.startsWith('http') ? currentBanner.imageUrl : `http://localhost:4000${currentBanner.imageUrl}`}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Banner image failed to load:', currentBanner.imageUrl);
            e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop';
          }}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${currentBanner.overlayOpacity ?? 0.4})`,
          }}
        />

        {/* Content */}
        <div
          className="absolute inset-0 flex flex-col justify-center p-6 md:p-10"
          style={{
            justifyContent: 'center',
            alignItems: currentBanner.alignment === 'center' ? 'center' : currentBanner.alignment === 'right' ? 'flex-end' : 'flex-start',
            textAlign: (currentBanner.alignment as any) || 'left',
          }}
        >
          <h2
            className="font-bold mb-2 md:mb-4"
            style={{
              color: currentBanner.textColor || '#FFFFFF',
              fontSize: currentBanner.fontSize === 'small' ? '1.5rem' : currentBanner.fontSize === 'large' ? '2.5rem' : '2rem',
              fontStyle: currentBanner.textStyle === 'italic' ? 'italic' : 'normal',
              fontWeight: currentBanner.textStyle === 'bold' ? '700' : '600',
            }}
          >
            {currentBanner.title}
          </h2>
          <p
            className="md:mb-6 max-w-xl"
            style={{
              color: currentBanner.textColor || '#FFFFFF',
              fontSize: currentBanner.fontSize === 'small' ? '0.875rem' : currentBanner.fontSize === 'large' ? '1.25rem' : '1rem',
              opacity: 0.9,
            }}
          >
            {currentBanner.description}
          </p>
          {currentBanner.link && (
            <Link href={currentBanner.link}>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </Link>
          )}
        </div>

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
        >
          ❮
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
        >
          ❯
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 right-4 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all duration-300 z-10"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              title={`Go to banner ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-green-500 w-8'
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
