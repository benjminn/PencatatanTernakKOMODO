'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { hapusPeternak } from '@/lib/actions/admin.actions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface DeletePeternakButtonProps {
  peternakId: string
  namaPeternak: string
}

export default function DeletePeternakButton({ peternakId, namaPeternak }: DeletePeternakButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      await hapusPeternak(peternakId)
      setShowConfirm(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-danger btn-sm"
        title={`Hapus ${namaPeternak} beserta semua ternaknya`}
      >
        <Trash2 size={13} />
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title={`Hapus Peternak: ${namaPeternak}`}
        description={`Apakah Anda yakin ingin menghapus peternak ${namaPeternak}? Seluruh data ternak miliknya (hidup, mati, dijual) juga akan ikut terhapus secara permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isPending={isPending}
        confirmText="Hapus Peternak"
      />
    </>
  )
}
