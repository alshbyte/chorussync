export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-4 animate-pulse">
      <div className="h-6 w-40 rounded-lg bg-muted" />
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
