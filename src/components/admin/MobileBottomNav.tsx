'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ShoppingCart, Users, MoreHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DesktopSidebar } from './DesktopSidebar'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: '概览' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: '菜单' },
  { href: '/admin/orders', icon: ShoppingCart, label: '订单' },
  { href: '/admin/users', icon: Users, label: '用户' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] h-full transition-colors
                  ${isActive ? 'text-orange-500' : 'text-gray-600'}
                `}
              >
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* More Menu Button */}
          <button 
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center min-w-[60px] h-full text-gray-600"
          >
            <MoreHorizontal className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">更多</span>
          </button>
        </div>
      </nav>

      {/* More Menu Drawer */}
      {isMoreOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMoreOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50">
            <DesktopSidebar className="flex flex-col w-64 bg-gray-900 text-white min-h-screen" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white z-10"
              onClick={() => setIsMoreOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
    </>
  )
}
