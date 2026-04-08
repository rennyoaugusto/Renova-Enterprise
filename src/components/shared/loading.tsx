type LoadingProps = {
  label?: string
  rows?: number
}

export function Loading({ label = "Carregando...", rows = 3 }: LoadingProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "hsl(var(--background-elevated))",
        border: "1px solid hsl(var(--card-border))"
      }}
    >
      {label ? (
        <p className="mb-4 text-sm" style={{ color: "hsl(var(--muted))" }}>
          {label}
        </p>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-4 w-1/4" />
            <div className="skeleton h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
