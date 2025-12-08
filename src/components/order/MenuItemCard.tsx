'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MenuItem } from '@/types/database'
import { DIETARY_TAGS } from '@/constants/dietary-tags'
import { UtensilsCrossed } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
  onAdd: (item: MenuItem, portionType: 'Full Order' | 'Half Order') => void
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const [selectedPortion, setSelectedPortion] = useState<'Full Order' | 'Half Order'>('Full Order')
  
  // 判断是否支持半份：有 half_order_price 且不是仅全份
  const supportsHalfOrder = !item.is_full_order_only && item.half_order_price != null
  
  // 获取当前菜品的所有激活标签
  const activeTags = DIETARY_TAGS.filter(tag => item[tag.key])
  
  const getPrice = () => {
    if (selectedPortion === 'Half Order' && item.half_order_price != null) {
      return item.half_order_price
    }
    return item.base_price
  }

  return (
    <Card className="group bg-white border-gray-200 hover:border-orange-300 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.12),0_2px_8px_rgba(0,0,0,0.08)] hover:-translate-y-1 overflow-hidden">
      {/* 菜品图片 */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 via-white to-orange-100">
        {item.image_url ? (
          <Image 
            src={item.image_url} 
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <>
            {/* 装饰性渐变圆圈 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-orange-200/30 blur-3xl" />
              <div className="absolute bottom-[-20%] left-[-20%] w-40 h-40 rounded-full bg-orange-300/20 blur-2xl" />
            </div>
            
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
                  <UtensilsCrossed className="w-12 h-12 text-orange-500" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </>
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

        {/* Portion Selector - 显示支持半份的菜品 */}
        {supportsHalfOrder && (
          <Select 
            value={selectedPortion} 
            onValueChange={(v) => setSelectedPortion(v as 'Full Order' | 'Half Order')}
          >
            <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="Full Order" className="text-gray-900">
                Full Order - ${item.base_price.toFixed(2)}
              </SelectItem>
              <SelectItem value="Half Order" className="text-gray-900">
                Half Order - ${item.half_order_price?.toFixed(2)}
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
            {supportsHalfOrder && selectedPortion === 'Half Order' && (
              <span className="text-gray-500 text-sm ml-2">
                (Half Order)
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
            onClick={() => onAdd(item, supportsHalfOrder ? selectedPortion : 'Full Order')}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            + 添加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
