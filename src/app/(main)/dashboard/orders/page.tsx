'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Order, Child } from '@/types/database'

interface OrderWithChild extends Order {
  children: Child
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithChild[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          children (*)
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data as OrderWithChild[])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">已支付</span>
      case 'pending_payment':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">待支付</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">已取消</span>
      default:
        return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs">{status}</span>
    }
  }

  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">已送达</span>
      case 'pending_delivery':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">待配送</span>
      default:
        return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">订单历史</h1>
        <p className="text-gray-600">查看您的所有订单记录</p>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">📋</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无订单</h3>
            <p className="text-gray-600">您还没有任何订单记录</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-gray-800 text-base">
                        {order.children?.name || 'Unknown'}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {new Date(order.order_date).toLocaleDateString('zh-CN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <span className="text-orange-500 font-bold">${order.total_amount}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    {getStatusBadge(order.status)}
                    {getFulfillmentBadge(order.fulfillment_status)}
                  </div>
                  {order.special_requests && (
                    <p className="text-sm text-gray-500">备注: {order.special_requests}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block bg-white border-gray-200 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700">订单日期</TableHead>
                  <TableHead className="text-gray-700">孩子</TableHead>
                  <TableHead className="text-gray-700">金额</TableHead>
                  <TableHead className="text-gray-700">支付状态</TableHead>
                  <TableHead className="text-gray-700">配送状态</TableHead>
                  <TableHead className="text-gray-700">创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell className="text-gray-800">
                      {new Date(order.order_date).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {order.children?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-orange-500 font-semibold">
                      ${order.total_amount}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getFulfillmentBadge(order.fulfillment_status)}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(order.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
