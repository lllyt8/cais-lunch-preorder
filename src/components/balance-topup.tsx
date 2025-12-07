'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/stripe'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const TOPUP_OPTIONS = [
  { amount: 25, bonus: 0 },
  { amount: 50, bonus: 2 },
  { amount: 100, bonus: 5 },
]

export function BalanceTopup({ currentBalance = 0 }: { currentBalance?: number }) {
  const [loading, setLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const handleTopup = async (amount: number) => {
    setLoading(true)
    setSelectedAmount(amount)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch {
      toast.error('支付初始化失败，请重试')
    } finally {
      setLoading(false)
      setSelectedAmount(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-white hover:bg-gray-50 text-orange-600 border-2 border-orange-300 shadow-sm font-semibold">
          💳 充值余额
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">账户充值</DialogTitle>
          <DialogDescription className="text-gray-600">
            当前余额: <span className="text-orange-600 font-semibold">{formatCurrency(currentBalance)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {TOPUP_OPTIONS.map((option, index) => (
            <motion.div
              key={option.amount}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:border-orange-400 hover:shadow-md ${
                  selectedAmount === option.amount 
                    ? 'border-orange-500 bg-orange-50 shadow-md' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => !loading && handleTopup(option.amount)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(option.amount)}
                    </p>
                    {option.bonus > 0 && (
                      <p className="text-sm text-green-600">
                        +{formatCurrency(option.bonus)} 赠送
                      </p>
                    )}
                  </div>
                  <Button
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {loading && selectedAmount === option.amount ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      '充值'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center">
          支持 Apple Pay / Google Pay / 信用卡
        </p>
      </DialogContent>
    </Dialog>
  )
}
