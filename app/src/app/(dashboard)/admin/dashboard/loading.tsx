import { SkeletonCard, SkeletonList } from '@/components/ui/SkeletonLoader'

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 max-w-full pb-8">
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-80" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-8 space-y-8">
          {/* Stats */}
          <section>
            <div className="h-3 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </section>

          {/* Peternak Overview */}
          <section>
            <div className="animate-pulse mb-4">
              <div className="h-5 bg-gray-200 rounded w-56 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-72" />
            </div>
            <SkeletonList items={4} />
          </section>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 space-y-8">
          <section>
            <div className="h-3 bg-gray-200 rounded w-28 mb-4 animate-pulse" />
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </section>
          <section>
            <div className="h-3 bg-gray-200 rounded w-36 mb-4 animate-pulse" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-64 animate-pulse" />
          </section>
        </div>
      </div>
    </div>
  )
}
