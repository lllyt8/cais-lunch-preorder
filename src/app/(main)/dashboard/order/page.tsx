'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import type { Child, MenuItem } from '@/types/database'
import Link from 'next/link'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const WEEKDAY_LABELS: Record<string, string> = {
  'Mon': '周一',
  'Tue': '周二',
  'Wed': '周三',
  'Thu': '周四',
  'Fri': '周五',
}

export default function OrderPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [missingDays, setMissingDays] = useState<string[]>([])
  
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

    // Fetch menu items
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
    fetchData()
  }, [])

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
      toast.error('请先选择一个孩子')
      return
    }
    
    const price = portionType === 'Half Order' ? item.base_price - 2 : item.base_price
    addItem(selectedChildId, selectedDate, item, portionType, price)
    toast.success(`已添加 ${item.name}`)
  }

  const currentCartItems = selectedChildId ? getCartItems(selectedChildId, selectedDate) : []
  const currentCartTotal = selectedChildId ? getCartTotal(selectedChildId, selectedDate) : 0

  const checkMissingOrders = () => {
    if (!selectedChildId) return

    // Check which days are missing orders
    const missing = WEEKDAYS.filter(day => {
      const items = getCartItems(selectedChildId, day)
      return items.length === 0
    })

    if (missing.length > 0 && missing.length < 5) {
      setMissingDays(missing)
      setCheckoutDialogOpen(true)
    } else {
      proceedToCheckout()
    }
  }

  const proceedToCheckout = () => {
    setCheckoutDialogOpen(false)
    toast.success('前往结算页面...')
    // Navigate to checkout
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

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
            <span className="text-6xl mb-4">👶</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">请先添加孩子</h3>
            <p className="text-gray-600 mb-4">您需要先添加孩子才能开始订餐</p>
            <Link href="/dashboard/children">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                去添加孩子
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
        <h2 className="text-sm font-medium text-gray-600">选择孩子</h2>
        <div className="flex gap-3 overflow-x-auto py-1 px-1 -mx-1 -my-1 scrollbar-hide">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] shadow-sm ${
                selectedChildId === child.id
                  ? 'bg-orange-50 ring-2 ring-orange-400 border border-orange-200'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`${getAvatarColor(child.name)} text-white`}>
                  {getInitials(child.name)}
                </AvatarFallback>
              </Avatar>
              <span className={`text-sm font-medium ${
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
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 border border-gray-200">
          {WEEKDAYS.map((day) => {
            const hasItems = selectedChildId && getCartItems(selectedChildId, day).length > 0
            return (
              <TabsTrigger 
                key={day} 
                value={day}
                className="relative data-[state=active]:bg-orange-400 data-[state=active]:text-white font-medium"
              >
                {WEEKDAY_LABELS[day]}
                {hasItems && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-white"></span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {WEEKDAYS.map((day) => (
          <TabsContent key={day} value={day} className="mt-4 space-y-6">
            {/* Menu Categories */}
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      onAdd={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Cart Summary - Fixed Bottom */}
      {currentCartItems.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-white/50 backdrop-blur-lg border border-white/50 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {children.find(c => c.id === selectedChildId)?.name} - {WEEKDAY_LABELS[selectedDate]}
              </p>
              <p className="text-gray-900 font-semibold text-lg">
                {currentCartItems.length} 项商品 · <span className="text-orange-500">${currentCartTotal.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  if (selectedChildId) {
                    currentCartItems.forEach(item => removeItem(selectedChildId, selectedDate, item.menu_item.id, item.portion_type))
                  }
                }}
              >
                清空
              </Button>
              <Button 
                onClick={checkMissingOrders}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
              >
                去结算
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
                        updateQuantity(selectedChildId, selectedDate, cartItem.menu_item.id, cartItem.quantity - 1, cartItem.portion_type)
                      } else {
                        removeItem(selectedChildId, selectedDate, cartItem.menu_item.id, cartItem.portion_type)
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
            <DialogTitle className="text-gray-900">您是否忘了点餐？</DialogTitle>
            <DialogDescription className="text-gray-600">
              以下日期还没有为 {children.find(c => c.id === selectedChildId)?.name} 添加午餐：
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
              返回补单
            </Button>
            <Button 
              onClick={proceedToCheckout}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              继续结算
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Menu Item Card Component
function MenuItemCard({ 
  item, 
  onAdd 
}: { 
  item: MenuItem
  onAdd: (item: MenuItem, portionType: 'Full Order' | 'Half Order') => void 
}) {
  const [selectedPortion, setSelectedPortion] = useState<'Full Order' | 'Half Order'>('Full Order')
  const isDumplings = item.name.toLowerCase().includes('dumpling')
  
  const getPrice = () => {
    if (isDumplings) {
      return selectedPortion === 'Full Order' ? 13 : 11
    }
    return item.base_price
  }

  const getPortionLabel = () => {
    if (isDumplings) {
      return selectedPortion === 'Full Order' ? '8 pieces' : '6 pieces'
    }
    return selectedPortion
  }

  return (
    <Card className="bg-white border-gray-200 hover:border-orange-300 transition-colors shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gray-900 text-base">{item.name}</CardTitle>
            {item.description && (
              <CardDescription className="text-gray-600 text-sm mt-1">
                {item.description}
              </CardDescription>
            )}
          </div>
          {item.has_tofu_option && (
            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200">
              素食可选
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Portion Selector for Dumplings */}
        {isDumplings && !item.is_full_order_only && (
          <Select 
            value={selectedPortion} 
            onValueChange={(v) => setSelectedPortion(v as 'Full Order' | 'Half Order')}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="Full Order" className="text-gray-900">
                Full Order (8 pieces) - $13.00
              </SelectItem>
              <SelectItem value="Half Order" className="text-gray-900">
                Half Order (6 pieces) - $11.00
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-500 font-bold text-lg">${getPrice().toFixed(2)}</span>
            {isDumplings && (
              <span className="text-gray-500 text-sm ml-2">({getPortionLabel()})</span>
            )}
            {item.is_full_order_only && (
              <span className="text-gray-500 text-xs block">Full Order Only</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAdd(item, isDumplings ? selectedPortion : 'Full Order')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            + 添加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
