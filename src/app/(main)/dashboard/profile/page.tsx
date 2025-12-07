'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BalanceTopup } from '@/components/balance-topup'
import { LogOut, Mail, Phone, CreditCard, ChevronRight, Settings, HelpCircle, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  phone_number?: string
  account_balance: number
  stripe_customer_id?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data as UserProfile)
      setLoading(false)
    }

    fetchProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <Avatar className="h-24 w-24 mb-4 border-4 border-orange-200">
          <AvatarFallback className="bg-orange-100 text-orange-600 text-3xl font-bold">
            {profile?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-gray-800">
          {profile?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-gray-500 text-sm">{profile?.email}</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-orange-500 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Account Balance</p>
                <p className="text-white text-3xl font-bold">
                  ${(profile?.account_balance || 0).toFixed(2)}
                </p>
              </div>
              <CreditCard className="h-12 w-12 text-white/30" />
            </div>
            <div className="mt-4">
              <BalanceTopup currentBalance={profile?.account_balance || 0} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-800 text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-gray-700 text-sm">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Phone className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="text-gray-700 text-sm">{profile?.phone_number || 'Not set'}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-500">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Link href="/dashboard/children">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">Manage Children</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Privacy & Security</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Help & Support</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      {/* App Version */}
      <p className="text-center text-gray-400 text-xs">
        CAIS Lunch v1.0.0
      </p>
    </div>
  )
}
