import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminRegisterFormClient from '@/components/admin/AdminRegisterFormClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tambah Peternak' }

export default async function TambahPeternakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  return (
    <div className="max-w-2xl pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/peternak" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Tambah Peternak</h1>
          <p className="page-subtitle">Daftarkan akun peternak baru secara manual</p>
        </div>
      </div>
      <div className="card">
        <AdminRegisterFormClient />
      </div>
    </div>
  )
}
