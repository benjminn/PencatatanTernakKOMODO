import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TernakFormClient from '@/components/ternak/TernakFormClient'
import TernakFormAdmin from '@/components/admin/TernakFormAdmin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tambah Ternak' }

export default async function TambahTernakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  
  const isAdmin = me && (me.role === 'admin' || me.role === 'superadmin')

  const { data: jenisList } = await supabase
    .from('master_jenis_ternak')
    .select('*')
    .eq('is_active', true)
    .order('nama_jenis')

  const { data: pemilikList } = await supabase
    .from('pemilik')
    .select('*')
    .eq('role', 'peternak')
    .order('nama_lengkap')

  return (
    <div className={`${isAdmin ? 'max-w-7xl' : 'max-w-4xl'} pb-8 w-full`}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ternak" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Tambah Ternak</h1>
          <p className="page-subtitle">Daftarkan hewan ternak baru ke dalam sistem</p>
        </div>
      </div>

      <div className={isAdmin ? "" : "card"}>
        {isAdmin ? (
          <TernakFormAdmin jenisList={jenisList ?? []} pemilikList={pemilikList ?? []} />
        ) : (
          <TernakFormClient jenisList={jenisList ?? []} mode="tambah" />
        )}
      </div>
    </div>
  )
}
