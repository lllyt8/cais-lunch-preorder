'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from 'react'

const promoSlides = [
  {
    id: 1,
    title: 'Weekly Special',
    subtitle: 'Sun Bento Box',
    description: 'Fresh & healthy lunch for your kids',
    bgColor: 'bg-orange-500',
    emoji: '🍱',
  },
  {
    id: 2,
    title: 'Holiday Greetings',
    subtitle: 'Season of Joy',
    description: 'Special holiday menu coming soon!',
    bgColor: 'bg-emerald-500',
    emoji: '🎄',
  },
  {
    id: 3,
    title: 'Order Reminder',
    subtitle: 'Cutoff: Thursday 5PM',
    description: "Don&apos;t forget to order for next week",
    bgColor: 'bg-violet-500',
    emoji: '⏰',
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
              <Card className={`relative overflow-hidden ${slide.bgColor} border-0 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]`}>
                <div className="p-5 min-h-[120px] flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
                      {slide.title}
                    </p>
                    <h3 className="text-white text-xl font-bold">
                      {slide.subtitle}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {slide.description}
                    </p>
                  </div>
                  <span className="text-5xl opacity-80">{slide.emoji}</span>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white/5" />
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
