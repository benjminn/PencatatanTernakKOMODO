export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-container animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className="h-3 bg-gray-200 rounded w-20" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j}><div className="h-4 bg-gray-100 rounded w-full" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-56" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="h-7 bg-gray-100 rounded-xl w-20" />
            <div className="h-7 bg-gray-100 rounded-xl w-24" />
            <div className="h-7 bg-gray-100 rounded-xl w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage({ title = '' }: { title?: string }) {
  return (
    <div className="space-y-6 max-w-full pb-8 animate-pulse">
      <div>
        <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
        {title && <div className="h-4 bg-gray-100 rounded w-72" />}
      </div>
    </div>
  )
}
