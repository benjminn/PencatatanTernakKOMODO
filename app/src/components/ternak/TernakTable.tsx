'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Edit2 } from 'lucide-react'
import type { TernakLengkap } from '@/types/database.types'
import { formatDateShort, formatWeight } from '@/lib/utils'

interface TernakTableProps {
  data: TernakLengkap[]
  isAdmin: boolean
}

const STATUS_CONFIG = {
  hidup: { label: 'Hidup', className: 'badge-hidup', dot: '#22c55e' },
  mati: { label: 'Mati', className: 'badge-mati', dot: '#ef4444' },
  dijual: { label: 'Dijual', className: 'badge-dijual', dot: '#f59e0b' },
}

export default function TernakTable({ data, isAdmin }: TernakTableProps) {
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
              <th>Penanda</th>
              <th>Jenis</th>
              <th>Kelamin</th>
              <th>Umur</th>
              <th>Berat</th>
              {isAdmin && <th>Pemilik</th>}
              {isAdmin && <th>Desa</th>}
              <th>Status</th>
              <th>Diperbarui</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => {
              const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.hidup
              const inactive = t.status === 'mati' || t.status === 'dijual'
              return (
                <tr key={t.id} className={inactive ? (t.status === 'mati' ? 'row-mati' : 'row-dijual') : ''}>
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
                  <td>{t.jenis_kelamin}</td>
                  <td className="text-gray-600">{t.umur || '—'}</td>
                  <td className="text-gray-600">{formatWeight(t.berat_badan)}</td>
                  {isAdmin && (
                    <td>
                      <div>
                        <p className="font-medium text-sm">{t.nama_lengkap}</p>
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
                    <Link href={`/ternak/${t.id}/edit`} className="btn btn-ghost btn-sm">
                      <Edit2 size={13} /> Edit
                    </Link>
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
            <Link
              key={t.id}
              href={`/ternak/${t.id}/edit`}
              className="mobile-card block hover:border-green-300 transition-colors"
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
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Kelamin</p>
                  <p className="text-gray-700">{t.jenis_kelamin}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Umur</p>
                  <p className="text-gray-700">{t.umur || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Berat</p>
                  <p className="text-gray-700">{formatWeight(t.berat_badan)}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-2 pt-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <span className="text-gray-500">{t.nama_lengkap} · {t.alamat_desa}</span>
                  <span className="text-gray-400">{formatDateShort(t.updated_at)}</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}
