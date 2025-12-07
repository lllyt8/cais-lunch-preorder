'use client'

import { useCart } from '@/hooks/use-cart'
import { useChildren } from '@/hooks/use-children'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/stripe'
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { useState, useEffect, useMemo, useRef } from 'react'

const WEEKDAY_LABELS: Record<string, string> = {
  'Mon': '周一',
  'Tue': '周二',
  'Wed': '周三',
  'Thu': '周四',
  'Fri': '周五',
}

// Helper to format date string for display
const formatDateDisplay = (dateStr: string): string => {
  // Check if it's an old format (Mon/Tue/etc) or new format (YYYY-MM-DD)
  if (WEEKDAY_LABELS[dateStr]) {
    return WEEKDAY_LABELS[dateStr]
  }
  try {
    const date = parseISO(dateStr)
    const dayOfWeek = format(date, 'EEEE')
    const shortDate = format(date, 'M/d')
    const weekdayMap: Record<string, string> = {
      'Monday': '周一',
      'Tuesday': '周二',
      'Wednesday': '周三',
      'Thursday': '周四',
      'Friday': '周五',
    }
    return `${weekdayMap[dayOfWeek] || dayOfWeek} (${shortDate})`
  } catch {
    return dateStr
  }
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalItemCount } = useCart()
  const { data: children, isLoading: childrenLoading } = useChildren()
  const router = useRouter()
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set())
  const hasInitialized = useRef(false)

  const totalItemCount = getTotalItemCount()

  // Parse cart items and group by week -> child -> date
  interface DayOrder {
    date: string
    dateObj: Date
    items: typeof items[string]
    total: number
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

  const weekGroups = useMemo(() => {
    const groups: WeekGroup[] = []
    
    Object.entries(items).forEach(([key, cartItems]) => {
    if (cartItems.length === 0) return
    
    let childId: string
    let dateStr: string
    
    const possibleDateStart = key.length - 10
    if (key[possibleDateStart - 1] === '-' && key.substring(possibleDateStart).match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateStr = key.substring(possibleDateStart)
      childId = key.substring(0, possibleDateStart - 1)
    } else {
      const lastHyphenIndex = key.lastIndexOf('-')
      childId = key.substring(0, lastHyphenIndex)
      dateStr = key.substring(lastHyphenIndex + 1)
    }
    
    const child = children?.find(c => c.id === childId)
    const dateObj = parseISO(dateStr)
    const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(dateObj, { weekStartsOn: 1 })
    const weekKey = format(weekStart, 'yyyy-MM-dd')
    const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd')}`
    
    const itemTotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    
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
    
    // Find or create child group within week
    let childGroup = weekGroup.children.find(c => c.childId === childId)
    if (!childGroup) {
      childGroup = {
        childId,
        childName: child?.name || 'Unknown',
        days: [],
        total: 0
      }
      weekGroup.children.push(childGroup)
    }
    
    // Add day order
    childGroup.days.push({
      date: dateStr,
      dateObj,
      items: cartItems,
      total: itemTotal
    })
    
      childGroup.total += itemTotal
      weekGroup.total += itemTotal
    })
    
    // Sort weeks by start date
    groups.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    
    // Sort children within each week and days within each child
    groups.forEach(week => {
      week.children.sort((a, b) => a.childName.localeCompare(b.childName))
      week.children.forEach(child => {
        child.days.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      })
    })
    
    return groups
  }, [items, children])
  
  // Auto-expand first week on initial load
  useEffect(() => {
    if (!hasInitialized.current && weekGroups.length > 0) {
      setExpandedWeeks(new Set([weekGroups[0].weekKey]))
      hasInitialized.current = true
    }
  }, [weekGroups])
  
  // Calculate grand total
  const grandTotal = useMemo(() => {
    return Object.values(items).reduce((total, cartItems) => {
      return total + cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    }, 0)
  }, [items])
  
  // Show loading state while children data is loading
  if (childrenLoading) {
    return (
      <div className="px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }
  
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

  if (totalItemCount === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 text-center mb-6">
          Add some delicious meals for your children
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
    <div className="px-4 py-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 text-sm">{totalItemCount} items</p>
        </div>
      </div>

      {/* Cart Items Grouped by Week -> Child -> Date */}
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
                            <p className="text-gray-600 text-xs">{child.days.length} {child.days.length === 1 ? 'day' : 'days'}</p>
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

                      {/* Child Days */}
                      {isChildExpanded && (
                        <div className="bg-gray-50/50">
                          {child.days.map((day) => (
                            <div key={day.date} className="p-4 pl-12 border-t border-gray-100 first:border-t-0">
                              {/* Day Header */}
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-700 font-medium text-sm">
                                  {formatDateDisplay(day.date)}
                                </p>
                                <p className="text-gray-600 text-sm">{formatCurrency(day.total)}</p>
                              </div>

                              {/* Day Items */}
                              <div className="space-y-2">
                                {day.items.map((item, index) => (
                                  <div key={`${item.menu_item.id}-${item.portion_type}-${index}`} className="flex items-center gap-2 bg-white rounded-lg p-2">
                                    {/* Item Info */}
                                    <div className="flex-1">
                                      <p className="text-gray-900 text-sm font-medium">
                                        {item.menu_item.name}
                                      </p>
                                      <p className="text-gray-600 text-xs">
                                        {item.portion_type} • {formatCurrency(item.unit_price)}
                                      </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-6 w-6 rounded-full border-gray-300"
                                        onClick={() => {
                                          if (item.quantity > 1) {
                                            updateQuantity(child.childId, day.date, item.menu_item.id, item.quantity - 1, item.portion_type)
                                          } else {
                                            removeItem(child.childId, day.date, item.menu_item.id, item.portion_type)
                                          }
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-gray-900 font-medium min-w-[20px] text-center text-sm">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-6 w-6 rounded-full border-gray-300"
                                        onClick={() => updateQuantity(child.childId, day.date, item.menu_item.id, item.quantity + 1, item.portion_type)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeItem(child.childId, day.date, item.menu_item.id, item.portion_type)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
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

      {/* Checkout Footer */}
      <div className="fixed bottom-16 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300">Total</span>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(grandTotal)}
          </span>
        </div>
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-semibold shadow-md">
          Checkout
        </Button>
      </div>
    </div>
  )
}
