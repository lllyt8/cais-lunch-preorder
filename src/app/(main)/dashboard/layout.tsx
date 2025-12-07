'use client'

import { Header } from '@/components/dashboard/Header'
import { BottomNav } from '@/components/dashboard/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      {/* Consumer-Grade Header with Week Selector */}
      <Header />

      {/* Main Content - with bottom padding for nav */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Mobile First */}
      <BottomNav />
    </div>
  )
}
