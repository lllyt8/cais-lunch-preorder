
'use client'

import { CalendarDays } from 'lucide-react'

const mockReminders = [
  {
    id: 'winter-break',
    dateRange: 'Dec 23 - Jan 5',
    title: 'Winter Break – No School Lunch Service',
    description: 'School is closed for winter holidays. Lunch service will resume on Jan 6.',
    emphasis: true,
  },
  {
    id: 'staff-day',
    dateRange: 'Jan 17',
    title: 'Staff Development Day – No Lunch Service',
    description: 'Please pack a home lunch. There will be no delivery on this day.',
  },
  {
    id: 'holiday',
    dateRange: 'Feb 17',
    title: 'Presidents’ Day – No School',
    description: 'School is closed in observance of Presidents’ Day.',
  },
]

export default function RemindersPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col p-4 pb-24 gap-4">
      <header className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">School Calendar Reminders</h1>
          <p className="text-xs text-gray-500">No-lunch days and important schedule changes</p>
        </div>
      </header>

      <div className="space-y-3">
        {mockReminders.map((item) => (
          <section
            key={item.id}
            className={`rounded-xl border px-3.5 py-3 shadow-sm bg-white flex gap-3 ${
              item.emphasis ? 'border-amber-400 bg-amber-50/60' : 'border-gray-200'
            }`}
          >
            <div className="mt-0.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
              {item.dateRange}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h2>
              <p className="mt-1 text-xs text-gray-600 leading-snug">{item.description}</p>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-gray-500">
        Final schedule may vary by school. Please check your school calendar for the most up-to-date information.
      </p>
    </div>
  )
}
