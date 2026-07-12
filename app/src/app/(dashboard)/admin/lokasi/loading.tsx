export default function LokasiLoading() {
  return (
    <div className="space-y-6 max-w-full pb-8 animate-pulse">
      <div className="page-header">
        <div>
          <div className="h-7 bg-gray-200 rounded w-36 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-52" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-36" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div>
                  <div className="h-5 bg-gray-200 rounded w-28 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-40" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-100 rounded-lg w-16" />
                <div className="h-8 bg-gray-100 rounded-lg w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
