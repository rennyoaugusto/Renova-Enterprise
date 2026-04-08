"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import { ETAPA_VALIDACAO, STATUS_VALIDACAO, type EtapaValidacao, type ValidacaoListItem } from "@/types/validacao"

const STATUS_LABEL: Record<(typeof STATUS_VALIDACAO)[number], string> = {
  em_validacao: "Em validação",
  aguardando_comercial: "Aguardando comercial",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  enviado_implantacao: "Enviado implantação",
  cancelado: "Cancelado"
}

const STATUS_TAG_CLASS: Record<(typeof STATUS_VALIDACAO)[number], string> = {
  em_validacao: "tag tag-primary",
  aguardando_comercial: "tag tag-warning",
  em_revisao: "tag tag-accent",
  aprovado: "tag tag-success",
  enviado_implantacao: "tag tag-success",
  cancelado: "tag tag-danger"
}

const ETAPA_LABEL: Record<EtapaValidacao, string> = {
  kickoff: "Kickoff",
  vistoria: "Vistoria",
  projeto: "Projeto",
  calculadora: "Calculadora",
  envio_comercial: "Envio comercial"
}

function formatCurrency(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getProgressFromStep(step: EtapaValidacao) {
  const idx = ETAPA_VALIDACAO.indexOf(step)
  return Math.round(((idx + 1) / ETAPA_VALIDACAO.length) * 100)
}

type SlaStatus = { key: "no_prazo" | "proximo" | "estourado"; label: string; tagClass: string }

function getSlaStatus(updatedAt: string): SlaStatus {
  const hoursDiff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60))
  if (hoursDiff < 48) return { key: "no_prazo", label: "No prazo", tagClass: "tag tag-success" }
  if (hoursDiff < 96) return { key: "proximo", label: "Próximo do limite", tagClass: "tag tag-warning" }
  return { key: "estourado", label: "Estourado", tagClass: "tag tag-danger" }
}

export function ValidacoesList() {
  const [items, setItems] = useState<ValidacaoListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | (typeof STATUS_VALIDACAO)[number]>("todos")
  const [etapaFilter, setEtapaFilter] = useState<"todas" | EtapaValidacao>("todas")
  const [analistaFilter, setAnalistaFilter] = useState("todos")
  const [vendedorFilter, setVendedorFilter] = useState("todos")
  const [grupoFilter, setGrupoFilter] = useState("todos")
  const [periodoFilter, setPeriodoFilter] = useState<"todos" | "7" | "30" | "90">("todos")
  const [slaFilter, setSlaFilter] = useState<"todos" | "no_prazo" | "proximo" | "estourado">("todos")
  const [sortBy, setSortBy] = useState<"data" | "sla" | "valor" | "etapa">("data")

  async function loadData() {
    setLoading(true)
    setError(null)

    const response = await fetch("/api/validacoes", { cache: "no-store" })
    const body = await response.json()

    if (!response.ok) {
      setError(body.error ?? "Falha ao carregar validações")
      setLoading(false)
      return
    }

    setItems(body.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  const resumo = useMemo(() => {
    const total = items.length
    const aprovadas = items.filter((item) => item.status === "aprovado").length
    const emRevisao = items.filter((item) => item.status === "em_revisao").length
    const aguardando = items.filter((item) => item.status === "aguardando_comercial").length
    return { total, aprovadas, emRevisao, aguardando }
  }, [items])

  const analistaOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => `${item.analista_id}|${item.analista_nome ?? "Sem analista"}`))).map(
        (entry) => {
          const [id, nome] = entry.split("|")
          return { id, nome }
        }
      ),
    [items]
  )

  const vendedorOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => `${item.vendedor_id}|${item.vendedor_nome ?? "Sem vendedor"}`))).map(
        (entry) => {
          const [id, nome] = entry.split("|")
          return { id, nome }
        }
      ),
    [items]
  )

  const filteredItems = useMemo(() => {
    const now = Date.now()
    return items.filter((item) => {
      const searchMatch =
        !search.trim() ||
        `${item.nome_cliente} ${item.vendedor_nome ?? ""} ${item.analista_nome ?? ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      const statusMatch = statusFilter === "todos" || item.status === statusFilter
      const etapaMatch = etapaFilter === "todas" || item.etapa_atual === etapaFilter
      const analistaMatch = analistaFilter === "todos" || item.analista_id === analistaFilter
      const vendedorMatch = vendedorFilter === "todos" || item.vendedor_id === vendedorFilter
      const grupoMatch = grupoFilter === "todos" || item.tipo_projeto === grupoFilter

      const periodDays = periodoFilter === "todos" ? null : Number(periodoFilter)
      const periodoMatch =
        periodDays === null || now - new Date(item.atualizado_em).getTime() <= periodDays * 24 * 60 * 60 * 1000

      const sla = getSlaStatus(item.atualizado_em)
      const slaMatch = slaFilter === "todos" || sla.key === slaFilter

      return searchMatch && statusMatch && etapaMatch && analistaMatch && vendedorMatch && grupoMatch && periodoMatch && slaMatch
    })
  }, [items, search, statusFilter, etapaFilter, analistaFilter, vendedorFilter, grupoFilter, periodoFilter, slaFilter])

  const sortedItems = useMemo(() => {
    const cloned = [...filteredItems]
    if (sortBy === "valor") {
      cloned.sort((a, b) => {
        const va = (a.modelo_comercial === "locacao" ? a.locacao_valor_total : a.venda_valor_total) ?? 0
        const vb = (b.modelo_comercial === "locacao" ? b.locacao_valor_total : b.venda_valor_total) ?? 0
        return vb - va
      })
    } else if (sortBy === "etapa") {
      cloned.sort((a, b) => ETAPA_VALIDACAO.indexOf(b.etapa_atual) - ETAPA_VALIDACAO.indexOf(a.etapa_atual))
    } else if (sortBy === "sla") {
      const weight = { estourado: 3, proximo: 2, no_prazo: 1 }
      cloned.sort(
        (a, b) =>
          weight[getSlaStatus(b.atualizado_em).key as keyof typeof weight] -
          weight[getSlaStatus(a.atualizado_em).key as keyof typeof weight]
      )
    } else {
      cloned.sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime())
    }
    return cloned
  }, [filteredItems, sortBy])

  return (
    <section className="surface-card p-6">
      {/* Summary cards */}
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: resumo.total },
          { label: "Aguardando comercial", value: resumo.aguardando },
          { label: "Em revisão", value: resumo.emRevisao },
          { label: "Aprovadas", value: resumo.aprovadas }
        ].map((card) => (
          <div key={card.label} className="surface-card p-4">
            <p className="text-xs" style={{ color: "hsl(var(--muted))" }}>{card.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 grid gap-3 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Pesquisar</label>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted))" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cliente, vendedor ou analista..."
              className="premium-input pl-9"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "todos" | (typeof STATUS_VALIDACAO)[number])}
            className="premium-input"
          >
            <option value="todos">Todos</option>
            {STATUS_VALIDACAO.map((status) => (
              <option key={status} value={status}>{STATUS_LABEL[status]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Etapa</label>
          <select
            value={etapaFilter}
            onChange={(event) => setEtapaFilter(event.target.value as "todas" | EtapaValidacao)}
            className="premium-input"
          >
            <option value="todas">Todas</option>
            {ETAPA_VALIDACAO.map((etapa) => (
              <option key={etapa} value={etapa}>{ETAPA_LABEL[etapa]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Analista</label>
          <select value={analistaFilter} onChange={(event) => setAnalistaFilter(event.target.value)} className="premium-input">
            <option value="todos">Todos</option>
            {analistaOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Vendedor</label>
          <select value={vendedorFilter} onChange={(event) => setVendedorFilter(event.target.value)} className="premium-input">
            <option value="todos">Todos</option>
            {vendedorOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Grupo projeto</label>
          <select value={grupoFilter} onChange={(event) => setGrupoFilter(event.target.value)} className="premium-input">
            <option value="todos">Todos</option>
            <option value="portaria_remota">Portaria remota</option>
            <option value="sistema_tecnico">Sistema técnico</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Período</label>
          <select
            value={periodoFilter}
            onChange={(event) => setPeriodoFilter(event.target.value as "todos" | "7" | "30" | "90")}
            className="premium-input"
          >
            <option value="todos">Todos</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>SLA</label>
          <select
            value={slaFilter}
            onChange={(event) => setSlaFilter(event.target.value as "todos" | "no_prazo" | "proximo" | "estourado")}
            className="premium-input"
          >
            <option value="todos">Todos</option>
            <option value="no_prazo">No prazo</option>
            <option value="proximo">Próximo do limite</option>
            <option value="estourado">Estourado</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "hsl(var(--muted))" }}>Ordenação</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "data" | "sla" | "valor" | "etapa")}
            className="premium-input"
          >
            <option value="data">Data atualização</option>
            <option value="sla">SLA (mais urgente)</option>
            <option value="valor">Valor total</option>
            <option value="etapa">Etapa atual</option>
          </select>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={() => void loadData()} className="premium-button w-full">
            Atualizar lista
          </button>
        </div>
      </div>

      {error ? (
        <div className="alert-error mb-4 flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-5 w-28 rounded-full" />
              <div className="skeleton h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--background-elevated))", color: "hsl(var(--muted))" }}>
          <AlertTriangle size={15} />
          Nenhuma validação encontrada para os filtros aplicados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Analista</th>
                <th>Status</th>
                <th>Etapa / Progresso</th>
                <th>Rev.</th>
                <th>Valor total</th>
                <th>Mão de obra</th>
                <th>Recorrente</th>
                <th>Margem</th>
                <th>SLA</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const valorTotal = item.modelo_comercial === "locacao" ? item.locacao_valor_total : item.venda_valor_total
                const custo = item.custo_rev_total && item.custo_rev_total > 0 ? item.custo_rev_total : item.custo_prev_total
                const margem = valorTotal && custo ? ((valorTotal - custo) / valorTotal) * 100 : null
                const progress = getProgressFromStep(item.etapa_atual)
                const sla = getSlaStatus(item.atualizado_em)
                const maoObra = item.venda_valor_mao_obra
                const recorrente = item.modelo_comercial === "locacao" ? item.locacao_valor_mensal : null
                const margemStyle =
                  margem === null
                    ? { color: "hsl(var(--muted))" }
                    : margem <= 0
                      ? { color: "hsl(var(--danger))" }
                      : margem < 15
                        ? { color: "hsl(var(--warning))" }
                        : { color: "hsl(var(--success))" }

                return (
                  <tr key={item.id}>
                    <td>
                      <Link
                        href={`/validacoes/${item.id}`}
                        className="font-medium transition-colors hover:text-[hsl(var(--primary))]"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        {item.nome_cliente}
                      </Link>
                    </td>
                    <td style={{ color: "hsl(var(--muted))" }}>{item.vendedor_nome ?? "—"}</td>
                    <td style={{ color: "hsl(var(--muted))" }}>{item.analista_nome ?? "—"}</td>
                    <td>
                      <span className={STATUS_TAG_CLASS[item.status]}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td>
                      <p className="mb-1.5 text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>
                        {ETAPA_LABEL[item.etapa_atual]}
                      </p>
                      <div className="progress-bar w-28">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </td>
                    <td style={{ color: "hsl(var(--foreground))" }}>{item.numero_revisoes}</td>
                    <td style={{ color: "hsl(var(--foreground))" }}>{formatCurrency(valorTotal)}</td>
                    <td style={{ color: "hsl(var(--foreground))" }}>{formatCurrency(maoObra)}</td>
                    <td style={{ color: "hsl(var(--foreground))" }}>{formatCurrency(recorrente)}</td>
                    <td>
                      <span style={margemStyle} className="font-medium">
                        {margem === null ? "—" : `${margem.toFixed(1)}%`}
                      </span>
                    </td>
                    <td>
                      <span className={sla.tagClass}>{sla.label}</span>
                    </td>
                    <td className="whitespace-nowrap text-xs" style={{ color: "hsl(var(--muted))" }}>
                      {formatDistanceToNow(new Date(item.atualizado_em), { addSuffix: true, locale: ptBR })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
