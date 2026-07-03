'use client'

import Link from 'next/link'
import { Edit2, Circle } from 'lucide-react'
import type { TernakLengkap } from '@/types/database.types'
import { formatDateShort, formatWeight } from '@/lib/utils'

interface TernakTableProps {
  data: TernakLengkap[]
  isAdmin: boolean
}

export default function TernakTable({ data, isAdmin }: TernakTableProps) {
  if (data.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon text-5xl">🐄</div>
          <p className="font-medium mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Belum ada data ternak
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            Tambahkan hewan ternak pertama Anda
          </p>
          <Link href="/ternak/tambah" className="btn btn-primary btn-sm mt-4">
            Tambah Sekarang
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>No. Eartag</th>
            <th>Jenis Hewan</th>
            <th>Kelamin</th>
            <th>Umur</th>
            <th>Berat</th>
            {isAdmin && <th>Pemilik</th>}
            {isAdmin && <th>Desa</th>}
            <th>Status</th>
            <th>Update</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((ternak) => (
            <tr
              key={ternak.no_eartag}
              className={!ternak.status_hidup ? 'row-mati' : ''}
            >
              <td>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {ternak.no_eartag}
                </span>
              </td>
              <td>
                <div>
                  <span className="font-medium">{ternak.nama_jenis}</span>
                  <span
                    className="ml-2 text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {ternak.kategori}
                  </span>
                </div>
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }}>
                {ternak.jenis_kelamin}
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }}>
                {ternak.umur || '-'}
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }}>
                {formatWeight(ternak.berat_badan)}
              </td>
              {isAdmin && (
                <td>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {ternak.nama_lengkap}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {ternak.nik}
                    </p>
                  </div>
                </td>
              )}
              {isAdmin && (
                <td style={{ color: 'var(--color-text-secondary)' }}>
                  {ternak.alamat_desa}
                </td>
              )}
              <td>
                <span className={`badge ${ternak.status_hidup ? 'badge-hidup' : 'badge-mati'}`}>
                  <Circle size={6} fill="currentColor" />
                  {ternak.status_hidup ? 'Hidup' : 'Mati'}
                </span>
              </td>
              <td
                className="text-xs whitespace-nowrap"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {formatDateShort(ternak.updated_at)}
              </td>
              <td>
                <Link
                  href={`/ternak/${ternak.no_eartag}/edit`}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit2 size={13} />
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
