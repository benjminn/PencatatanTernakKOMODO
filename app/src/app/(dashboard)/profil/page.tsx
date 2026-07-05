import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import { ArrowLeft, User, Hash, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profil Saya' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!pemilik) redirect('/login')

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-subtitle">Kelola informasi akun Anda</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-green-100 text-green-800 shrink-0">
            {pemilik.nama_lengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {pemilik.nama_lengkap}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Hash size={14} className="text-gray-400" />
              <span className="font-mono">{pemilik.nik}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
              <MapPin size={14} className="text-gray-400" />
              Desa {pemilik.alamat_desa}, Kec. {pemilik.alamat_kec}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
              <Calendar size={14} className="text-gray-400" />
              Bergabung {formatDate(pemilik.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card">
        <h3 className="font-bold text-base text-gray-900 mb-4">
          ✏️ Edit Profil
        </h3>
        <ProfileForm pemilik={pemilik} />
      </div>
    </div>
  )
}
