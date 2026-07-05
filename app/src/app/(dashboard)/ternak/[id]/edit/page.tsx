import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TernakFormClient from '@/components/ternak/TernakFormClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Ternak' }

export default async function EditTernakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: ternak } = await supabase
    .from('ternak')
    .select('*, master_jenis_ternak(*)')
    .eq('id', id)
    .single()

  if (!ternak) notFound()

  const { data: jenisList } = await supabase
    .from('master_jenis_ternak')
    .select('*')
    .eq('is_active', true)
    .order('nama_jenis')

  return (
    <div className="max-w-4xl pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ternak" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Edit Ternak</h1>
          <p className="page-subtitle font-mono text-sm">
            ID: {id.split('-')[0]}...
          </p>
        </div>
      </div>

      <div className="card">
        <TernakFormClient
          jenisList={jenisList ?? []}
          mode="edit"
          initialData={{
            id: ternak.id,
            jenis_penanda: ternak.jenis_penanda,
            identitas_penanda: ternak.identitas_penanda,
            id_jenis: ternak.id_jenis,
            fase: ternak.fase,
            jenis_kelamin: ternak.jenis_kelamin,
            tanggal_lahir: ternak.tanggal_lahir,
            berat_badan: ternak.berat_badan,
            status: ternak.status,
          }}
        />
      </div>
    </div>
  )
}
