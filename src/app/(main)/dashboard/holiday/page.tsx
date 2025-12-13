
'use client'

import { Gift, Sparkles } from 'lucide-react'

export default function HolidayPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-stretch p-4 pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-amber-400 text-white shadow-xl p-5 mb-4">
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_top,_#fff_0,_transparent_55%)]" />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Holiday Specials</h1>
            <p className="text-xs text-red-50/90">Seasonal treats and special menus, coming soon.</p>
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-2 text-xs text-red-50/90">
          <Sparkles className="w-4 h-4" />
          <p>Check back here for limited-time holiday menus and promotions.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-3 text-xs text-rose-900 shadow-sm flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-semibold text-white">
          NEW
        </span>
        <div>
          <p className="font-medium">Coming soon</p>
          <p className="text-[11px] text-rose-800/80">
            We are preparing a cozy holiday experience for your family lunches. This page will show featured dishes,
            special menus, and promotion details when available.
          </p>
        </div>
      </div>
    </div>
  )
}
