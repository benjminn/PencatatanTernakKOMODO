'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { useCallback } from 'react'

interface JenisItem {
  id: number
  nama_jenis: string
}

interface TernakFilterBarProps {
  isAdmin: boolean
  jenisList: JenisItem[]
  currentParams: {
    search?: string
    desa?: string
    jenis?: string
    status?: string
  }
}

export default function TernakFilterBar({ isAdmin, jenisList, currentParams }: TernakFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams()
      if (currentParams.search) params.set('search', currentParams.search)
      if (currentParams.desa) params.set('desa', currentParams.desa)
      if (currentParams.jenis) params.set('jenis', currentParams.jenis)
      if (currentParams.status) params.set('status', currentParams.status)
      if (value) { params.set(key, value) } else { params.delete(key) }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, currentParams]
  )

  return (
    <div className="card" style={{ padding: '0.75rem' }}>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isAdmin ? 'Cari eartag, NIK, atau nama...' : 'Cari no. eartag...'}
            className="form-input pl-9 text-sm"
            defaultValue={currentParams.search || ''}
            onChange={(e) => {
              const val = e.target.value
              const timer = setTimeout(() => updateParams('search', val), 400)
              return () => clearTimeout(timer)
            }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            className="form-input text-sm"
            style={{ width: 'auto', minWidth: '120px' }}
            value={currentParams.jenis || ''}
            onChange={(e) => updateParams('jenis', e.target.value)}
          >
            <option value="">Semua Jenis</option>
            {jenisList.map((j) => (
              <option key={j.id} value={j.nama_jenis}>{j.nama_jenis}</option>
            ))}
          </select>

          {isAdmin && (
            <select
              className="form-input text-sm"
              style={{ width: 'auto', minWidth: '120px' }}
              value={currentParams.desa || ''}
              onChange={(e) => updateParams('desa', e.target.value)}
            >
              <option value="">Semua Desa</option>
              <option value="Golo Mori">Golo Mori</option>
              <option value="Warloka">Warloka</option>
            </select>
          )}

          <select
            className="form-input text-sm"
            style={{ width: 'auto', minWidth: '120px' }}
            value={currentParams.status || ''}
            onChange={(e) => updateParams('status', e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="hidup">Hidup</option>
            <option value="mati">Mati</option>
            <option value="dijual">Dijual</option>
          </select>
        </div>
      </div>
    </div>
  )
}
