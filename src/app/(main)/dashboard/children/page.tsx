'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import type { Child } from '@/types/database'

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    class_info: '',
    birthday: '',
  })
  const supabase = createClient()

  const fetchChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('获取孩子列表失败')
    } else {
      setChildren(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingChild) {
      // Update existing child
      const { error } = await supabase
        .from('children')
        .update({
          name: formData.name,
          class_info: formData.class_info || null,
          birthday: formData.birthday || null,
        })
        .eq('id', editingChild.id)

      if (error) {
        toast.error('更新失败')
      } else {
        toast.success('更新成功')
        fetchChildren()
      }
    } else {
      // Create new child
      const { error } = await supabase
        .from('children')
        .insert({
          parent_id: user.id,
          name: formData.name,
          class_info: formData.class_info || null,
          birthday: formData.birthday || null,
        })

      if (error) {
        toast.error('添加失败')
      } else {
        toast.success('添加成功')
        fetchChildren()
      }
    }

    setDialogOpen(false)
    setEditingChild(null)
    setFormData({ name: '', class_info: '', birthday: '' })
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      class_info: child.class_info || '',
      birthday: child.birthday || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (childId: string) => {
    if (!confirm('确定要删除这个孩子吗？')) return

    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId)

    if (error) {
      toast.error('删除失败')
    } else {
      toast.success('删除成功')
      fetchChildren()
    }
  }

  const openAddDialog = () => {
    setEditingChild(null)
    setFormData({ name: '', class_info: '', birthday: '' })
    setDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="space-y-6 md:ml-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">孩子管理</h1>
          <p className="text-slate-400">添加和管理您的孩子信息</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openAddDialog}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              + 添加孩子
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-slate-100">
                  {editingChild ? '编辑孩子信息' : '添加新孩子'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingChild ? '更新孩子的基本信息' : '填写孩子的基本信息以开始订餐'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="孩子的姓名"
                    required
                    className="bg-slate-700/50 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_info" className="text-slate-200">班级</Label>
                  <Input
                    id="class_info"
                    value={formData.class_info}
                    onChange={(e) => setFormData({ ...formData, class_info: e.target.value })}
                    placeholder="例如: Grade 3, Class A"
                    className="bg-slate-700/50 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-slate-200">生日</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-slate-100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="border-slate-600 text-slate-200"
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {editingChild ? '保存' : '添加'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : children.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">👶</span>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">还没有添加孩子</h3>
            <p className="text-slate-400 mb-4">添加您的孩子以开始订餐</p>
            <Button 
              onClick={openAddDialog}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              + 添加第一个孩子
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {children.map((child) => (
              <Card key={child.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className={`${getAvatarColor(child.name)} text-white text-lg`}>
                      {getInitials(child.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-100">{child.name}</h3>
                    {child.class_info && (
                      <p className="text-sm text-slate-400">{child.class_info}</p>
                    )}
                    {child.birthday && (
                      <p className="text-sm text-slate-500">🎂 {child.birthday}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEdit(child)}
                      className="text-slate-400 hover:text-slate-100"
                    >
                      编辑
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDelete(child.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block bg-slate-800/50 border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">孩子</TableHead>
                  <TableHead className="text-slate-300">班级</TableHead>
                  <TableHead className="text-slate-300">生日</TableHead>
                  <TableHead className="text-slate-300 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={`${getAvatarColor(child.name)} text-white`}>
                            {getInitials(child.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-100">{child.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{child.class_info || '-'}</TableCell>
                    <TableCell className="text-slate-300">{child.birthday || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEdit(child)}
                        className="text-slate-400 hover:text-slate-100"
                      >
                        编辑
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(child.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        删除
                      </Button>
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
