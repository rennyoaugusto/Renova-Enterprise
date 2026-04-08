import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowUpRight, Clock3, Layers3 } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="page-wrap">

      <PageHeader
        title="Dashboard"
        description="Visão geral da operação comercial."
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-eyebrow">Operação</p>
              <p
                className="mt-3 text-3xl font-semibold tracking-tight"
                style={{ color: "hsl(var(--foreground))" }}
              >
                —
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted))]">Validações em andamento</p>
            </div>
            <div
              className="rounded-lg p-2.5 text-[hsl(var(--primary))]"
              style={{ background: "hsl(var(--primary) / 0.08)" }}
            >
              <Layers3 size={17} />
            </div>
          </div>
          <p className="mt-4 text-xs text-[hsl(var(--muted))]">Disponível nas próximas fases</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-eyebrow">Fluxo</p>
              <p
                className="mt-3 text-3xl font-semibold tracking-tight"
                style={{ color: "hsl(var(--foreground))" }}
              >
                —
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted))]">Aguardando comercial</p>
            </div>
            <div
              className="rounded-lg p-2.5 text-[hsl(var(--accent))]"
              style={{ background: "hsl(var(--accent) / 0.08)" }}
            >
              <ArrowUpRight size={17} />
            </div>
          </div>
          <p className="mt-4 text-xs text-[hsl(var(--muted))]">Disponível nas próximas fases</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-eyebrow">SLA</p>
              <p
                className="mt-3 text-3xl font-semibold tracking-tight"
                style={{ color: "hsl(var(--foreground))" }}
              >
                —
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted))]">Dentro do prazo</p>
            </div>
            <div
              className="rounded-lg p-2.5 text-[hsl(var(--success))]"
              style={{ background: "hsl(var(--success) / 0.08)" }}
            >
              <Clock3 size={17} />
            </div>
          </div>
          <p className="mt-4 text-xs text-[hsl(var(--muted))]">Disponível nas próximas fases</p>
        </div>

      </div>

      <EmptyState
        title="Módulo inicial configurado"
        description="Autenticação e navegação funcionando. Os dados operacionais estarão disponíveis nas próximas fases do projeto."
      />

    </div>
  )
}
