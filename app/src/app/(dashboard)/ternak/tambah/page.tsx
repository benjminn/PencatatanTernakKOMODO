import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TernakFormClient from '@/components/ternak/TernakFormClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tambah Ternak' }

export default async function TambahTernakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jenisList } = await supabase
    .from('master_jenis_ternak')
    .select('*')
    .eq('is_active', true)
    .order('nama_jenis')

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ternak" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Tambah Ternak</h1>
          <p className="page-subtitle">Daftarkan hewan ternak baru ke dalam sistem</p>
        </div>
      </div>

      <div className="card">
        <TernakFormClient jenisList={jenisList ?? []} mode="tambah" />
      </div>
    </div>
  )
}
