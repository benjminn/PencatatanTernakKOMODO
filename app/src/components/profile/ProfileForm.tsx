'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/profile.actions'
import { KECAMATAN_LIST, getDesaByKecamatan } from '@/lib/wilayah'
import type { Pemilik } from '@/types/database.types'
import { Loader2, Save, CheckCircle } from 'lucide-react'

interface ProfileFormProps {
  pemilik: Pemilik
}

export default function ProfileForm({ pemilik }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [kecamatan, setKecamatan] = useState(pemilik.alamat_kec)

  const desaList = getDesaByKecamatan(kecamatan)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <CheckCircle size={15} />
          Profil berhasil diperbarui!
        </div>
      )}

      {/* NIK */}
      <div>
        <label className="form-label">NIK</label>
        <input type="text" value={pemilik.nik} className="form-input font-mono bg-gray-50" disabled />
        <p className="text-xs text-gray-400 mt-1">NIK tidak dapat diubah</p>
      </div>

      {/* Nama */}
      <div>
        <label htmlFor="nama_lengkap" className="form-label">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          id="nama_lengkap" name="nama_lengkap" type="text"
          defaultValue={pemilik.nama_lengkap}
          placeholder="Nama sesuai KTP"
          className="form-input" required disabled={isPending}
        />
      </div>

      {/* Kecamatan & Desa in row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="alamat_kec" className="form-label">
            Kecamatan <span className="text-red-500">*</span>
          </label>
          <select
            id="alamat_kec" name="alamat_kec" className="form-input"
            required disabled={isPending}
            value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}
          >
            <option value="">Pilih kecamatan...</option>
            {KECAMATAN_LIST.map((kec) => (<option key={kec} value={kec}>{kec}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="alamat_desa" className="form-label">
            Desa <span className="text-red-500">*</span>
          </label>
          <select
            id="alamat_desa" name="alamat_desa" className="form-input"
            required disabled={!kecamatan || isPending}
            defaultValue={pemilik.alamat_desa}
          >
            <option value="">{kecamatan ? 'Pilih desa...' : 'Pilih kecamatan dulu'}</option>
            {desaList.map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>
      </div>

      {/* Detail Alamat */}
      <div>
        <label htmlFor="alamat_detail" className="form-label">
          Detail Alamat <span className="text-red-500">*</span>
        </label>
        <input
          id="alamat_detail" name="alamat_detail" type="text"
          defaultValue={pemilik.alamat_detail}
          placeholder="RT/RW, Kampung, dll."
          className="form-input" required disabled={isPending}
        />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
        ) : (
          <><Save size={16} /> Simpan Perubahan</>
        )}
      </button>
    </form>
  )
}
