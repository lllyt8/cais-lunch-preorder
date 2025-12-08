'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MenuItemForm } from '@/components/admin/MenuItemForm'
import type { MenuItem } from '@/types/database'

export default function EditMenuItemPage() {
  const params = useParams()
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!params.id) return

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching menu item:', error)
        alert('加载失败：' + error.message)
      } else {
        setMenuItem(data)
      }
      setLoading(false)
    }

    fetchMenuItem()
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-600">加载菜品信息中...</p>
      </div>
    )
  }

  if (!menuItem) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-600">未找到菜品</p>
      </div>
    )
  }

  return <MenuItemForm initialData={menuItem} isEdit />
}
