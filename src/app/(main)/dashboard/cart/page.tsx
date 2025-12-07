'use client'

import { useCart } from '@/hooks/use-cart'
import { useChildren } from '@/hooks/use-children'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/stripe'

const WEEKDAY_LABELS: Record<string, string> = {
  'Mon': '周一',
  'Tue': '周二',
  'Wed': '周三',
  'Thu': '周四',
  'Fri': '周五',
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearAllCarts, getTotalItemCount } = useCart()
  const { data: children, isLoading: childrenLoading } = useChildren()
  const router = useRouter()

  const totalItemCount = getTotalItemCount()

  // Show loading state while children data is loading
  if (childrenLoading) {
    return (
      <div className="px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Calculate grand total
  const grandTotal = Object.values(items).reduce((total, cartItems) => {
    return total + cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  }, 0)

  // Group items by child and date (only after children are loaded)
  const groupedItems = Object.entries(items).map(([key, cartItems]) => {
    // Split from the last hyphen since childId (UUID) contains hyphens
    const lastHyphenIndex = key.lastIndexOf('-')
    const childId = key.substring(0, lastHyphenIndex)
    const date = key.substring(lastHyphenIndex + 1)
    const child = children?.find(c => c.id === childId)
    return {
      key,
      childId,
      childName: child?.name || 'Unknown',
      date,
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    }
  }).filter(group => group.items.length > 0)

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

      {/* Cart Items by Child/Date */}
      <div className="space-y-4">
        <AnimatePresence>
          {groupedItems.map((group) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-gray-900 font-medium">{group.childName}</p>
                      <p className="text-gray-600 text-sm">
                        {WEEKDAY_LABELS[group.date] || group.date}
                      </p>
                    </div>
                    <p className="text-orange-500 font-semibold">
                      {formatCurrency(group.total)}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {group.items.map((item, index) => (
                      <div key={`${item.menu_item.id}-${item.portion_type}-${index}`} className="flex items-center gap-3">
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => updateQuantity(
                              group.childId,
                              group.date,
                              item.menu_item.id,
                              item.quantity - 1,
                              item.portion_type
                            )}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-gray-900 w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => updateQuantity(
                              group.childId,
                              group.date,
                              item.menu_item.id,
                              item.quantity + 1,
                              item.portion_type
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(
                              group.childId,
                              group.date,
                              item.menu_item.id,
                              item.portion_type
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Clear Cart */}
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-red-500 hover:bg-red-50"
          onClick={clearAllCarts}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
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
