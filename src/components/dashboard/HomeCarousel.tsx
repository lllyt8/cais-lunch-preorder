'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { UtensilsCrossed, RefreshCw, Gift, Bell, Sparkles } from 'lucide-react'
import Link from 'next/link'

const carouselItems = [
  {
    id: 'order-now',
    title: 'Order Now',
    icon: UtensilsCrossed,
    bgColor: 'bg-orange-500',
    href: '/dashboard/order',
  },
  {
    id: 'order-again',
    title: 'Order Again',
    icon: RefreshCw,
    bgColor: 'bg-emerald-500',
    href: '/dashboard/orders',
  },
  {
    id: 'promo-holiday',
    title: 'Holiday Special',
    icon: Gift,
    bgColor: 'bg-rose-500',
    href: '#',
  },
  {
    id: 'promo-reminder',
    title: 'Reminders',
    icon: Bell,
    bgColor: 'bg-violet-500',
    href: '#',
  },
  {
    id: 'promo-new',
    title: 'New Items',
    icon: Sparkles,
    bgColor: 'bg-amber-500',
    href: '#',
  },
]

export function HomeCarousel() {
  return (
    <div className="w-full px-4">
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: false,
        }}
      >
        <CarouselContent className="-ml-3">
          {carouselItems.map((item) => (
            <CarouselItem key={item.id} className="pl-3 basis-auto">
              <Link href={item.href}>
                <Card className={`${item.bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer aspect-square w-28 h-28 flex items-center justify-center rounded-2xl`}>
                  <div className="flex flex-col items-center gap-2 text-white">
                    <item.icon className="h-8 w-8" />
                    <span className="text-xs font-medium text-center px-1">{item.title}</span>
                  </div>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
