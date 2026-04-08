import { Layers } from "lucide-react"

type EmptyStateProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center"
      style={{
        border: "1px dashed hsl(var(--border))",
        background: "hsl(var(--background-elevated))"
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-[hsl(var(--primary))]"
        style={{ background: "hsl(var(--primary) / 0.08)" }}
      >
        <Layers size={20} />
      </div>
      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-[hsl(var(--muted))]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
