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
  params: Promise<{ eartag: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { eartag } = await params
  const decodedEartag = decodeURIComponent(eartag)

  const { data: ternak } = await supabase
    .from('ternak')
    .select('*, master_jenis_ternak(*)')
    .eq('no_eartag', decodedEartag)
    .single()

  if (!ternak) notFound()

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
          <h1 className="page-title">Edit Ternak</h1>
          <p className="page-subtitle font-mono text-sm">
            Eartag: {decodedEartag}
          </p>
        </div>
      </div>

      <div className="card">
        <TernakFormClient
          jenisList={jenisList ?? []}
          mode="edit"
          initialData={{
            no_eartag: ternak.no_eartag,
            id_jenis: ternak.id_jenis,
            jenis_kelamin: ternak.jenis_kelamin,
            umur: ternak.umur,
            berat_badan: ternak.berat_badan,
            status_hidup: ternak.status_hidup,
          }}
        />
      </div>
    </div>
  )
}
