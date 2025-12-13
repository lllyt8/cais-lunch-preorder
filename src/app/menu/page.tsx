'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { MenuItem } from '@/types/database'

export default function PublicMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available_date', null)
      .order('category')

    if (!error && data) {
      setMenuItems(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const categories = [
    { value: 'all', label: '全部', icon: '🍱' },
    { value: 'main_dish', label: '主菜', icon: '🍖' },
    { value: 'rice', label: '主食', icon: '🍚' },
    { value: 'soup', label: '汤品', icon: '🥣' },
    { value: 'beverage', label: '饮品', icon: '🥤' }
  ]

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🍱</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                CAIS Lunch
              </h1>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                登录预订
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Weekly Menu
          </h2>
          <p className="text-xl text-gray-600">
            新鲜食材，营养搭配，每天都有新惊喜
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">暂无菜品</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow bg-white">
                {item.image_url && (
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    <div className="text-orange-600 font-bold">${item.base_price}</div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.is_vegetarian && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                        🌱 素食
                      </span>
                    )}
                    {item.contains_soy && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                        含大豆
                      </span>
                    )}
                    {item.contains_gluten && (
                      <span className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                        含麸质
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">喜欢我们的菜单吗？</h3>
          <p className="text-xl mb-8 text-orange-100">
            立即注册，为孩子预订营养美味的午餐
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-6">
              立即注册
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-600 py-8">
        <p>© 2024 CAIS Lunch Preorder System. All rights reserved.</p>
      </footer>
    </div>
  )
}
