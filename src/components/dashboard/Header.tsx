'use client'

import { useState, useEffect } from 'react'
import { User, ShoppingBag, ChevronDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWeekSelector } from '@/hooks/use-week-selector'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { currentWeekIndex, setCurrentWeekIndex, getWeekOptions, getCurrentWeek } = useWeekSelector()
  const { getTotalItemCount } = useCart()
  const [mounted, setMounted] = useState(false)
  
  const weekOptions = getWeekOptions()
  const currentWeek = getCurrentWeek()
  const itemCount = getTotalItemCount()

  useEffect(() => {
    // Prevent hydration mismatch by only rendering cart badge on client
    // eslint-disable-next-line
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-[#ececec]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Profile */}
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="rounded-full bg-[#ececec] hover:bg-gray-200">
            <User className="h-5 w-5 text-gray-600" />
          </Button>
        </Link>

        {/* Center: Week Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-full"
            >
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="font-medium">
                {mounted ? currentWeek.label : 'Loading...'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="center" 
            className="w-56 bg-white border-gray-200 shadow-lg"
          >
            {weekOptions.map((week, index) => (
              <DropdownMenuItem
                key={week.id}
                onSelect={() => setCurrentWeekIndex(index)}
                className={`cursor-pointer ${
                  index === currentWeekIndex 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {week.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Cart */}
        <Link href="/dashboard/cart">
          <Button variant="ghost" size="icon" className="relative rounded-full bg-[#ececec] hover:bg-gray-200">
            <ShoppingBag className="h-5 w-5 text-gray-600" />
            {mounted && (
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-xs font-bold text-white flex items-center justify-center border-2 border-white"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            )}
          </Button>
        </Link>
      </div>
    </header>
  )
}
