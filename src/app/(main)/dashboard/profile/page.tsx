'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Mail, Phone, ChevronRight, Settings, User } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  name?: string
  phone_number?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
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
      setName(data?.name || data?.email?.split('@')[0] || '')
      setPhone(data?.phone_number || '')
      setLoading(false)
    }

    fetchProfile()
  }, [supabase, router])

  const handleSaveName = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, name })
      setEditingName(false)
    }
    setSaving(false)
  }

  const handleSavePhone = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({ phone_number: phone })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, phone_number: phone })
      setEditingPhone(false)
    }
    setSaving(false)
  }

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
        <Avatar className="h-24 w-24 mb-4 ring-4 ring-orange-100 shadow-md">
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white text-3xl font-bold">
            {(profile?.name || profile?.email)?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-gray-800">
          {profile?.name || profile?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-gray-500 text-sm">{profile?.email}</p>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-800 text-base">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Name Field */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <User className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Name</p>
                {editingName ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-sm h-8 mt-1 bg-white"
                    placeholder="Enter your name"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-700 text-sm">
                    {profile?.name || profile?.email?.split('@')[0] || 'Not set'}
                  </p>
                )}
              </div>
              {editingName ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 h-8"
                    onClick={() => {
                      setEditingName(false)
                      setName(profile?.name || profile?.email?.split('@')[0] || '')
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white h-8"
                    onClick={handleSaveName}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500"
                  onClick={() => setEditingName(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-gray-700 text-sm">{profile?.email}</p>
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Phone className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Phone</p>
                {editingPhone ? (
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-sm h-8 mt-1 bg-white"
                    placeholder="Enter your phone number"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-700 text-sm">{profile?.phone_number || 'Not set'}</p>
                )}
              </div>
              {editingPhone ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 h-8"
                    onClick={() => {
                      setEditingPhone(false)
                      setPhone(profile?.phone_number || '')
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white h-8"
                    onClick={handleSavePhone}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500"
                  onClick={() => setEditingPhone(true)}
                >
                  Edit
                </Button>
              )}
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
      <p className="text-center text-gray-400 text-xs mt-4">
        © {new Date().getFullYear()} My Cup Of Tea. All rights reserved.
      </p>
    </div>
  )
}
