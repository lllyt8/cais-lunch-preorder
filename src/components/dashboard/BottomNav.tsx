'use client'

import { Home, UtensilsCrossed, ClipboardList, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/order', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/dashboard/orders', icon: ClipboardList, label: 'Orders' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-4 py-2"
            >
              <div className="relative">
                <item.icon 
                  className={`h-6 w-6 transition-colors ${
                    isActive ? 'text-orange-500' : 'text-gray-400'
                  }`} 
                />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span 
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
