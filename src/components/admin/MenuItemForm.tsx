'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import type { MenuItem } from '@/types/database'
import { MENU_CATEGORIES } from '@/constants/menu-categories'
import Link from 'next/link'

interface MenuItemFormProps {
  initialData?: MenuItem
  isEdit?: boolean
}

export function MenuItemForm({ initialData, isEdit = false }: MenuItemFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    base_price: initialData?.base_price || 0,
    half_order_price: initialData?.half_order_price || null,
    category: initialData?.category || '',
    is_full_order_only: initialData?.is_full_order_only || false,
    has_tofu_option: initialData?.has_tofu_option || false,
    image_url: initialData?.image_url || '',
    is_vegetarian: initialData?.is_vegetarian || false,
    contains_soy: initialData?.contains_soy || false,
    contains_gluten: initialData?.contains_gluten || false,
    contains_fish: initialData?.contains_fish || false,
    contains_eggs: initialData?.contains_eggs || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      alert('请输入菜品名称')
      return
    }
    if (!formData.category) {
      alert('请选择分类')
      return
    }
    if (formData.base_price <= 0) {
      alert('请输入有效的价格')
      return
    }

    setLoading(true)

    try {
      if (isEdit && initialData?.id) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(formData)
          .eq('id', initialData.id)

        if (error) throw error
        alert('更新成功！')
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert([formData])

        if (error) throw error
        alert('添加成功！')
      }
      
      router.push('/admin/menu')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error saving menu item:', error)
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/menu">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEdit ? '编辑菜品' : '添加菜品'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? '修改菜品信息' : '创建新的菜品'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">菜品名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：鸡肉便当"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">请选择分类</option>
                  {MENU_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameCn} ({cat.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Order Price */}
              <div className="space-y-2">
                <Label htmlFor="price">全份价格 ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                  placeholder="12.99"
                  required
                />
              </div>

              {/* Half Order Price */}
              <div className="space-y-2">
                <Label htmlFor="half_price">
                  半份价格 ($)
                  <span className="text-xs text-gray-500 ml-1">（留空=不支持半份）</span>
                </Label>
                <Input
                  id="half_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.half_order_price || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ 
                      ...formData, 
                      half_order_price: value ? parseFloat(value) : null 
                    })
                  }}
                  placeholder="8.99"
                  disabled={formData.is_full_order_only}
                  className={formData.is_full_order_only ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {formData.is_full_order_only && (
                  <p className="text-xs text-amber-600">
                    ⚠️ 已勾选&ldquo;仅全份&rdquo;，半份价格将被忽略
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url">图片URL（可选）</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简短描述这道菜..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>选项设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.is_full_order_only}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  is_full_order_only: e.target.checked,
                  // 如果勾选"仅全份"，自动清空半份价格
                  half_order_price: e.target.checked ? null : formData.half_order_price
                })}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <div>
                <p className="font-medium text-gray-900">仅全份</p>
                <p className="text-sm text-gray-600">客户不能选择半份（勾选后半份价格将被清空）</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.has_tofu_option}
                onChange={(e) => setFormData({ ...formData, has_tofu_option: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <div>
                <p className="font-medium text-gray-900">素食可选</p>
                <p className="text-sm text-gray-600">可以替换为豆腐</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Dietary Tags */}
        <Card>
          <CardHeader>
            <CardTitle>饮食标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'is_vegetarian', label: '素食' },
                { key: 'contains_soy', label: '含大豆' },
                { key: 'contains_gluten', label: '含麸质' },
                { key: 'contains_fish', label: '含鱼类' },
                { key: 'contains_eggs', label: '含蛋类' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 flex-1 sm:flex-initial"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? '保存中...' : (isEdit ? '更新菜品' : '添加菜品')}
          </Button>
          <Link href="/admin/menu" className="flex-1 sm:flex-initial">
            <Button 
              type="button" 
              variant="outline"
              className="w-full"
            >
              取消
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
