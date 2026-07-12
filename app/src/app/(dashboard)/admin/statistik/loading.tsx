export default function StatistikLoading() {
  return (
    <div className="space-y-6 max-w-full pb-8 animate-pulse">
      <div>
        <div className="h-7 bg-gray-200 rounded w-44 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>

      {/* Filter bar skeleton */}
      <div className="card" style={{ padding: '0.75rem' }}>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-100 rounded-lg w-32" />
          <div className="h-10 bg-gray-100 rounded-lg w-32" />
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-80" />
    </div>
  )
}
