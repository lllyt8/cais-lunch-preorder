'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { DesktopSidebar } from '@/components/admin/DesktopSidebar'
import { MobileHeader } from '@/components/admin/MobileHeader'
import { MobileBottomNav } from '@/components/admin/MobileBottomNav'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, isAdmin, isStaff } = useAuth()

  useEffect(() => {
    if (!loading) {
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login?redirect=/admin')
      } 
      // Redirect to dashboard if not admin/staff
      else if (!isAdmin && !isStaff) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, isAdmin, isStaff, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Don't render if not authorized
  if (!user || (!isAdmin && !isStaff)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader />
      
      <div className="flex">
        {/* Desktop Sidebar - only visible on desktop */}
        <DesktopSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation - only visible on mobile */}
      <MobileBottomNav />
    </div>
  )
}
