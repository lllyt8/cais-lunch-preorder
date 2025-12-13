'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { MenuItem } from '@/types/database'

// Fallback demo menu items if database is empty
const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: 'demo-1',
    name: 'Orange Chicken with Rice',
    description: 'Crispy chicken with sweet orange sauce, steamed rice and vegetables',
    base_price: 12.00,
    category: 'rice',
    is_vegetarian: false,
    contains_soy: true,
    contains_gluten: true,
    image_url: '/mcot_pic/All_pop_food.jpg',
    is_full_order_only: false,
    has_tofu_option: true,
  },
  {
    id: 'demo-2',
    name: 'Teriyaki Chicken Bento',
    description: 'Grilled chicken with teriyaki sauce, rice, and fresh vegetables',
    base_price: 12.00,
    category: 'rice',
    is_vegetarian: false,
    contains_soy: true,
    contains_gluten: true,
    is_full_order_only: false,
    has_tofu_option: true,
  },
  {
    id: 'demo-3',
    name: 'Steamed Dumplings',
    description: 'Pork and vegetable dumplings with soy dipping sauce',
    base_price: 13.00,
    category: 'dumplings',
    is_vegetarian: false,
    contains_soy: true,
    contains_gluten: true,
    image_url: '/mcot_pic/Dumpling.png',
    is_full_order_only: false,
    has_tofu_option: true,
  },
  {
    id: 'demo-4',
    name: 'Vegetable Spring Rolls',
    description: 'Fresh vegetables wrapped in rice paper with peanut sauce',
    base_price: 10.00,
    category: 'snacks',
    is_vegetarian: true,
    contains_soy: false,
    contains_gluten: false,
    is_full_order_only: true,
    has_tofu_option: false,
  },
]

export default function PublicMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')

    if (!error && data && data.length > 0) {
      setMenuItems(data)
    } else {
      // Use demo data if database is empty or error
      setMenuItems(DEMO_MENU_ITEMS)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'rice', label: 'Rice & Bento' },
    { value: 'noodles', label: 'Noodles' },
    { value: 'dumplings', label: 'Dumplings' },
    { value: 'snacks', label: 'Snacks' }
  ]

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/mcot_pic/Banner.png"
                alt="My Cup Of Tea Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-[#067a46] font-medium transition-colors">
                Home
              </Link>
              <Link href="/menu" className="text-[#067a46] font-medium">
                Our Menu
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full px-6">
                  Log In
                </Button>
              </Link>
            </nav>
            <Link href="/login" className="md:hidden">
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Weekly Menu
          </h2>
          <p className="text-xl text-gray-600">
            Fresh ingredients, balanced nutrition, something new every day
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#067a46] text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-[#067a46]/10 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#067a46]"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No menu items available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all bg-white group">
                {item.image_url && (
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                {!item.image_url && (
                  <div className="h-48 bg-gradient-to-br from-[#067a46]/10 to-orange-100 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">No image</div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    <div className="text-[#067a46] font-bold text-lg">${item.base_price?.toFixed(2)}</div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.is_vegetarian && (
                      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                        Vegetarian
                      </span>
                    )}
                    {item.contains_soy && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                        Soy
                      </span>
                    )}
                    {item.contains_gluten && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                        Gluten
                      </span>
                    )}
                    {item.has_tofu_option && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        Tofu Option
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <div className="bg-[#067a46] rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Love what you see?</h3>
          <p className="text-xl mb-8 text-green-50">
            Sign up now and start ordering nutritious, delicious lunches for your kids
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-[#067a46] hover:bg-gray-100 text-lg px-10 py-6 rounded-full font-bold shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <img
                  src="/mcot_pic/Banner.png"
                  alt="My Cup Of Tea Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fresh, nutritious school lunches delivered daily since 2017.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-[#067a46] text-sm transition-colors">Home</Link></li>
                <li><Link href="/menu" className="text-gray-600 hover:text-[#067a46] text-sm transition-colors">Our Menu</Link></li>
                <li><Link href="/login" className="text-gray-600 hover:text-[#067a46] text-sm transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="font-medium">2666 Ocean Avenue</li>
                <li>San Francisco, CA 94132</li>
                <li className="pt-2">
                  <a href="tel:+14157533338" className="hover:text-[#067a46] transition-colors">
                    (415) 753-3338
                  </a>
                </li>
                <li>
                  <a href="https://www.mycupofteasf.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#067a46] transition-colors">
                    mycupofteasf.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media Column */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/mycupofteasf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 hover:bg-[#E4405F] rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/officialmycupoftea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 hover:bg-[#1877F2] rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} My Cup Of Tea. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
