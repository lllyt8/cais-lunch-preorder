'use client'

import { HomeCarousel } from '@/components/dashboard/HomeCarousel'

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col p-4 pb-24">
      {/* Spacer to push content towards the bottom while keeping full height */}
      <div className="flex-1" />

      <HomeCarousel />
    </div>
  )
}
