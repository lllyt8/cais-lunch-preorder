'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  UtensilsCrossed
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { MenuItem } from '@/types/database'
import { MENU_CATEGORIES } from '@/constants/menu-categories'

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  const fetchMenuItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name')

    if (error) {
      console.error('Error fetching menu items:', error)
    } else {
      setMenuItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    let filtered = [...menuItems]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }, [menuItems, selectedCategory, searchTerm])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除 "${name}" 吗？此操作不可撤销。`)) return

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) {
      alert('删除失败：' + error.message)
    } else {
      fetchMenuItems()
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-600">加载菜单中...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">菜单管理</h1>
          <p className="text-gray-600 mt-1">管理餐厅菜品，设置价格和库存</p>
        </div>
        <Link href="/admin/menu/new">
          <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            添加菜品
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">搜索菜品</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="输入菜品名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">分类筛选</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">全部分类</option>
                {MENU_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameCn} ({cat.nameEn})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">总菜品</p>
              <p className="text-2xl font-bold mt-1">{menuItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">筛选结果</p>
              <p className="text-2xl font-bold mt-1">{filteredItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">有图片</p>
              <p className="text-2xl font-bold mt-1">
                {menuItems.filter(item => item.image_url).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">分类数</p>
              <p className="text-2xl font-bold mt-1">{MENU_CATEGORIES.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? '没有找到匹配的菜品' 
                : '还没有菜品，点击上方"添加菜品"开始'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        图片
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        分类
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        价格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        选项
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image_url ? (
                              <Image 
                                src={item.image_url} 
                                alt={item.name}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {MENU_CATEGORIES.find(c => c.id === item.category)?.nameCn || item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-orange-600">
                            ${item.base_price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {item.is_full_order_only && (
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mr-1">
                                仅全份
                              </div>
                            )}
                            {item.has_tofu_option && (
                              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                                素食可选
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link href={`/admin/menu/${item.id}`}>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image 
                          src={item.image_url} 
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {MENU_CATEGORIES.find(c => c.id === item.category)?.nameCn}
                      </p>
                      <p className="text-lg font-semibold text-orange-600 mt-1">
                        ${item.base_price.toFixed(2)}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex gap-2 mt-2">
                        {item.is_full_order_only && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            仅全份
                          </span>
                        )}
                        {item.has_tofu_option && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            素食可选
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Link href={`/admin/menu/${item.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Pencil className="h-4 w-4 mr-2" />
                            编辑
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(item.id, item.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
