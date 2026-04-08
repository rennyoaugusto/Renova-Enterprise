type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted))]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex-shrink-0">{actions}</div> : null}
    </div>
  )
}
