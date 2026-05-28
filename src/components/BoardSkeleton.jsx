function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="flex gap-1 mb-2">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
        <div className="h-4 bg-gray-100 rounded w-10" />
        <div className="h-3 bg-gray-100 rounded w-16 ml-auto" />
      </div>
    </div>
  )
}

function ColumnSkeleton({ cards = 3 }) {
  return (
    <div className="w-[260px] min-w-[260px] flex flex-col">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <div className="h-3.5 bg-gray-200 rounded w-24" />
        <div className="ml-auto h-4 w-6 bg-gray-100 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-2 bg-white shadow-sm">
        {Array.from({ length: cards }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}

export default function BoardSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden animate-pulse">
      {/* TopBar skeleton */}
      <div className="h-12 bg-white border-b border-gray-200 shrink-0" />
      {/* FilterBar skeleton */}
      <div className="h-10 bg-white border-b border-gray-100 shrink-0" />
      {/* Board skeleton */}
      <div className="flex gap-4 p-5 overflow-hidden">
        <ColumnSkeleton cards={3} />
        <ColumnSkeleton cards={2} />
        <ColumnSkeleton cards={4} />
        <ColumnSkeleton cards={1} />
      </div>
    </div>
  )
}
