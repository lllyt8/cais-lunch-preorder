'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from 'react'
import { UtensilsCrossed, Sparkles, Clock } from 'lucide-react'
import Image from 'next/image'

const promoSlides = [
  {
    id: 1,
    title: 'Weekly Special',
    subtitle: 'Sun Bento Box',
    description: 'Fresh & healthy lunch for your kids',
    gradient: 'from-orange-500/95 via-orange-600/90 to-orange-700/95',
    icon: UtensilsCrossed,
    bgImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
  },
  {
    id: 2,
    title: 'Holiday Greetings',
    subtitle: 'Season of Joy',
    description: 'Special holiday menu coming soon!',
    gradient: 'from-emerald-500/95 via-emerald-600/90 to-teal-700/95',
    icon: Sparkles,
    bgImage: 'https://images.unsplash.com/photo-1482275548304-a58859dc31b7?w=800&q=80',
  },
  {
    id: 3,
    title: 'Order Reminder',
    subtitle: 'Cutoff: Thursday 5PM',
    description: "Don't forget to order for next week",
    gradient: 'from-violet-500/95 via-purple-600/90 to-indigo-700/95',
    icon: Clock,
    bgImage: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80',
  },
]

export function PromoCarousel() {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Promotions</h2>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: 'center',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2">
          {promoSlides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-2 basis-[85%] md:basis-1/2">
              <Card className="relative overflow-hidden border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image 
                    src={slide.bgImage}
                    alt={slide.subtitle}
                    fill
                    className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 85vw, 50vw"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
                
                {/* Content */}
                <div className="relative p-5 min-h-[140px] flex items-center justify-between">
                  <div className="space-y-1.5 flex-1">
                    <p className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                      {slide.title}
                    </p>
                    <h3 className="text-white text-xl font-bold leading-tight">
                      {slide.subtitle}
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                  
                  {/* Icon in glass container */}
                  <div className="ml-4 w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <slide.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-3">
        {promoSlides.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </div>
  )
}
