'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: '概览' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: '菜单管理' },
  { href: '/admin/orders', icon: ShoppingCart, label: '订单管理' },
  { href: '/admin/inventory', icon: Package, label: '库存管理' },
  { href: '/admin/users', icon: Users, label: '用户管理' },
  { href: '/admin/analytics', icon: BarChart3, label: '数据分析' },
  { href: '/admin/settings', icon: Settings, label: '系统设置' },
]

interface DesktopSidebarProps {
  className?: string
}

export function DesktopSidebar({ className }: DesktopSidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role } = useAuth()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className={className || "hidden lg:flex lg:flex-col w-64 bg-gray-900 text-white min-h-screen"}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-orange-500">CAIS Admin</h1>
        <p className="text-sm text-gray-400 mt-1">管理后台</p>
      </div>

      {/* User Info Card */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-lg">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon 
                className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} 
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回家长端
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </aside>
  )
}
