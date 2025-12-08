'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Calendar, User, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/stripe'
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import type { Order, Child, OrderDetail, MenuItem } from '@/types/database'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface OrderWithDetails extends Order {
  children: Child
  order_details: Array<OrderDetail & { menu_items: MenuItem }>
}

interface DayOrder {
  order: OrderWithDetails
  items: Array<OrderDetail & { menu_items: MenuItem }>
}

interface ChildGroup {
  childId: string
  childName: string
  days: DayOrder[]
  total: number
}

interface WeekGroup {
  weekKey: string
  weekLabel: string
  startDate: Date
  endDate: Date
  children: ChildGroup[]
  total: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set())
  const searchParams = useSearchParams()
  const supabase = createClient()

  // 从 localStorage 清空购物车
  const clearCart = () => {
    if (typeof window !== 'undefined') {
      const cartKeys = Object.keys(localStorage).filter(key => key.startsWith('cart-'))
      cartKeys.forEach(key => localStorage.removeItem(key))
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          children (*),
          order_details (
            *,
            menu_items (*)
          )
        `)
        .eq('parent_id', user.id)
        .order('order_date', { ascending: false })

      if (!error && data) {
        setOrders(data as OrderWithDetails[])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [supabase])

  // 检测支付成功
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success')
    if (paymentSuccess === 'true') {
      // 清空购物车
      clearCart()
      // 显示成功提示
      toast.success('Payment successful! Your orders have been confirmed.')
      // 清理URL参数
      window.history.replaceState({}, '', '/dashboard/orders')
    }
  }, [searchParams])

  // Group orders by week -> child -> date
  const weekGroups = useMemo(() => {
    const groups: WeekGroup[] = []
    
    orders.forEach((order) => {
      const orderDate = parseISO(order.order_date)
      const weekStart = startOfWeek(orderDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(orderDate, { weekStartsOn: 1 })
      const weekKey = format(weekStart, 'yyyy-MM-dd')
      const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd')}`
      
      // Find or create week group
      let weekGroup = groups.find(w => w.weekKey === weekKey)
      if (!weekGroup) {
        weekGroup = {
          weekKey,
          weekLabel,
          startDate: weekStart,
          endDate: weekEnd,
          children: [],
          total: 0
        }
        groups.push(weekGroup)
      }
      
      // Find or create child group
      let childGroup = weekGroup.children.find(c => c.childId === order.child_id)
      if (!childGroup) {
        childGroup = {
          childId: order.child_id,
          childName: order.children?.name || 'Unknown',
          days: [],
          total: 0
        }
        weekGroup.children.push(childGroup)
      }
      
      // Add day order
      childGroup.days.push({
        order,
        items: order.order_details || []
      })
      
      childGroup.total += order.total_amount
      weekGroup.total += order.total_amount
    })
    
    // Sort weeks, children, and days
    groups.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    groups.forEach(week => {
      week.children.sort((a, b) => a.childName.localeCompare(b.childName))
      week.children.forEach(child => {
        child.days.sort((a, b) => 
          parseISO(b.order.order_date).getTime() - parseISO(a.order.order_date).getTime()
        )
      })
    })
    
    return groups
  }, [orders])

  const toggleWeek = (weekKey: string) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey)
    } else {
      newExpanded.add(weekKey)
    }
    setExpandedWeeks(newExpanded)
  }
  
  const toggleChild = (weekKey: string, childId: string) => {
    const key = `${weekKey}-${childId}`
    const newExpanded = new Set(expandedChildren)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedChildren(newExpanded)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✓ Paid</span>
      case 'pending_payment':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">⏳ Pending</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">✗ Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-600 text-center mb-6">
          You haven&apos;t placed any orders
        </p>
        <Link href="/dashboard/order">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Browse Menu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">View all your past orders</p>
      </div>

      {/* Orders Grouped by Week -> Child -> Date */}
      <div className="space-y-4">
        {weekGroups.map((week) => (
          <Card key={week.weekKey} className="bg-white border-gray-200 shadow-sm">
            {/* Week Header */}
            <button
              onClick={() => toggleWeek(week.weekKey)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="text-gray-900 font-semibold">{week.weekLabel}</p>
                  <p className="text-gray-600 text-sm">{week.children.length} {week.children.length === 1 ? 'child' : 'children'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-orange-500 font-bold text-lg">{formatCurrency(week.total)}</p>
                {expandedWeeks.has(week.weekKey) ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </div>
            </button>

            {/* Week Content */}
            {expandedWeeks.has(week.weekKey) && (
              <div className="border-t border-gray-200">
                {week.children.map((child) => {
                  const childKey = `${week.weekKey}-${child.childId}`
                  const isChildExpanded = expandedChildren.has(childKey)
                  
                  return (
                    <div key={child.childId} className="border-b border-gray-100 last:border-b-0">
                      {/* Child Header */}
                      <button
                        onClick={() => toggleChild(week.weekKey, child.childId)}
                        className="w-full p-4 pl-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-blue-500" />
                          <div className="text-left">
                            <p className="text-gray-900 font-medium">{child.childName}</p>
                            <p className="text-gray-600 text-xs">{child.days.length} {child.days.length === 1 ? 'order' : 'orders'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-orange-500 font-semibold">{formatCurrency(child.total)}</p>
                          {isChildExpanded ? 
                            <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          }
                        </div>
                      </button>

                      {/* Child Orders by Date */}
                      {isChildExpanded && (
                        <div className="bg-gray-50/50">
                          {child.days.map((day) => (
                            <div key={day.order.id} className="p-4 pl-12 border-t border-gray-100 first:border-t-0">
                              {/* Day Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-gray-700 font-medium">
                                    {format(parseISO(day.order.order_date), 'EEEE, MMM d, yyyy')}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(day.order.status)}
                                  </div>
                                </div>
                                <p className="text-orange-500 font-bold">{formatCurrency(day.order.total_amount)}</p>
                              </div>

                              {/* Order Items */}
                              <div className="space-y-2">
                                {day.items.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 text-sm">
                                    <div className="flex-1">
                                      <p className="text-gray-900 font-medium">{item.menu_items.name}</p>
                                      <p className="text-gray-600 text-xs">
                                        {item.portion_type} × {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-gray-700 font-medium">
                                      {formatCurrency(item.unit_price * item.quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Special Requests */}
                              {day.order.special_requests && (
                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                                  <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> {day.order.special_requests}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
