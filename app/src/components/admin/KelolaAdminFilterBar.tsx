'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useCallback } from 'react'

interface KelolaAdminFilterBarProps {
  currentParams: {
    search?: string
  }
}

export default function KelolaAdminFilterBar({ currentParams }: KelolaAdminFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams()
      if (currentParams.search) params.set('search', currentParams.search)
      if (value) { params.set(key, value) } else { params.delete(key) }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, currentParams]
  )

  const resetFilter = () => {
    router.push(pathname)
  }

  return (
    <div className="card" style={{ padding: '0.75rem' }}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pengguna atau NIK..."
            className="form-input pl-9 text-sm"
            defaultValue={currentParams.search || ''}
            onChange={(e) => {
              const val = e.target.value
              const timer = setTimeout(() => updateParams('search', val), 400)
              return () => clearTimeout(timer)
            }}
          />
        </div>
        {currentParams.search && (
          <button
            onClick={resetFilter}
            className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600 flex items-center gap-1 px-2"
          >
            <X size={15} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}
