'use client'

import { useCart } from '@/hooks/use-cart'
import { useChildren } from '@/hooks/use-children'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, Calendar, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/stripe'
import { calculatePriceBreakdown } from '@/lib/pricing'
import { format, parseISO, startOfWeek, addDays } from 'date-fns'
import { useState, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

const WEEKDAY_LABELS: Record<string, string> = {
  'Mon': 'Mon',
  'Tue': 'Tue',
  'Wed': 'Wed',
  'Thu': 'Thu',
  'Fri': 'Fri',
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
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
    }
    return `${weekdayMap[dayOfWeek] || dayOfWeek} (${shortDate})`
  } catch {
    return dateStr
  }
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalItemCount, clearAllCarts, clearExpiredItems } = useCart()
  const { data: children, isLoading: childrenLoading } = useChildren()
  const router = useRouter()
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set())
  const hasInitialized = useRef(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    isExpired: boolean
  }

  const weekGroups = useMemo(() => {
    const groups: WeekGroup[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
    const weekEnd = addDays(weekStart, 4) // Friday (Mon + 4 days)
    const weekKey = format(weekStart, 'yyyy-MM-dd')
    const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd')}`
    
    const itemTotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    
    // Find or create week group
    let weekGroup = groups.find(w => w.weekKey === weekKey)
    if (!weekGroup) {
      // Check if week is expired (end date has passed)
      const isExpired = weekEnd < today

      weekGroup = {
        weekKey,
        weekLabel,
        startDate: weekStart,
        endDate: weekEnd,
        children: [],
        total: 0,
        isExpired
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

  // Check if there are any expired weeks
  const hasExpiredItems = useMemo(() => {
    return weekGroups.some(week => week.isExpired)
  }, [weekGroups])

  // Auto-expand first week on initial load
  useEffect(() => {
    if (!hasInitialized.current && weekGroups.length > 0) {
      setExpandedWeeks(new Set([weekGroups[0].weekKey]))
      hasInitialized.current = true
    }
  }, [weekGroups])
  
  // 计算小计
  const subtotal = useMemo(() => {
    return Object.values(items).flat().reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    )
  }, [items])

  // 计算税费明细
  const priceBreakdown = useMemo(() => {
    return calculatePriceBreakdown(subtotal, {
      salesTaxRate: 0.08625, // 8.625% 旧金山销售税
      serviceFeeRate: 0.00,
      stripeFeeRate: 0.029,
      stripeFeeFixed: 0.30,
      includeFeesInPrice: false, // 不转嫁Stripe费用
    })
  }, [subtotal])

  // 总价 = 小计 + 税费
  const totalAmount = priceBreakdown.total
  
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

  // Handle clearing expired items
  const handleClearExpired = () => {
    const clearedKeys = clearExpiredItems()
    if (clearedKeys.length > 0) {
      toast.success(`Removed ${clearedKeys.length} expired order(s) from your cart`)
    }
  }

  // 处理订单提交
  const handleCheckout = async () => {
    // Check for expired items before checkout
    if (hasExpiredItems) {
      toast.error('Your cart contains expired orders. Please remove them before checkout.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 准备订单数据（用于Stripe metadata，不创建数据库记录）
      const ordersData = []
      
      for (const [key, cartItems] of Object.entries(items)) {
        if (cartItems.length === 0) continue
        
        // 解析 key: ${childId}-${date}
        const lastHyphenIndex = key.lastIndexOf('-')
        const possibleDateStart = key.length - 10
        
        let childId: string
        let dateStr: string
        
        if (key[possibleDateStart - 1] === '-' && key.substring(possibleDateStart).match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = key.substring(possibleDateStart)
          childId = key.substring(0, possibleDateStart - 1)
        } else {
          childId = key.substring(0, lastHyphenIndex)
          dateStr = key.substring(lastHyphenIndex + 1)
        }
        
        const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
        
        // 计算含税总价
        const orderBreakdown = calculatePriceBreakdown(itemsSubtotal, {
          salesTaxRate: 0.08625, // 旧金山税率
          serviceFeeRate: 0.00,
          stripeFeeRate: 0.029,
          stripeFeeFixed: 0.30,
          includeFeesInPrice: false,
        })
        
        // 只保存必要的数据，减少metadata大小
        ordersData.push({
          childId,
          date: dateStr,
          items: cartItems.map(item => ({
            menu_item_id: item.menu_item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            portion: item.portion_type || 'Full Order'
          })),
          total: orderBreakdown.total
        })
      }
      
      // 直接创建 Stripe Checkout Session（不创建订单）
      const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ordersData, // 传递订单数据用于metadata
          successUrl: `${window.location.origin}/dashboard/orders?payment_success=true`,
          cancelUrl: `${window.location.origin}/dashboard/cart`,
        })
      })
      
      const checkoutData = await checkoutResponse.json()
      
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Failed to create checkout session')
      }
      
      // 关闭对话框
      setShowCheckoutDialog(false)
      
      // 跳转到 Stripe Checkout
      // 注意：不在这里清空购物车，等支付成功后再清空
      if (checkoutData.url) {
        // 显示跳转提示
        toast.success('Redirecting to secure payment...', { duration: 2000 })
        // 使用 replace 而不是 href，避免在浏览器历史中添加记录
        window.location.replace(checkoutData.url)
      }
      
    } catch (error: unknown) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit order')
      setIsSubmitting(false)
    }
    // 注意：跳转时不要设置 setIsSubmitting(false)，保持loading状态直到页面跳转
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
          onClick={() => router.push('/dashboard/order')}
          className="text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 text-sm">{totalItemCount} items</p>
        </div>
      </div>

      {/* Expired Items Warning Banner */}
      {hasExpiredItems && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Expired Items Detected</h3>
              <p className="text-red-700 text-sm mb-3">
                Your cart contains orders for dates that have already passed.
                Please remove them before checkout.
              </p>
              <Button
                onClick={handleClearExpired}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Remove Expired Items
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items Grouped by Week -> Child -> Date */}
      <div className="space-y-4">
        {weekGroups.map((week) => (
          <Card key={week.weekKey} className={`border-gray-200 shadow-sm ${week.isExpired ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            {/* Week Header */}
            <button
              onClick={() => toggleWeek(week.weekKey)}
              className={`w-full p-4 flex items-center justify-between transition-colors ${
                week.isExpired ? 'hover:bg-red-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {week.isExpired ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <Calendar className="h-5 w-5 text-orange-500" />
                )}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${week.isExpired ? 'text-red-900' : 'text-gray-900'}`}>
                      {week.weekLabel}
                    </p>
                    {week.isExpired && (
                      <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                        EXPIRED
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${week.isExpired ? 'text-red-700' : 'text-gray-600'}`}>
                    {week.children.length} {week.children.length === 1 ? 'child' : 'children'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-bold text-lg ${week.isExpired ? 'text-red-600' : 'text-orange-500'}`}>
                  {formatCurrency(week.total)}
                </p>
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
        {/* Price Breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-300 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(priceBreakdown.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-300 text-sm">
            <span>Sales Tax (8.625%)</span>
            <span>{formatCurrency(priceBreakdown.salesTax)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-300 font-medium">Total</span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
        <Button
          onClick={() => setShowCheckoutDialog(true)}
          disabled={hasExpiredItems}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {hasExpiredItems ? 'Remove Expired Items First' : 'Checkout'}
        </Button>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Confirm Your Order</DialogTitle>
            <DialogDescription className="text-gray-600">
              Review your order details before submitting. You have {totalItemCount} items for {formatCurrency(totalAmount)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                {weekGroups.map((week) => (
                  <div key={week.weekKey} className="flex justify-between">
                    <span className="text-gray-700">{week.weekLabel}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(week.total)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(priceBreakdown.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sales Tax (8.625%)</span>
                    <span>{formatCurrency(priceBreakdown.salesTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-orange-500">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
