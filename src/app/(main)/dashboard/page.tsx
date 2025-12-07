'use client'

import { HomeCarousel } from '@/components/dashboard/HomeCarousel'

export default function DashboardPage() {
  return (
    <div className="h-[calc(100vh-160px)] overflow-hidden flex flex-col">
      {/* Hero Section - Empty placeholder for future content */}
      <div className="flex-1" />

      {/* Bottom Carousel - 1/3 height */}
      <div className="h-1/3 flex items-center">
        <HomeCarousel />
      </div>
    </div>
  )
}
