import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  )
}
