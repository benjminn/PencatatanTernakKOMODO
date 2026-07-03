'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'

interface DeletePeternakButtonProps {
  peternakId: string
  namaPeternak: string
}

export default function DeletePeternakButton({ peternakId, namaPeternak }: DeletePeternakButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    // Import dynamically to avoid server/client mismatch
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    startTransition(async () => {
      const { error } = await supabase
        .from('pemilik')
        .delete()
        .eq('id', peternakId)

      if (!error) {
        window.location.reload()
      }
      setShowConfirm(false)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Hapus?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="btn btn-danger btn-sm"
        >
          Ya
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="btn btn-ghost btn-sm"
        >
          Tidak
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn btn-danger btn-sm"
      title={`Hapus ${namaPeternak} beserta semua ternaknya`}
    >
      <Trash2 size={13} />
    </button>
  )
}
