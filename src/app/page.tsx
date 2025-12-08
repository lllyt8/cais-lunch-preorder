'use client'

import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Clock, Heart, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍱</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              CAIS Lunch
            </h1>
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              登录
            </Button>
          </Link>
        </header>

        {/* Main Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              每一顿午餐
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                都是一天的期待
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              为孩子预订营养美味的学校午餐，轻松便捷，让每一天都充满美好期待
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg px-8 py-6 shadow-xl">
                  开始预订
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="lg" variant="outline" className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 text-lg px-8 py-6">
                  查看今日菜单 →
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">家庭信赖</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">订单完成</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-600">用户评分</div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" 
                alt="美味午餐"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" fill="currentColor" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">新鲜食材</div>
                  <div className="text-sm text-gray-600">每日采购</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">秒级预订</h3>
            <p className="text-gray-600">
              随时随地，3秒完成下单，提前规划孩子的一周午餐
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">营养均衡</h3>
            <p className="text-gray-600">
              专业营养师搭配，荤素搭配合理，让孩子吃得健康
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">灵活排期</h3>
            <p className="text-gray-600">
              按周预订，随时调整，完全掌控孩子的用餐计划
            </p>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl mb-20">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">家长们都在说</h3>
            <p className="text-gray-600">看看其他家长的真实反馈</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: '李女士', feedback: '孩子每天都很期待午餐时间，菜品丰富，味道也很好！', rating: 5 },
              { name: '王先生', feedback: '操作简单，提前一周就能安排好，再也不用每天操心了。', rating: 5 },
              { name: '张女士', feedback: '营养搭配很科学，孩子的身体比以前更健康了。', rating: 5 }
            ].map((review, i) => (
              <div key={i} className="bg-orange-50 rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{review.feedback}</p>
                <p className="font-semibold text-gray-900">— {review.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-4xl font-bold mb-4">准备好开始了吗？</h3>
          <p className="text-xl mb-8 text-orange-100">
            加入我们，让孩子的每一顿午餐都充满期待
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-6">
                立即注册
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                先看看菜单
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 mt-16 pb-8">
          <p>© 2024 CAIS Lunch Preorder System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
