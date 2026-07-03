'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { useCallback } from 'react'

interface TernakFilterBarProps {
  isAdmin: boolean
  jenisList: string[]
  currentParams: {
    search?: string
    desa?: string
    jenis?: string
    status?: string
  }
}

export default function TernakFilterBar({
  isAdmin,
  jenisList,
  currentParams,
}: TernakFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams()
      if (currentParams.search) params.set('search', currentParams.search)
      if (currentParams.desa) params.set('desa', currentParams.desa)
      if (currentParams.jenis) params.set('jenis', currentParams.jenis)
      if (currentParams.status) params.set('status', currentParams.status)

      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, currentParams]
  )

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border"
      style={{
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-bg-border)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          placeholder={isAdmin ? 'Cari eartag, NIK, atau nama...' : 'Cari no. eartag...'}
          className="form-input pl-9"
          defaultValue={currentParams.search || ''}
          onChange={(e) => {
            const val = e.target.value
            const timer = setTimeout(() => updateParams('search', val), 500)
            return () => clearTimeout(timer)
          }}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* Filter by jenis */}
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={currentParams.jenis || ''}
          onChange={(e) => updateParams('jenis', e.target.value)}
        >
          <option value="">Semua Jenis</option>
          {jenisList.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        {/* Filter by desa (admin only) */}
        {isAdmin && (
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={currentParams.desa || ''}
            onChange={(e) => updateParams('desa', e.target.value)}
          >
            <option value="">Semua Desa</option>
            <option value="Golo Mori">Golo Mori</option>
            <option value="Warloka">Warloka</option>
          </select>
        )}

        {/* Filter by status */}
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={currentParams.status || ''}
          onChange={(e) => updateParams('status', e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="hidup">Hidup</option>
          <option value="mati">Mati</option>
        </select>
      </div>
    </div>
  )
}
