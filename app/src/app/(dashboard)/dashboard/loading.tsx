import { SkeletonCard, SkeletonList } from '@/components/ui/SkeletonLoader'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-full pb-8">
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-48" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Ternak List */}
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
      </div>
      <SkeletonList items={3} />
    </div>
  )
}
