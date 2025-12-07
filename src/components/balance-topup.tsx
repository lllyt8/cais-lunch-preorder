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
        <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700">
          💳 充值余额
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">账户充值</DialogTitle>
          <DialogDescription className="text-slate-400">
            当前余额: <span className="text-amber-400 font-semibold">{formatCurrency(currentBalance)}</span>
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
                className={`cursor-pointer transition-all hover:border-amber-500/50 ${
                  selectedAmount === option.amount 
                    ? 'border-amber-500 bg-amber-500/10' 
                    : 'bg-slate-700/50 border-slate-600'
                }`}
                onClick={() => !loading && handleTopup(option.amount)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xl font-bold text-slate-100">
                      {formatCurrency(option.amount)}
                    </p>
                    {option.bonus > 0 && (
                      <p className="text-sm text-green-400">
                        +{formatCurrency(option.bonus)} 赠送
                      </p>
                    )}
                  </div>
                  <Button
                    disabled={loading}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
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

        <p className="text-xs text-slate-500 text-center">
          支持 Apple Pay / Google Pay / 信用卡
        </p>
      </DialogContent>
    </Dialog>
  )
}
