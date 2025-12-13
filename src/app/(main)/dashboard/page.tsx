'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { HomeCarousel } from '@/components/dashboard/HomeCarousel'

const heroImages = [
  { 
    src: '/mcot_pic/All_pop_food.jpg', 
    alt: 'Delicious healthy lunch',
    title: 'Fresh & Delicious',
    subtitle: 'Nutritious meals made with love'
  },
  { 
    src: '/mcot_pic/Dumpling.png', 
    alt: 'Fresh dumplings',
    title: 'Handmade Dumplings',
    subtitle: 'A family favorite'
  },
]

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length)

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col p-4 pb-24 gap-6">
      {/* Hero Image Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-56 object-cover"
            />
            {/* Gradient Overlay with Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-xl font-bold drop-shadow-lg">{image.title}</h2>
              <p className="text-sm text-white/90 drop-shadow">{image.subtitle}</p>
            </div>
          </div>
        ))}
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>
        {/* Dots Indicator */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75 w-1.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Info Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Order by Sunday</p>
            <p className="text-sm text-white/80">Get meals for next week!</p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Quick Actions</h3>
        <HomeCarousel />
      </div>
    </div>
  )
}
