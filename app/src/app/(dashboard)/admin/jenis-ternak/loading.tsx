export default function JenisTernakLoading() {
  return (
    <div className="space-y-6 max-w-full pb-8 animate-pulse">
      <div className="page-header">
        <div>
          <div className="h-7 bg-gray-200 rounded w-44 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="h-5 bg-gray-200 rounded w-24" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-100 rounded-lg w-16" />
                <div className="h-8 bg-gray-100 rounded-lg w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
