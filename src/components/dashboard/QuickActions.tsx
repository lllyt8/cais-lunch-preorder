'use client'

import { RefreshCw, Heart, ChevronRight, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useReorder } from '@/hooks/use-reorder'
import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const { lastWeekOrders, fetchLastWeekOrders, reorderWeekToCart, loading } = useReorder()
  const router = useRouter()

  const loadLastWeekOrders = useCallback(() => {
    fetchLastWeekOrders()
  }, [fetchLastWeekOrders])

  useEffect(() => {
    loadLastWeekOrders()
  }, [loadLastWeekOrders])

  const handleReorder = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const success = await reorderWeekToCart()
    if (success) {
      router.push('/dashboard/cart')
    }
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
      </div>

      {/* Reorder Card - Now with actual reorder functionality */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {lastWeekOrders && lastWeekOrders.length > 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center">
                {/* Left: Icon */}
                <div className="p-4 bg-orange-50 rounded-l-lg">
                  <RefreshCw className="h-8 w-8 text-orange-500" />
                </div>

                {/* Middle: Content */}
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-gray-800">Reorder Last Week?</h3>
                  <p className="text-sm text-gray-500">
                    {lastWeekOrders.length} order{lastWeekOrders.length > 1 ? 's' : ''} from last week
                  </p>
                </div>

                {/* Right: Reorder Button */}
                <div className="pr-4">
                  <Button
                    onClick={handleReorder}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    {loading ? 'Adding...' : 'Reorder'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Link href="/dashboard/orders">
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Left: Icon */}
                  <div className="p-4 bg-orange-50 rounded-l-lg">
                    <RefreshCw className="h-8 w-8 text-orange-500" />
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-gray-800">Order Again?</h3>
                    <p className="text-sm text-gray-400">See your orders and reorder instantly</p>
                  </div>

                  {/* Right: Arrow */}
                  <div className="pr-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </motion.div>

      {/* Favorites Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/dashboard/favorites">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <div className="flex items-center">
                {/* Left: Icon */}
                <div className="p-4 bg-rose-50 rounded-l-lg">
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
                
                {/* Middle: Content */}
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-gray-800">Favorites</h3>
                  <p className="text-sm text-gray-500">Your saved meal templates</p>
                </div>
                
                {/* Right: Arrow */}
                <div className="pr-4">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Start New Order Card - CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link href="/dashboard/order">
          <Card className="bg-orange-500 border-0 shadow-lg hover:bg-orange-600 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="h-6 w-6 text-white" />
                  <div>
                    <h3 className="font-bold text-white text-lg">Start New Order</h3>
                    <p className="text-white/80 text-sm">Browse the full menu</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}
