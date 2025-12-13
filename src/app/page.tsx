'use client'

import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Clock, Heart, ChefHat } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/mcot_pic/Banner.png"
                alt="My Cup Of Tea Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/menu" className="text-gray-700 hover:text-[#067a46] font-medium transition-colors">
                Our Menu
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-[#067a46] font-medium transition-colors">
                How It Works
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh, delicious meals
                <br />
                <span className="text-[#067a46]">
                  delivered daily
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Nutritious school lunches your kids will love. Easy ordering, flexible scheduling, and quality ingredients from local suppliers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/menu">
                <Button size="lg" className="bg-[#232323] hover:bg-[#067a46] text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all">
                  View Our Menu
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-900 hover:border-[#067a46] hover:text-[#067a46] text-lg px-8 py-6 rounded-full transition-all">
                  Get Started →
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Families trust us</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Meals delivered</div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/mcot_pic/All_pop_food.jpg"
                alt="Delicious healthy lunch"
                className="w-full h-[500px] object-cover brightness-110"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" fill="currentColor" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Fresh Daily</div>
                  <div className="text-sm text-gray-600">Locally sourced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How it works</h3>
            <p className="text-xl text-gray-600">Three simple steps to delicious school lunches</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FAF8F3] rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-[#067a46] rounded-full flex items-center justify-center mb-6">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div className="mb-4">
                <span className="text-sm font-bold text-[#067a46] uppercase tracking-wide">Step 1</span>
                <h4 className="text-xl font-bold text-gray-900 mt-2">Choose your meals</h4>
              </div>
              <p className="text-gray-600">
                Browse our weekly rotating menu and select nutritious meals your kids will love.
              </p>
            </div>

            <div className="bg-[#FAF8F3] rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-[#067a46] rounded-full flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="mb-4">
                <span className="text-sm font-bold text-[#067a46] uppercase tracking-wide">Step 2</span>
                <h4 className="text-xl font-bold text-gray-900 mt-2">Set your schedule</h4>
              </div>
              <p className="text-gray-600">
                Order by the week or month. Skip or pause anytime with complete flexibility.
              </p>
            </div>

            <div className="bg-[#FAF8F3] rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-[#067a46] rounded-full flex items-center justify-center mb-6">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
              <div className="mb-4">
                <span className="text-sm font-bold text-[#067a46] uppercase tracking-wide">Step 3</span>
                <h4 className="text-xl font-bold text-gray-900 mt-2">Enjoy fresh meals</h4>
              </div>
              <p className="text-gray-600">
                Meals are prepared fresh daily and delivered to your child at lunchtime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#067a46] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to get started?</h3>
          <p className="text-xl mb-10 text-green-50">
            Join hundreds of families enjoying nutritious, delicious school lunches
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="bg-white text-[#067a46] hover:bg-gray-100 text-lg px-10 py-6 rounded-full font-bold shadow-lg">
                View Our Menu
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 rounded-full font-bold">
                Sign Up Now
              </Button>
            </Link>
          </div>
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
                <li><Link href="/menu" className="text-gray-600 hover:text-[#067a46] text-sm transition-colors">Our Menu</Link></li>
                <li><Link href="#how-it-works" className="text-gray-600 hover:text-[#067a46] text-sm transition-colors">How It Works</Link></li>
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
