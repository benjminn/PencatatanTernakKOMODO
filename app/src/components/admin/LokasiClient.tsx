'use client'

import { useState, useTransition } from 'react'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { tambahDesa, hapusDesa } from '@/lib/actions/wilayah.actions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface LokasiClientProps {
  initialData: { id: string; kecamatan: string; nama_desa: string }[]
}

export default function LokasiClient({ initialData }: LokasiClientProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await tambahDesa(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset()
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await hapusDesa(deleteId)
      if (result?.error) {
        alert(result.error)
      }
      setDeleteId(null)
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Kolom Kiri: Form Tambah */}
      <div className="md:col-span-1">
        <div className="card p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tambah Desa Baru</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Kecamatan</label>
              <input 
                type="text" 
                name="kecamatan" 
                defaultValue="Komodo" 
                className="form-input" 
                required 
                disabled={isPending}
              />
            </div>
            <div>
              <label className="form-label">Nama Desa</label>
              <input 
                type="text" 
                name="nama_desa" 
                placeholder="Misal: Papagarang" 
                className="form-input" 
                required 
                disabled={isPending}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isPending}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Simpan Desa
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Daftar Desa */}
      <div className="md:col-span-2">
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Daftar Wilayah Operasional</h2>
          </div>
          
          {initialData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada data desa. Silakan tambah desa pertama Anda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Kecamatan</th>
                    <th>Nama Desa</th>
                    <th className="w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {initialData.map((desa) => (
                    <tr key={desa.id}>
                      <td className="font-medium text-gray-600">{desa.kecamatan}</td>
                      <td className="font-bold text-gray-900">{desa.nama_desa}</td>
                      <td>
                        <button
                          onClick={() => setDeleteId(desa.id)}
                          className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={isPending}
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Desa"
        description="Apakah Anda yakin ingin menghapus desa ini? Pastikan tidak ada peternak yang terdaftar di desa ini sebelum menghapus."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isPending={isPending}
        confirmText="Hapus Desa"
      />
    </div>
  )
}
