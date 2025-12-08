'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  Calendar as CalendarIcon,
  Search,
  ArrowUpDown,
  User,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'
import type { Order, OrderDetail, MenuItem, User as UserType } from '@/types/database'

interface OrderWithDetails extends Order {
  order_details: (OrderDetail & {
    menu_items: MenuItem
  })[]
  users: UserType
  children?: { name: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users:parent_id (
          id,
          email,
          full_name
        ),
        order_details (
          *,
          menu_items (
            id,
            name,
            base_price
          )
        )
      `)
      .order('order_date', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const filterAndSortOrders = () => {
    let filtered = [...orders]

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(order => 
        order.order_date === selectedDate
      )
    }

    // Filter by search term (customer email)
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.order_date).getTime()
      const dateB = new Date(b.order_date).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    setFilteredOrders(filtered)
  }

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert('没有订单可导出')
      return
    }

    // Aggregate items by menu item
    const itemSummary: Record<string, { name: string; quantity: number; orders: number }> = {}
    
    filteredOrders.forEach(order => {
      order.order_details?.forEach(detail => {
        const itemName = `${detail.menu_items?.name || '未知菜品'} (${detail.portion_type})`
        if (!itemSummary[itemName]) {
          itemSummary[itemName] = { name: itemName, quantity: 0, orders: 0 }
        }
        itemSummary[itemName].quantity += detail.quantity
        itemSummary[itemName].orders += 1
      })
    })

    // Generate CSV
    const csvRows = [
      ['备餐清单', selectedDate || '所有日期'].join(','),
      [''],
      ['菜品名称', '总数量', '订单数'].join(','),
      ...Object.values(itemSummary).map(item => 
        [item.name, item.quantity, item.orders].join(',')
      ),
      [''],
      ['总订单数', filteredOrders.length].join(',')
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `备餐清单_${selectedDate || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    })
  }

  const getTotalItems = (order: OrderWithDetails) => {
    return order.order_details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0
  }

  const handleOpenStatusDialog = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setNewFulfillmentStatus(order.fulfillment_status)
    setStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          fulfillmentStatus: newFulfillmentStatus
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success('Order status updated successfully!')
      setStatusDialogOpen(false)
      fetchOrders() // Refresh orders list

    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Paid
          </span>
        )
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </span>
        )
      case 'pending_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Truck className="h-3 w-3" />
            Pending
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterAndSortOrders()
  }, [orders, selectedDate, searchTerm, sortOrder])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-600">加载订单中...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-600 mt-1">查看和管理所有订单，导出备餐清单</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">选择日期</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">搜索客户</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="邮箱或姓名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">排序</label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortOrder === 'asc' ? '日期升序' : '日期降序'}
              </Button>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">&nbsp;</label>
              <Button
                onClick={handleExport}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={filteredOrders.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                导出备餐清单
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">筛选订单数</p>
                <p className="text-2xl font-bold mt-1">{filteredOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总订单数</p>
                <p className="text-2xl font-bold mt-1">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">选择日期</p>
                <p className="text-lg font-semibold mt-1">
                  {selectedDate ? formatDate(selectedDate) : '所有日期'}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">没有找到订单</p>
            <p className="text-sm text-gray-400 mt-2">尝试调整筛选条件</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {order.users?.email || '未知用户'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.users?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">订单日期</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(order.order_date)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">订单详情：</p>
                      {order.order_details?.map((detail, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {detail.menu_items?.name || '未知菜品'} ({detail.portion_type})
                          </span>
                          <span className="font-medium text-gray-900">
                            x {detail.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="text-gray-600">
                        总菜品数：<span className="font-semibold text-gray-900">{getTotalItems(order)}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {getFulfillmentBadge(order.fulfillment_status)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleOpenStatusDialog(order)}
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Update Order Status</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update the payment and fulfillment status for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Payment Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fulfillment Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Fulfillment Status</label>
              <Select value={newFulfillmentStatus} onValueChange={setNewFulfillmentStatus}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="pending_delivery">Pending Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Info */}
            {selectedOrder && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-700">
                  <strong>Order Date:</strong> {formatDate(selectedOrder.order_date)}
                </p>
                <p className="text-gray-700">
                  <strong>Customer:</strong> {selectedOrder.users?.email}
                </p>
                <p className="text-gray-700">
                  <strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={updating}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
