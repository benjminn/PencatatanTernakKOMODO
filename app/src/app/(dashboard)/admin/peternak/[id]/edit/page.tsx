import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminPeternakFormClient from '@/components/admin/AdminPeternakFormClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Peternak' }

export default async function EditPeternakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  const { data: peternak } = await supabase
    .from('pemilik').select('*').eq('id', id).single()

  if (!peternak) redirect('/admin/peternak')

  return (
    <div className="max-w-4xl pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/peternak/${id}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Edit Profil Peternak</h1>
          <p className="page-subtitle">Perbarui data identitas dan alamat peternak</p>
        </div>
      </div>

      <div className="card p-6">
        <AdminPeternakFormClient initialData={peternak} />
      </div>
    </div>
  )
}
