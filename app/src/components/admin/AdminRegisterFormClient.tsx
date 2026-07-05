'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminRegisterPeternak } from '@/lib/actions/auth.actions'
import { KECAMATAN_LIST, getDesaByKecamatan } from '@/lib/wilayah'
import { Loader2, UserPlus, CheckCircle } from 'lucide-react'

export default function AdminRegisterFormClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [kecamatan, setKecamatan] = useState('')
  const desaList = getDesaByKecamatan(kecamatan)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await adminRegisterPeternak(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/admin/peternak'), 1500)
      }
    })
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-bold text-gray-900">
          Peternak berhasil didaftarkan!
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Mengalihkan ke halaman daftar peternak...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="admin-nik" className="form-label">NIK <span className="text-red-500">*</span></label>
          <input
            id="admin-nik" name="nik" type="text" inputMode="numeric" maxLength={16}
            placeholder="16 digit NIK" className="form-input font-mono" required disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="admin-nama" className="form-label">Nama Lengkap <span className="text-red-500">*</span></label>
          <input
            id="admin-nama" name="nama_lengkap" type="text"
            placeholder="Nama sesuai KTP" className="form-input" required disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="admin-kec" className="form-label">Kecamatan <span className="text-red-500">*</span></label>
          <select
            id="admin-kec" name="alamat_kec" className="form-input" required disabled={isPending}
            value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}
          >
            <option value="">Pilih kecamatan...</option>
            {KECAMATAN_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="admin-desa" className="form-label">Desa <span className="text-red-500">*</span></label>
          <select
            id="admin-desa" name="alamat_desa" className="form-input" required disabled={!kecamatan || isPending}
          >
            <option value="">{kecamatan ? 'Pilih desa...' : 'Pilih kecamatan dulu'}</option>
            {desaList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="admin-detail" className="form-label">Detail Alamat <span className="text-red-500">*</span></label>
        <input
          id="admin-detail" name="alamat_detail" type="text"
          placeholder="RT/RW, Kampung, dll." className="form-input" required disabled={isPending}
        />
      </div>

      <hr className="border-t border-gray-200" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="admin-password" className="form-label">Password <span className="text-red-500">*</span></label>
          <input
            id="admin-password" name="password" type="password"
            placeholder="Minimal 6 karakter" className="form-input" required minLength={6} disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="admin-confirm" className="form-label">Konfirmasi Password <span className="text-red-500">*</span></label>
          <input
            id="admin-confirm" name="confirm_password" type="password"
            placeholder="Ulangi password" className="form-input" required minLength={6} disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={() => router.back()} className="btn btn-ghost w-full sm:w-auto" disabled={isPending}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary w-full sm:w-auto sm:flex-1" disabled={isPending}>
          {isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Mendaftarkan...</>
          ) : (
            <><UserPlus size={16} /> Daftarkan Peternak</>
          )}
        </button>
      </div>
    </form>
  )
}
