"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Search,
  SlidersHorizontal
} from "lucide-react"

import { Loading } from "@/components/shared/loading"
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

type SlaStatus = { key: "no_prazo" | "proximo" | "estourado"; label: string; tagClass: string }

type EnrichedValidacao = ValidacaoListItem & {
  valorTotal: number | null
  margem: number | null
  progress: number
  sla: SlaStatus
  maoObra: number | null
  recorrente: number | null
}

type ValidacoesListProps = {
  canRegister?: boolean
}

function formatCurrency(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getProgressFromStep(step: EtapaValidacao) {
  const idx = ETAPA_VALIDACAO.indexOf(step)
  return Math.round(((idx + 1) / ETAPA_VALIDACAO.length) * 100)
}

function getSlaStatus(updatedAt: string): SlaStatus {
  const hoursDiff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60))
  if (hoursDiff < 48) return { key: "no_prazo", label: "No prazo", tagClass: "tag tag-success" }
  if (hoursDiff < 96) return { key: "proximo", label: "Próximo do limite", tagClass: "tag tag-warning" }
  return { key: "estourado", label: "Estourado", tagClass: "tag tag-danger" }
}

function margemClass(margem: number | null) {
  if (margem === null) return "text-[hsl(var(--muted))]"
  if (margem <= 0) return "text-[hsl(var(--danger))] font-medium"
  if (margem < 15) return "text-[hsl(var(--warning))] font-medium"
  return "text-[hsl(var(--success))] font-medium"
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="surface-card flex flex-col gap-0.5 rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--muted))]">
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums tracking-tight text-[hsl(var(--foreground))]">
        {value}
      </span>
      {hint ? <span className="text-xs text-[hsl(var(--muted))]">{hint}</span> : null}
    </div>
  )
}

export function ValidacoesList({ canRegister = false }: ValidacoesListProps) {
  const [items, setItems] = useState<ValidacaoListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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
  const [advancedOpen, setAdvancedOpen] = useState(false)

  async function loadData(mode: "initial" | "refresh" = "initial") {
    if (mode === "refresh") {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch("/api/validacoes", { cache: "no-store" })
      const body = await response.json()

      if (!response.ok) {
        setError(body.error ?? "Falha ao carregar validações")
        return
      }

      setItems(body.data ?? [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadData("initial")
  }, [])

  function resetFilters() {
    setSearch("")
    setStatusFilter("todos")
    setEtapaFilter("todas")
    setAnalistaFilter("todos")
    setVendedorFilter("todos")
    setGrupoFilter("todos")
    setPeriodoFilter("todos")
    setSlaFilter("todos")
    setSortBy("data")
  }

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

      return (
        searchMatch &&
        statusMatch &&
        etapaMatch &&
        analistaMatch &&
        vendedorMatch &&
        grupoMatch &&
        periodoMatch &&
        slaMatch
      )
    })
  }, [
    items,
    search,
    statusFilter,
    etapaFilter,
    analistaFilter,
    vendedorFilter,
    grupoFilter,
    periodoFilter,
    slaFilter
  ])

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

  const enrichedItems = useMemo((): EnrichedValidacao[] => {
    return sortedItems.map((item) => {
      const valorTotal = item.modelo_comercial === "locacao" ? item.locacao_valor_total : item.venda_valor_total
      const custo = item.custo_rev_total && item.custo_rev_total > 0 ? item.custo_rev_total : item.custo_prev_total
      const margem = valorTotal && custo ? ((valorTotal - custo) / valorTotal) * 100 : null
      return {
        ...item,
        valorTotal,
        margem,
        progress: getProgressFromStep(item.etapa_atual),
        sla: getSlaStatus(item.atualizado_em),
        maoObra: item.venda_valor_mao_obra,
        recorrente: item.modelo_comercial === "locacao" ? item.locacao_valor_mensal : null
      }
    })
  }, [sortedItems])

  const statusChips: { id: "todos" | (typeof STATUS_VALIDACAO)[number]; label: string }[] = [
    { id: "todos", label: "Todos" },
    ...STATUS_VALIDACAO.map((s) => ({ id: s, label: STATUS_LABEL[s] }))
  ]

  const isFilteredEmpty = !loading && items.length > 0 && sortedItems.length === 0
  const isTotallyEmpty = !loading && items.length === 0

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" value={resumo.total} hint="Validações na base" />
        <StatCard label="Aguardando comercial" value={resumo.aguardando} hint="Próximo passo comercial" />
        <StatCard label="Em revisão" value={resumo.emRevisao} hint="Ajustes pendentes" />
        <StatCard label="Aprovadas" value={resumo.aprovadas} hint="Status aprovado" />
      </div>

      <section className="surface-card overflow-hidden rounded-xl">
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-soft))] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted))]">Pesquisar</label>
              <div className="relative max-w-xl">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cliente, vendedor ou analista..."
                  className="premium-input pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => void loadData("refresh")}
                disabled={loading || refreshing}
                className="premium-button-secondary inline-flex h-[42px] shrink-0 items-center gap-2 px-4 disabled:opacity-60"
                title="Atualizar lista"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <span className="mb-2 block text-xs font-medium text-[hsl(var(--muted))]">Status</span>
            <div
              className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
              role="group"
              aria-label="Filtrar por status"
            >
              {statusChips.map((chip) => {
                const active =
                  chip.id === "todos" ? statusFilter === "todos" : statusFilter === chip.id
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id === "todos" ? "todos" : chip.id)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] text-[hsl(var(--muted))] hover:border-[hsl(var(--primary)/0.35)] hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary-strong))]"
            aria-expanded={advancedOpen}
          >
            <SlidersHorizontal size={14} />
            Filtros avançados
            <ChevronDown size={14} className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>

          {advancedOpen ? (
            <div className="mt-4 grid gap-3 border-t border-[hsl(var(--border))] pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Etapa</label>
                <select
                  value={etapaFilter}
                  onChange={(event) => setEtapaFilter(event.target.value as "todas" | EtapaValidacao)}
                  className="premium-input"
                >
                  <option value="todas">Todas</option>
                  {ETAPA_VALIDACAO.map((etapa) => (
                    <option key={etapa} value={etapa}>
                      {ETAPA_LABEL[etapa]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Analista</label>
                <select
                  value={analistaFilter}
                  onChange={(event) => setAnalistaFilter(event.target.value)}
                  className="premium-input"
                >
                  <option value="todos">Todos</option>
                  {analistaOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Vendedor</label>
                <select
                  value={vendedorFilter}
                  onChange={(event) => setVendedorFilter(event.target.value)}
                  className="premium-input"
                >
                  <option value="todos">Todos</option>
                  {vendedorOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Grupo projeto</label>
                <select
                  value={grupoFilter}
                  onChange={(event) => setGrupoFilter(event.target.value)}
                  className="premium-input"
                >
                  <option value="todos">Todos</option>
                  <option value="portaria_remota">Portaria remota</option>
                  <option value="sistema_tecnico">Sistema técnico</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Período</label>
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
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">SLA</label>
                <select
                  value={slaFilter}
                  onChange={(event) =>
                    setSlaFilter(event.target.value as "todos" | "no_prazo" | "proximo" | "estourado")
                  }
                  className="premium-input"
                >
                  <option value="todos">Todos</option>
                  <option value="no_prazo">No prazo</option>
                  <option value="proximo">Próximo do limite</option>
                  <option value="estourado">Estourado</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Ordenação</label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as "data" | "sla" | "valor" | "etapa")}
                  className="premium-input"
                >
                  <option value="data">Data de atualização</option>
                  <option value="sla">SLA (mais urgente)</option>
                  <option value="valor">Valor total</option>
                  <option value="etapa">Etapa atual</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-4 sm:p-5">
          {error ? (
            <div className="alert-error mb-4 flex items-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          ) : null}

          {loading ? (
            <Loading label="Carregando validações..." rows={5} />
          ) : isTotallyEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <ClipboardList size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Nenhuma validação ainda</p>
                <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted))]">
                  Registre a primeira venda para acompanhar etapas, SLA e aprovações em um só lugar.
                </p>
              </div>
              {canRegister ? (
                <Link href="/validacoes/nova" className="premium-button">
                  Registrar venda
                </Link>
              ) : null}
            </div>
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] px-6 py-10 text-center">
              <AlertTriangle className="text-[hsl(var(--warning))]" size={22} />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Nenhum resultado</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                  Nenhuma validação corresponde aos filtros. Ajuste a busca ou limpe os filtros.
                </p>
              </div>
              <button type="button" onClick={resetFilters} className="premium-button-secondary">
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-[hsl(var(--muted))]">
                Mostrando <span className="font-medium text-[hsl(var(--foreground))]">{sortedItems.length}</span> de{" "}
                <span className="font-medium text-[hsl(var(--foreground))]">{items.length}</span> validações
              </p>

              <div className="space-y-3 md:hidden">
                {enrichedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/validacoes/${item.id}`}
                    className="surface-card flex gap-3 rounded-xl p-4 transition hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="font-semibold text-[hsl(var(--foreground))]">{item.nome_cliente}</span>
                        <span className={STATUS_TAG_CLASS[item.status]}>{STATUS_LABEL[item.status]}</span>
                      </div>
                      <p className="mt-1 text-xs text-[hsl(var(--muted))]">
                        {item.vendedor_nome ?? "—"} · {item.analista_nome ?? "—"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium text-[hsl(var(--foreground))]">{ETAPA_LABEL[item.etapa_atual]}</span>
                        <span className="text-[hsl(var(--fg-subtle))]">{item.progress}%</span>
                        <span className="text-[hsl(var(--muted))]">·</span>
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          {formatCurrency(item.valorTotal)}
                        </span>
                        <span className="text-[hsl(var(--muted))]">·</span>
                        <span className={item.sla.tagClass}>{item.sla.label}</span>
                      </div>
                      <p className="mt-2 text-[0.65rem] text-[hsl(var(--fg-subtle))]">
                        Atualizado{" "}
                        {formatDistanceToNow(new Date(item.atualizado_em), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[hsl(var(--muted))]" aria-hidden />
                  </Link>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="data-table min-w-[720px] xl:min-w-0">
                  <thead>
                    <tr>
                      <th className="pl-0">Cliente</th>
                      <th className="hidden xl:table-cell">Vendedor</th>
                      <th className="hidden xl:table-cell">Analista</th>
                      <th>Status</th>
                      <th>Etapa</th>
                      <th className="hidden xl:table-cell">Rev.</th>
                      <th>Valor</th>
                      <th className="hidden xl:table-cell">Mão de obra</th>
                      <th className="hidden xl:table-cell">Recorrente</th>
                      <th className="hidden xl:table-cell">Margem</th>
                      <th>SLA</th>
                      <th className="pr-0 text-right">Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedItems.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="pl-0">
                          <Link
                            href={`/validacoes/${item.id}`}
                            className="font-medium text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]"
                          >
                            {item.nome_cliente}
                          </Link>
                        </td>
                        <td className="hidden text-[hsl(var(--muted))] xl:table-cell">
                          {item.vendedor_nome ?? "—"}
                        </td>
                        <td className="hidden text-[hsl(var(--muted))] xl:table-cell">
                          {item.analista_nome ?? "—"}
                        </td>
                        <td>
                          <span className={STATUS_TAG_CLASS[item.status]}>{STATUS_LABEL[item.status]}</span>
                        </td>
                        <td>
                          <p className="mb-1 text-xs font-medium text-[hsl(var(--foreground))]">
                            {ETAPA_LABEL[item.etapa_atual]}
                          </p>
                          <div className="progress-bar w-24 xl:w-28">
                            <div className="progress-bar-fill" style={{ width: `${item.progress}%` }} />
                          </div>
                        </td>
                        <td className="hidden text-[hsl(var(--foreground))] xl:table-cell">{item.numero_revisoes}</td>
                        <td className="whitespace-nowrap text-[hsl(var(--foreground))]">
                          {formatCurrency(item.valorTotal)}
                        </td>
                        <td className="hidden whitespace-nowrap text-[hsl(var(--foreground))] xl:table-cell">
                          {formatCurrency(item.maoObra)}
                        </td>
                        <td className="hidden whitespace-nowrap text-[hsl(var(--foreground))] xl:table-cell">
                          {formatCurrency(item.recorrente)}
                        </td>
                        <td className="hidden xl:table-cell">
                          <span className={margemClass(item.margem)}>
                            {item.margem === null ? "—" : `${item.margem.toFixed(1)}%`}
                          </span>
                        </td>
                        <td>
                          <span className={item.sla.tagClass}>{item.sla.label}</span>
                        </td>
                        <td className="whitespace-nowrap pr-0 text-right text-xs text-[hsl(var(--muted))]">
                          {formatDistanceToNow(new Date(item.atualizado_em), { addSuffix: true, locale: ptBR })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
