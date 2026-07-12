import { SkeletonTable } from '@/components/ui/SkeletonLoader'

export default function TernakLoading() {
  return (
    <div className="space-y-4 max-w-full pb-8">
      <div className="page-header animate-pulse">
        <div>
          <div className="h-7 bg-gray-200 rounded w-36 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-44" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-36" />
      </div>

      <div className="card animate-pulse" style={{ padding: '0.75rem' }}>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-10 bg-gray-100 rounded-lg w-28" />
            <div className="h-10 bg-gray-100 rounded-lg w-28" />
          </div>
        </div>
      </div>

      <SkeletonTable rows={6} cols={7} />
    </div>
  )
}
