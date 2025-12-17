'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import { useWeekSelector } from '@/hooks/use-week-selector'
import type { Child, MenuItem } from '@/types/database'
import { MENU_CATEGORIES } from '@/constants/menu-categories'
import { MenuItemCard } from '@/components/order/MenuItemCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const WEEKDAY_LABELS: Record<string, string> = {
  'Mon': 'Mon',
  'Tue': 'Tue',
  'Wed': 'Wed',
  'Thu': 'Thu',
  'Fri': 'Fri',
}

export default function OrderPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [missingDays, setMissingDays] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['rice', 'noodles', 'dumplings', 'snacks']))

  const router = useRouter()
  const { getCurrentWeek, checkAndResetIfNeeded } = useWeekSelector()
  const currentWeek = getCurrentWeek()

  const {
    selectedChildId,
    selectedDate,
    setSelectedChild,
    setSelectedDate,
    addItem,
    getCartItems,
    getCartTotal,
    updateQuantity,
    removeItem,
  } = useCart()

  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch children
    const { data: childrenData } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true })

    if (childrenData && childrenData.length > 0) {
      setChildren(childrenData)
      if (!selectedChildId) {
        setSelectedChild(childrenData[0].id)
      }
    }

    // Fetch all menu items (we'll filter by date on the client side)
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })

    if (menuData) {
      setMenuItems(menuData)
    }

    setLoading(false)
  }

  useEffect(() => {
    // Check if we need to reset week due to date change
    checkAndResetIfNeeded()
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get the actual date for the selected weekday in the current week
  const getDateForWeekday = (weekday: string): Date => {
    const weekdayIndex = WEEKDAYS.indexOf(weekday)
    return currentWeek.weekDays[weekdayIndex]
  }

  // Get full date string for cart storage (YYYY-MM-DD)
  const getFullDateString = (weekday: string): string => {
    return format(getDateForWeekday(weekday), 'yyyy-MM-dd')
  }

  // Filter menu items by the selected date
  const getMenuItemsForDate = (weekday: string): MenuItem[] => {
    const dateString = getFullDateString(weekday)
    // If menu items don't have available_date, show all items
    // Otherwise, only show items for the specific date
    return menuItems.filter(item => 
      !item.available_date || item.available_date === dateString
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleAddToCart = (item: MenuItem, portionType: 'Full Order' | 'Half Order' = 'Full Order') => {
    if (!selectedChildId) {
      toast.error('Please select a child first')
      return
    }

    const price = portionType === 'Half Order' ? item.base_price - 2 : item.base_price
    const fullDateString = getFullDateString(selectedDate)
    addItem(selectedChildId, fullDateString, item, portionType, price)
    toast.success(`Added ${item.name} to cart`)
  }

  // Compute cart items dynamically based on current state
  const fullDateString = getFullDateString(selectedDate)
  const currentCartItems = selectedChildId ? getCartItems(selectedChildId, fullDateString) : []
  const currentCartTotal = selectedChildId ? getCartTotal(selectedChildId, fullDateString) : 0

  const checkMissingOrders = () => {
    if (!selectedChildId) return

    // Check which days are missing orders
    const missing = WEEKDAYS.filter(day => {
      const fullDate = getFullDateString(day)
      const items = getCartItems(selectedChildId, fullDate)
      return items.length === 0
    })

    if (missing.length > 0 && missing.length < 5) {
      setMissingDays(missing)
      setCheckoutDialogOpen(true)
    } else {
      proceedToCart()
    }
  }

  const proceedToCart = () => {
    setCheckoutDialogOpen(false)
    router.push('/dashboard/cart')
  }

  // Group menu items by the 4 main categories for the currently selected date
  const filteredMenuItems = getMenuItemsForDate(selectedDate)
  const groupedByCategory = {
    rice: filteredMenuItems.filter(item => item.category === 'rice'),
    noodles: filteredMenuItems.filter(item => item.category === 'noodles'),
    dumplings: filteredMenuItems.filter(item => item.category === 'dumplings'),
    snacks: filteredMenuItems.filter(item => item.category === 'snacks'),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Add a Child First</h3>
            <p className="text-gray-600 mb-4">You need to add a child before you can start ordering</p>
            <Link href="/dashboard/children">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                Add Child
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Child Selector */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600">Select Child</h2>
        <div className="flex gap-3 overflow-x-auto py-1 px-1 -mx-1 -my-1 scrollbar-hide">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all transform scale-90 md:scale-100 min-w-[80px] shadow-sm ${
                selectedChildId === child.id
                  ? 'bg-orange-50 ring-2 ring-orange-400 border border-orange-200'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`${getAvatarColor(child.name)} text-white`}>
                  {getInitials(child.name)}
                </AvatarFallback>
              </Avatar>
              <span className={`text-xs md:text-sm font-medium ${
                selectedChildId === child.id ? 'text-orange-600' : 'text-gray-700'
              }`}>
                {child.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Tabs */}
      <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto bg-gray-100 border border-gray-200">
          {WEEKDAYS.map((day) => {
            const fullDate = getFullDateString(day)
            const hasItems = selectedChildId && getCartItems(selectedChildId, fullDate).length > 0
            const dateObj = getDateForWeekday(day)
            return (
              <TabsTrigger 
                key={day} 
                value={day}
                className="relative py-2 data-[state=active]:bg-orange-400 data-[state=active]:text-white font-medium"
              >
                <div className="flex flex-col items-center">
                  <span>{WEEKDAY_LABELS[day]}</span>
                  <span className="text-[10px] opacity-70">{format(dateObj, 'M/d')}</span>
                </div>
                {hasItems && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-white"></span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {WEEKDAYS.map((day) => (
          <TabsContent key={day} value={day} className="mt-4 space-y-8">
            {/* Menu Categories - 4 Main Groups */}
            {MENU_CATEGORIES.map(category => {
              const items = groupedByCategory[category.id as keyof typeof groupedByCategory]
              if (!items || items.length === 0) return null
              
              const isExpanded = expandedCategories.has(category.id)
              
              return (
                <div key={category.id} className="space-y-4">
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedCategories)
                      if (isExpanded) {
                        newExpanded.delete(category.id)
                      } else {
                        newExpanded.add(category.id)
                      }
                      setExpandedCategories(newExpanded)
                    }}
                    className="w-full flex items-center gap-3 pb-2 border-b-2 border-orange-100 hover:border-orange-300 transition-colors group"
                  >
                    {/* Icon with gradient background */}
                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105`}>
                      <category.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <h2 className="text-xl font-bold text-gray-900">
                        {category.nameEn}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {items.length} items available
                      </p>
                    </div>
                    <ChevronDown 
                      className={`h-6 w-6 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Menu Items Grid - Collapsible */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {items.map((item) => (
                        <MenuItemCard 
                          key={item.id} 
                          item={item} 
                          onAdd={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Cart Summary - Fixed Bottom */}
      {currentCartItems.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-white/50 backdrop-blur-lg border border-white/50 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {children.find(c => c.id === selectedChildId)?.name} - {WEEKDAY_LABELS[selectedDate]} ({format(getDateForWeekday(selectedDate), 'M/d')})
              </p>
              <p className="text-gray-900 font-semibold text-lg">
                {currentCartItems.length} items · <span className="text-orange-500">${currentCartTotal.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  if (selectedChildId) {
                    currentCartItems.forEach(item => removeItem(selectedChildId, fullDateString, item.menu_item.id, item.portion_type))
                  }
                }}
              >
                Clear
              </Button>
              <Button
                onClick={checkMissingOrders}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
              >
                Review Order
              </Button>
            </div>
          </div>
          
          {/* Cart Items Preview */}
          <div className="mt-3 flex flex-wrap gap-2">
            {currentCartItems.map((cartItem, index) => (
              <div 
                key={`${cartItem.menu_item.id}-${cartItem.portion_type}-${index}`}
                className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5"
              >
                <span className="text-gray-800 text-sm font-medium">
                  {cartItem.menu_item.name}
                  {cartItem.portion_type === 'Half Order' && <span className="text-xs ml-1">(Half)</span>}
                </span>
                <span className="text-orange-600 text-xs font-semibold">x{cartItem.quantity}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (selectedChildId) {
                      if (cartItem.quantity > 1) {
                        updateQuantity(selectedChildId, fullDateString, cartItem.menu_item.id, cartItem.quantity - 1, cartItem.portion_type)
                      } else {
                        removeItem(selectedChildId, fullDateString, cartItem.menu_item.id, cartItem.portion_type)
                      }
                    }
                  }}
                  className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 text-gray-600 hover:text-white transition-all text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Orders Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Missing Orders</DialogTitle>
            <DialogDescription className="text-gray-600">
              The following days don't have lunch orders for {children.find(c => c.id === selectedChildId)?.name}:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-4">
            {missingDays.map(day => (
              <span
                key={day}
                className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm"
              >
                {WEEKDAY_LABELS[day]}
              </span>
            ))}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutDialogOpen(false)
                if (missingDays.length > 0) {
                  setSelectedDate(missingDays[0])
                }
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Go Back to Order
            </Button>
            <Button
              onClick={proceedToCart}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              Continue to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
