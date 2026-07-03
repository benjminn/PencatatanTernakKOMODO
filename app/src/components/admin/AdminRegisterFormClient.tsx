'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminRegisterPeternak } from '@/lib/actions/auth.actions'
import { KECAMATAN_LIST, getDesaByKecamatan } from '@/lib/wilayah'
import { Loader2, UserPlus } from 'lucide-react'

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
      <div className="text-center py-8">
        <div className="text-5xl mb-3">✅</div>
        <p className="font-semibold" style={{ color: 'var(--color-hidup)' }}>
          Peternak berhasil didaftarkan!
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Mengalihkan ke halaman daftar peternak...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--color-mati)' }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="admin-nik" className="form-label">NIK *</label>
        <input id="admin-nik" name="nik" type="text" inputMode="numeric" maxLength={16}
          placeholder="16 digit NIK" className="form-input" required disabled={isPending} />
      </div>

      <div>
        <label htmlFor="admin-nama" className="form-label">Nama Lengkap *</label>
        <input id="admin-nama" name="nama_lengkap" type="text"
          placeholder="Nama sesuai KTP" className="form-input" required disabled={isPending} />
      </div>

      <div>
        <label htmlFor="admin-kec" className="form-label">Kecamatan *</label>
        <select id="admin-kec" name="alamat_kec" className="form-input" required disabled={isPending}
          value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}>
          <option value="">Pilih kecamatan...</option>
          {KECAMATAN_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="admin-desa" className="form-label">Desa *</label>
        <select id="admin-desa" name="alamat_desa" className="form-input" required
          disabled={!kecamatan || isPending}>
          <option value="">{kecamatan ? 'Pilih desa...' : 'Pilih kecamatan dulu'}</option>
          {desaList.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="admin-detail" className="form-label">Detail Alamat *</label>
        <input id="admin-detail" name="alamat_detail" type="text"
          placeholder="RT/RW, Kampung, dll." className="form-input" required disabled={isPending} />
      </div>

      <hr className="divider" />

      <div>
        <label htmlFor="admin-password" className="form-label">Password *</label>
        <input id="admin-password" name="password" type="password"
          placeholder="Minimal 6 karakter" className="form-input" required minLength={6} disabled={isPending} />
      </div>

      <div>
        <label htmlFor="admin-confirm" className="form-label">Konfirmasi Password *</label>
        <input id="admin-confirm" name="confirm_password" type="password"
          placeholder="Ulangi password" className="form-input" required minLength={6} disabled={isPending} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn btn-ghost flex-1" disabled={isPending}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={isPending}>
          {isPending ? <><Loader2 size={16} className="animate-spin" /> Mendaftarkan...</> : <><UserPlus size={16} /> Daftarkan Peternak</>}
        </button>
      </div>
    </form>
  )
}
