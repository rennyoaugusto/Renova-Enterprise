"use client"

import { useEffect, useState } from "react"
import { Loading } from "@/components/shared/loading"

type MetricsResponse = {
  total: number
  byStatus: Record<string, number>
  byEtapa: Record<string, number>
  valorTotal: number
  margemMedia: number
  slaEstourado: number
  analistas: Array<{ id: string; nome: string }>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0)
}

function MetricRow({ label, value, max, danger }: { label: string; value: number; max: number; danger?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 text-xs text-[hsl(var(--muted))]">{label}</span>
      <div className="metric-bar-track flex-1">
        <div
          className="metric-bar-fill"
          style={{
            width: `${pct}%`,
            background: danger ? "hsl(var(--danger))" : "hsl(var(--primary))"
          }}
        />
      </div>
      <span
        className="w-8 shrink-0 text-right text-xs font-semibold"
        style={{ color: danger ? "hsl(var(--danger))" : "hsl(var(--foreground))" }}
      >
        {value}
      </span>
    </div>
  )
}

export function MetricasDashboard() {
  const [periodo, setPeriodo] = useState<"7" | "30" | "90" | "todos">("30")
  const [analista, setAnalista] = useState("todos")
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    params.set("periodo", periodo)
    if (analista !== "todos") {
      params.set("analista", analista)
    }
    const response = await fetch(`/api/metricas?${params.toString()}`, { cache: "no-store" })
    const body = await response.json()
    if (!response.ok) {
      setError(body.error ?? "Falha ao carregar métricas")
      setLoading(false)
      return
    }
    setData(body.data as MetricsResponse)
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, analista])

  if (loading) {
    return <Loading label="Carregando métricas..." rows={5} />
  }

  if (!data) {
    return <div className="alert-error">{error ?? "Sem dados de métricas."}</div>
  }

  const statusRows: Array<{ key: string; label: string }> = [
    { key: "em_validacao", label: "Em validação" },
    { key: "aguardando_comercial", label: "Aguardando comercial" },
    { key: "em_revisao", label: "Em revisão" },
    { key: "aprovado", label: "Aprovado" },
    { key: "enviado_implantacao", label: "Enviado implantação" },
    { key: "cancelado", label: "Cancelado" }
  ]

  const etapaRows: Array<{ key: string; label: string }> = [
    { key: "kickoff", label: "Kickoff" },
    { key: "vistoria", label: "Vistoria" },
    { key: "projeto", label: "Projeto" },
    { key: "calculadora", label: "Calculadora" },
    { key: "envio_comercial", label: "Envio comercial" }
  ]

  const maxStatus = Math.max(...statusRows.map((r) => data.byStatus[r.key] ?? 0), 1)
  const maxEtapa = Math.max(...etapaRows.map((r) => data.byEtapa[r.key] ?? 0), 1)

  return (
    <section className="space-y-5">
      <div className="surface-card grid gap-3 p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Período</label>
          <select
            className="premium-input"
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value as "7" | "30" | "90" | "todos")}
          >
            <option value="todos">Todos</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Analista</label>
          <select
            className="premium-input"
            value={analista}
            onChange={(event) => setAnalista(event.target.value)}
          >
            <option value="todos">Todos</option>
            {data.analistas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" className="premium-button w-full" onClick={() => void load()}>
            Atualizar métricas
          </button>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="text-xs text-[hsl(var(--muted))]">Validações no período</p>
          <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">{data.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-[hsl(var(--muted))]">Volume financeiro</p>
          <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">{formatCurrency(data.valorTotal)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-[hsl(var(--muted))]">Margem média</p>
          <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">{data.margemMedia.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-4">
          <p className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">Funil por status</p>
          <div className="space-y-3">
            {statusRows.map((row) => (
              <MetricRow
                key={row.key}
                label={row.label}
                value={data.byStatus[row.key] ?? 0}
                max={maxStatus}
              />
            ))}
          </div>
        </div>

        <div className="surface-card p-4">
          <p className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">Gargalos por etapa</p>
          <div className="space-y-3">
            {etapaRows.map((row) => (
              <MetricRow
                key={row.key}
                label={row.label}
                value={data.byEtapa[row.key] ?? 0}
                max={maxEtapa}
              />
            ))}
            <div className="mt-4 border-t border-[hsl(var(--border))] pt-3">
              <MetricRow
                label="SLA estourado"
                value={data.slaEstourado}
                max={Math.max(data.slaEstourado, 1)}
                danger
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
