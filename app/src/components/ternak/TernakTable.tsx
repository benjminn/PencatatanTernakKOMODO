'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Edit2, Trash2 } from 'lucide-react'
import type { TernakLengkap } from '@/types/database.types'
import { hapusTernak } from '@/lib/actions/ternak.actions'
import { formatDateShort, formatWeight } from '@/lib/utils'
import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import SortableHeader from '@/components/ui/SortableHeader'

interface TernakTableProps {
  data: TernakLengkap[]
  isAdmin: boolean
  hideKelamin?: boolean
  currentPage?: number
  itemsPerPage?: number
}

const STATUS_CONFIG = {
  hidup: { label: 'Hidup', className: 'badge-hidup', dot: '#22c55e' },
  mati: { label: 'Mati', className: 'badge-mati', dot: '#ef4444' },
  dijual: { label: 'Dijual', className: 'badge-dijual', dot: '#f59e0b' },
}
export default function TernakTable({ 
  data, 
  isAdmin, 
  hideKelamin = false,
  currentPage = 1,
  itemsPerPage = 15
}: TernakTableProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    startTransition(async () => {
      await hapusTernak(deleteId)
      setDeleteId(null)
    })
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="w-16 h-16 relative mb-4 opacity-40">
            <Image src="/logo/6311a9ed51648_300x300.webp" alt="Logo" fill className="object-contain" />
          </div>
          <p className="font-semibold text-base text-gray-700">
            Belum ada data ternak
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Tambahkan hewan ternak pertama Anda
          </p>
          <Link href="/ternak/tambah" className="btn btn-primary">
            <span className="text-lg leading-none">+</span> Tambah Ternak
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12 text-center">No.</th>
              <th><SortableHeader label="Penanda" field="identitas_penanda" /></th>
              <th><SortableHeader label="Jenis" field="nama_jenis" /></th>
              <th>Fase</th>
              {!hideKelamin && <th>Kelamin</th>}
              <th>Umur</th>
              <th><SortableHeader label="Berat" field="berat_badan" /></th>
              {isAdmin && <th><SortableHeader label="Pemilik" field="nama_lengkap" /></th>}
              {isAdmin && <th><SortableHeader label="Desa" field="alamat_desa" /></th>}
              <th><SortableHeader label="Status" field="status" /></th>
              <th><SortableHeader label="Diperbarui" field="updated_at" /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((t, i) => {
              const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.hidup
              const inactive = t.status === 'mati' || t.status === 'dijual'
              return (
                <tr key={t.id} className={inactive ? (t.status === 'mati' ? 'row-mati' : 'row-dijual') : ''}>
                  <td className="text-center font-medium text-gray-500">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{t.jenis_penanda}</span>
                      {t.identitas_penanda && (
                        <code className="text-sm font-semibold text-gray-800 bg-transparent p-0">
                          {t.identitas_penanda}
                        </code>
                      )}
                    </div>
                  </td>
                  <td className="font-medium">{t.nama_jenis}</td>
                  <td className="text-gray-600">{t.fase || '—'}</td>
                  {!hideKelamin && <td className="text-gray-600">{t.jenis_kelamin || '—'}</td>}
                  <td className="text-gray-600">{t.umur || '—'}</td>
                  <td className="text-gray-600">{formatWeight(t.berat_badan)}</td>
                  {isAdmin && (
                    <td>
                      <div>
                        <Link href={`/admin/peternak/${t.id_pemilik}`} className="font-medium text-sm text-blue-600 hover:underline">
                          {t.nama_lengkap}
                        </Link>
                        <p className="text-xs text-gray-400 font-mono">{t.nik}</p>
                      </div>
                    </td>
                  )}
                  {isAdmin && <td className="text-gray-600">{t.alamat_desa}</td>}
                  <td>
                    <span className={`badge ${cfg.className}`}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">{formatDateShort(t.updated_at)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/ternak/${t.id}/edit`} className="btn btn-ghost btn-sm">
                        <Edit2 size={13} /> Edit
                      </Link>
                      <button 
                        onClick={() => setDeleteId(t.id)} 
                        className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isPending}
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((t) => {
          const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.hidup
          return (
            <div
              key={t.id}
              className="mobile-card block transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex flex-col mb-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t.jenis_penanda}</span>
                    {t.identitas_penanda && (
                      <code className="text-xs font-semibold text-gray-800">
                        {t.identitas_penanda}
                      </code>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 mt-1">{t.nama_jenis}</p>
                </div>
                <span className={`badge ${cfg.className}`}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.dot }} />
                  {cfg.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mt-3">
                <div>
                  <p className="text-xs text-gray-400">Fase</p>
                  <p className="text-gray-700">{t.fase || '—'}</p>
                </div>
                {!hideKelamin && (
                  <div>
                    <p className="text-xs text-gray-400">Kelamin</p>
                    <p className="text-gray-700">{t.jenis_kelamin || '—'}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Umur</p>
                  <p className="text-gray-700">{t.umur || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Berat</p>
                  <p className="text-gray-700">{formatWeight(t.berat_badan)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #f1f5f9' }}>
                <div className="flex flex-col">
                  {isAdmin && (
                    <>
                      <span className="text-gray-500 mb-1">Pemilik:</span>
                      <Link href={`/admin/peternak/${t.id_pemilik}`} className="font-medium text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                        {t.nama_lengkap}
                      </Link>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-gray-400">{formatDateShort(t.updated_at)}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <Link 
                      href={`/ternak/${t.id}/edit`} 
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 font-semibold"
                    >
                      <Edit2 size={12} /> Edit
                    </Link>
                    <button 
                      onClick={(e) => { e.preventDefault(); setDeleteId(t.id); }} 
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                      disabled={isPending}
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Data Ternak"
        description="Apakah Anda yakin ingin menghapus data ternak ini? Data yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isPending={isPending}
        confirmText="Hapus Ternak"
      />
    </>
  )
}
