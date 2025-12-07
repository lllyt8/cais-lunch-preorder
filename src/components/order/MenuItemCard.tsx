'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MenuItem } from '@/types/database'
import { DIETARY_TAGS } from '@/constants/dietary-tags'

interface MenuItemCardProps {
  item: MenuItem
  onAdd: (item: MenuItem, portionType: 'Full Order' | 'Half Order') => void
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const [selectedPortion, setSelectedPortion] = useState<'Full Order' | 'Half Order'>('Full Order')
  const isDumplings = item.name.toLowerCase().includes('dumpling')
  
  // 获取当前菜品的所有激活标签
  const activeTags = DIETARY_TAGS.filter(tag => item[tag.key])
  
  const getPrice = () => {
    if (isDumplings) {
      return selectedPortion === 'Full Order' ? 13 : 11
    }
    return item.base_price
  }

  const getPortionLabel = () => {
    if (isDumplings) {
      return selectedPortion === 'Full Order' ? '8 pieces' : '6 pieces'
    }
    return selectedPortion
  }

  return (
    <Card className="bg-white border-gray-200 hover:border-orange-300 transition-all shadow-sm overflow-hidden">
      {/* 菜品图片 */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50">
        {item.image_url ? (
          <Image 
            src={item.image_url} 
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl opacity-30">🍱</span>
          </div>
        )}
        
        {/* Tofu Option Badge */}
        {item.has_tofu_option && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium shadow-sm">
              素食可选
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-gray-900 text-base leading-tight">
          {item.name}
        </CardTitle>
        {item.description && (
          <CardDescription className="text-gray-600 text-sm mt-1 line-clamp-2">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 饮食标签 */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTags.map(tag => (
              <span 
                key={tag.key}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 
                  rounded-md text-xs font-medium border
                  ${tag.bgColor} ${tag.color} ${tag.borderColor}
                `}
              >
                <span className="text-sm">{tag.icon}</span>
                <span>{tag.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Portion Selector for Dumplings */}
        {isDumplings && !item.is_full_order_only && (
          <Select 
            value={selectedPortion} 
            onValueChange={(v) => setSelectedPortion(v as 'Full Order' | 'Half Order')}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="Full Order" className="text-gray-900">
                Full Order (8 pieces) - $13.00
              </SelectItem>
              <SelectItem value="Half Order" className="text-gray-900">
                Half Order (6 pieces) - $11.00
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* 价格和添加按钮 */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-orange-500 font-bold text-xl">
              ${getPrice().toFixed(2)}
            </span>
            {isDumplings && (
              <span className="text-gray-500 text-sm ml-2">
                ({getPortionLabel()})
              </span>
            )}
            {item.is_full_order_only && (
              <span className="text-gray-500 text-xs block mt-0.5">
                Full Order Only
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAdd(item, isDumplings ? selectedPortion : 'Full Order')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm"
          >
            + 添加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
