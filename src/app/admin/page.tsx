'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()

  // Mock stats data - will be replaced with real data later
  const stats = [
    { 
      label: '今日订单', 
      value: '23', 
      change: '+12%',
      changeType: 'positive' as const,
      icon: ShoppingCart, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      label: '菜品总数', 
      value: '45', 
      change: '+3 本周',
      changeType: 'neutral' as const,
      icon: UtensilsCrossed, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    { 
      label: '注册用户', 
      value: '128', 
      change: '+5 本周',
      changeType: 'positive' as const,
      icon: Users, 
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      label: '本月收入', 
      value: '$2.4K', 
      change: '+18%',
      changeType: 'positive' as const,
      icon: TrendingUp, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
  ]

  const recentOrders = [
    { id: 1, customer: 'John Doe', items: 3, status: 'pending', time: '5分钟前' },
    { id: 2, customer: 'Jane Smith', items: 2, status: 'paid', time: '15分钟前' },
    { id: 3, customer: 'Bob Johnson', items: 4, status: 'paid', time: '32分钟前' },
  ]

  const topItems = [
    { name: '鸡肉便当', orders: 15, revenue: '$180' },
    { name: '素饺子', orders: 12, revenue: '$132' },
    { name: '牛肉炒面', orders: 10, revenue: '$120' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-600 mt-1">欢迎回来，{user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-2 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.items} 个菜品 · {order.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'paid' ? (
                      <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        已支付
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        <AlertCircle className="h-4 w-4" />
                        待支付
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">热门菜品</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.orders} 单</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">快速开始</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/menu"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-gray-900">管理菜单</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900">查看订单</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <Users className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-900">用户管理</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
