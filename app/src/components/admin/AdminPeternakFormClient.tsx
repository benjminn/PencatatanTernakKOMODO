'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePeternakAsAdmin } from '@/lib/actions/admin.actions'
import { Loader2, Save } from 'lucide-react'
import type { Pemilik } from '@/types/database.types'

interface AdminPeternakFormClientProps {
  initialData: Pemilik
}

export default function AdminPeternakFormClient({ initialData }: AdminPeternakFormClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updatePeternakAsAdmin(initialData.id, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push(`/admin/peternak/${initialData.id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nik" className="form-label">NIK (Nomor Induk Kependudukan)</label>
          <input
            id="nik" name="nik" type="text"
            className="form-input"
            defaultValue={initialData.nik}
            required minLength={16} maxLength={16}
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="nama_lengkap" className="form-label">Nama Lengkap</label>
          <input
            id="nama_lengkap" name="nama_lengkap" type="text"
            className="form-input"
            defaultValue={initialData.nama_lengkap}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="alamat_kec" className="form-label">Kecamatan</label>
          <input
            id="alamat_kec" name="alamat_kec" type="text"
            className="form-input"
            defaultValue={initialData.alamat_kec || 'Komodo'}
            required
            disabled={isPending}
          />
        </div>
        
        <div>
          <label htmlFor="alamat_desa" className="form-label">Desa</label>
          <input
            id="alamat_desa" name="alamat_desa" type="text"
            className="form-input"
            defaultValue={initialData.alamat_desa}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label htmlFor="alamat_detail" className="form-label">Detail Alamat</label>
        <textarea
          id="alamat_detail" name="alamat_detail" rows={3}
          className="form-input resize-none"
          defaultValue={initialData.alamat_detail}
          required
          disabled={isPending}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="btn btn-primary px-8 shadow-md" disabled={isPending}>
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
          ) : (
            <><Save size={18} /> Simpan Perubahan</>
          )}
        </button>
      </div>
    </form>
  )
}
