'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DesktopSidebar } from './DesktopSidebar'
import { useAuth } from '@/hooks/use-auth'

export function MobileHeader() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div>
              <h1 className="text-lg font-bold text-orange-500">CAIS Admin</h1>
            </div>
          </div>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 transform transition-transform">
            <DesktopSidebar className="flex flex-col w-64 bg-gray-900 text-white min-h-screen" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
    </>
  )
}
