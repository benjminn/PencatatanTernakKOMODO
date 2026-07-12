import { SkeletonTable } from '@/components/ui/SkeletonLoader'

export default function KelolaAdminLoading() {
  return (
    <div className="space-y-6 max-w-full pb-8">
      <div className="page-header animate-pulse">
        <div>
          <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
      </div>

      {/* Danger Zone skeleton */}
      <div className="rounded-xl p-4 border border-red-200 bg-red-50 animate-pulse">
        <div className="h-5 bg-red-200 rounded w-52 mb-2" />
        <div className="h-3 bg-red-100 rounded w-full" />
      </div>

      {/* Filter bar skeleton */}
      <div className="card animate-pulse" style={{ padding: '0.75rem' }}>
        <div className="h-10 bg-gray-100 rounded-lg w-full" />
      </div>

      <SkeletonTable rows={6} cols={5} />
    </div>
  )
}
