'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { tambahTernak, updateTernak } from '@/lib/actions/ternak.actions'
import type { JenisTernak } from '@/types/database.types'
import { Loader2, Save } from 'lucide-react'

interface TernakFormClientProps {
  jenisList: JenisTernak[]
  mode: 'tambah' | 'edit'
  initialData?: {
    no_eartag: string
    id_jenis: number
    jenis_kelamin: string
    umur: string | null
    berat_badan: number | null
    status_hidup: boolean
  }
}

export default function TernakFormClient({
  jenisList,
  mode,
  initialData,
}: TernakFormClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedJenis, setSelectedJenis] = useState<JenisTernak | null>(
    initialData
      ? jenisList.find((j) => j.id === initialData.id_jenis) ?? null
      : null
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let result
      if (mode === 'tambah') {
        result = await tambahTernak(formData)
      } else {
        result = await updateTernak(initialData!.no_eartag, formData)
      }

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/ternak')
      }
    })
  }

  const opsiKelamin = selectedJenis?.opsi_kelamin ?? []

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: 'var(--color-mati)',
          }}
        >
          {error}
        </div>
      )}

      {/* No. Eartag */}
      <div>
        <label htmlFor="no_eartag" className="form-label">
          No. Eartag <span style={{ color: 'var(--color-mati)' }}>*</span>
        </label>
        <input
          id="no_eartag"
          name="no_eartag"
          type="text"
          placeholder="Contoh: KRB-001 atau GM-2024-001"
          className="form-input font-mono"
          required
          disabled={mode === 'edit' || isPending}
          defaultValue={initialData?.no_eartag}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
          Harus unik di seluruh sistem. Tidak dapat diubah setelah disimpan.
        </p>
      </div>

      {/* Jenis Hewan */}
      <div>
        <label htmlFor="id_jenis" className="form-label">
          Jenis Hewan <span style={{ color: 'var(--color-mati)' }}>*</span>
        </label>
        <select
          id="id_jenis"
          name="id_jenis"
          className="form-input"
          required
          disabled={isPending}
          defaultValue={initialData?.id_jenis ?? ''}
          onChange={(e) => {
            const jenis = jenisList.find((j) => j.id === parseInt(e.target.value))
            setSelectedJenis(jenis ?? null)
          }}
        >
          <option value="">Pilih jenis hewan...</option>
          {jenisList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama_jenis} ({j.kategori})
            </option>
          ))}
        </select>
      </div>

      {/* Jenis Kelamin */}
      <div>
        <label className="form-label">
          Jenis Kelamin <span style={{ color: 'var(--color-mati)' }}>*</span>
        </label>
        {opsiKelamin.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {opsiKelamin.map((opsi) => (
              <label
                key={opsi}
                className="flex items-center gap-2 cursor-pointer text-sm px-4 py-2 rounded-lg border transition-all"
                style={{ borderColor: 'var(--color-bg-border)', color: 'var(--color-text-secondary)' }}
              >
                <input
                  type="radio"
                  name="jenis_kelamin"
                  value={opsi}
                  defaultChecked={initialData?.jenis_kelamin === opsi}
                  required
                  className="accent-green-600"
                />
                {opsi}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
            Pilih jenis hewan terlebih dahulu
          </p>
        )}
        {/* Hidden input to ensure value submitted */}
        {opsiKelamin.length > 0 && !initialData && (
          <input type="hidden" name="jenis_kelamin" value="" />
        )}
      </div>

      <hr className="divider" />
      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
        Data Opsional
      </p>

      {/* Umur */}
      <div>
        <label htmlFor="umur" className="form-label">
          Umur <span style={{ color: 'var(--color-text-disabled)' }}>(opsional)</span>
        </label>
        <input
          id="umur"
          name="umur"
          type="text"
          placeholder="Contoh: 2 tahun, 8 bulan"
          className="form-input"
          disabled={isPending}
          defaultValue={initialData?.umur ?? ''}
        />
      </div>

      {/* Berat Badan */}
      <div>
        <label htmlFor="berat_badan" className="form-label">
          Berat Badan <span style={{ color: 'var(--color-text-disabled)' }}>(opsional)</span>
        </label>
        <div className="relative">
          <input
            id="berat_badan"
            name="berat_badan"
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            className="form-input pr-10"
            disabled={isPending}
            defaultValue={initialData?.berat_badan ?? ''}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            kg
          </span>
        </div>
      </div>

      {/* Status Hidup (edit only) */}
      {mode === 'edit' && (
        <div>
          <label htmlFor="status_hidup" className="form-label">
            Status
          </label>
          <select
            id="status_hidup"
            name="status_hidup"
            className="form-input"
            disabled={isPending}
            defaultValue={initialData?.status_hidup ? 'true' : 'false'}
          >
            <option value="true">🟢 Hidup</option>
            <option value="false">🔴 Mati</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost flex-1"
          disabled={isPending}
        >
          Batal
        </button>
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={16} />
              {mode === 'tambah' ? 'Tambah Ternak' : 'Simpan Perubahan'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
