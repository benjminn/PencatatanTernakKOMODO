'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface SortableHeaderProps {
  label: string
  field: string
}

export default function SortableHeader({ label, field }: SortableHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSortField = searchParams.get('sortField')
  const currentSortOrder = searchParams.get('sortOrder')

  const isSorted = currentSortField === field

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (isSorted) {
      if (currentSortOrder === 'asc') {
        params.set('sortOrder', 'desc')
      } else {
        params.delete('sortField')
        params.delete('sortOrder')
      }
    } else {
      params.set('sortField', field)
      params.set('sortOrder', 'asc')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button 
      onClick={toggleSort}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none"
    >
      {label}
      {isSorted ? (
        currentSortOrder === 'asc' ? <ArrowUp size={14} className="text-blue-600" /> : <ArrowDown size={14} className="text-blue-600" />
      ) : (
        <ArrowUpDown size={14} className="text-gray-400 opacity-50 hover:opacity-100" />
      )}
    </button>
  )
}
