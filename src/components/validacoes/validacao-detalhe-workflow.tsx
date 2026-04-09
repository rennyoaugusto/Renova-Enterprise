"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, Check, CheckCircle2, Circle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  ETAPA_VALIDACAO,
  type EtapaValidacao,
  type ValidacaoDetalhe
} from "@/types/validacao"

const ETAPA_LABEL: Record<EtapaValidacao, string> = {
  kickoff: "Kickoff",
  vistoria: "Vistoria",
  projeto: "Projeto",
  calculadora: "Calculadora",
  envio_comercial: "Envio ao comercial"
}

const ETAPA_RESUMO: Record<EtapaValidacao, string> = {
  kickoff: "Alinhamento de escopo, premissas e registro da reunião inicial.",
  vistoria: "Visita técnica e avaliação de viabilidade no local.",
  projeto: "Detalhamento técnico e ajustes de escopo quando necessário.",
  calculadora: "Consolidação de custos, equipamentos e mão de obra.",
  envio_comercial: "Entrega do pacote técnico para o time comercial."
}

function etapaInfoFor(data: ValidacaoDetalhe, etapa: EtapaValidacao) {
  return data.etapas.find((e) => e.etapa === etapa) ?? null
}

function EtapasFluxoVisual({ data }: { data: ValidacaoDetalhe }) {
  const currentIndex = ETAPA_VALIDACAO.indexOf(data.etapa_atual)
  const upcoming = ETAPA_VALIDACAO.slice(currentIndex + 1)
  const flowClosed = ["aprovado", "enviado_implantacao", "cancelado"].includes(data.status)

  return (
    <section className="surface-card overflow-hidden p-0">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-soft)/0.45)] px-5 py-4 sm:px-6">
        <p className="section-eyebrow">Fluxo de etapas</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
          Progresso da validação
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-[hsl(var(--muted))]">
          Cada etapa avança o processo até o envio ao comercial. A etapa em destaque é onde o trabalho está
          concentrado agora.
        </p>
      </div>

      <div className="overflow-x-auto px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-w-[36rem] max-w-4xl items-center sm:min-w-0">
          {ETAPA_VALIDACAO.map((etapa, index) => {
            const info = etapaInfoFor(data, etapa)
            const done = Boolean(info?.concluida)
            const current = data.etapa_atual === etapa && !done

            const etapaParaTraco = ETAPA_VALIDACAO[index]
            const connectorDone =
              index < ETAPA_VALIDACAO.length - 1 &&
              etapaParaTraco !== undefined &&
              Boolean(etapaInfoFor(data, etapaParaTraco)?.concluida)

            return (
              <Fragment key={etapa}>
                <div className="flex w-[4.75rem] shrink-0 flex-col items-center text-center sm:w-[5.25rem]">
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-shadow ${
                      done
                        ? "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-white shadow-[0_0_0_4px_hsl(var(--success)/0.2)]"
                        : current
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] text-[hsl(var(--muted))]"
                    }`}
                  >
                    {done ? (
                      <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    ) : current ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))] shadow-sm" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4 opacity-40" strokeWidth={2} aria-hidden />
                    )}
                  </div>
                  <p
                    className={`mt-2.5 text-[0.7rem] font-semibold leading-tight sm:text-xs ${
                      done || current ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted))]"
                    }`}
                  >
                    {ETAPA_LABEL[etapa]}
                  </p>
                  {done ? (
                    <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-[hsl(var(--success))]">
                      Ok
                    </span>
                  ) : current ? (
                    <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-[hsl(var(--primary))]">
                      Atual
                    </span>
                  ) : (
                    <span className="mt-0.5 text-[0.6rem] text-[hsl(var(--fg-subtle))]">—</span>
                  )}
                </div>

                {index < ETAPA_VALIDACAO.length - 1 ? (
                  <div
                    className={`mx-0.5 h-[3px] min-w-[0.5rem] flex-1 rounded-full transition-colors ${
                      connectorDone ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--border))]"
                    }`}
                    aria-hidden
                  />
                ) : null}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background-soft)/0.35)] px-5 py-5 sm:px-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[hsl(var(--muted))]">
          Próximas fases
        </p>

        {flowClosed ? (
          <p className="mt-3 text-sm text-[hsl(var(--muted))]">
            {data.status === "cancelado"
              ? "Esta validação foi cancelada — o fluxo não seguirá adiante."
              : "Fluxo técnico concluído nesta validação."}
          </p>
        ) : upcoming.length === 0 ? (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--success))]" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Última etapa do fluxo</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                Após concluir <strong className="text-[hsl(var(--foreground))]">{ETAPA_LABEL[data.etapa_atual]}</strong>,
                use &quot;Avançar etapa&quot; para encerrar o fluxo técnico ou seguir conforme as regras do processo.
              </p>
            </div>
          </div>
        ) : (
          <ol className="mt-4 space-y-3">
            {upcoming.map((etapa, order) => (
              <li
                key={etapa}
                className="flex gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] p-4 transition-colors hover:border-[hsl(var(--primary)/0.25)]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.12)] text-sm font-bold tabular-nums text-[hsl(var(--primary))]"
                  aria-hidden
                >
                  {order + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[hsl(var(--foreground))]">{ETAPA_LABEL[etapa]}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted))]">{ETAPA_RESUMO[etapa]}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

export function ValidacaoDetalheWorkflow({ id }: { id: string }) {
  const [data, setData] = useState<ValidacaoDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [cancelInviavel, setCancelInviavel] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    const response = await fetch(`/api/validacoes/${id}`, { cache: "no-store" })
    const body = await response.json()
    if (!response.ok) {
      setError(body.error ?? "Falha ao carregar validação")
      setLoading(false)
      return
    }

    setData(body.data)
    const currentEtapa = (body.data?.etapas ?? []).find((etapa: { etapa: string }) => etapa.etapa === body.data.etapa_atual)
    setForm(currentEtapa ?? {})
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const currentEtapa = data?.etapa_atual
  const isReadOnly = data ? ["cancelado", "enviado_implantacao"].includes(data.status) : false
  const currentEtapaData = useMemo(() => {
    if (!data || !currentEtapa) return null
    return data.etapas.find((etapa) => etapa.etapa === currentEtapa) ?? null
  }, [data, currentEtapa])

  function updateField(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function saveEtapa() {
    if (!data) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/validacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etapa: data.etapa_atual,
          data: form
        })
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Falha ao salvar etapa")
        return
      }
      setSuccess("Dados da etapa salvos.")
      await loadData()
    } finally {
      setIsSaving(false)
    }
  }

  async function avancarEtapa() {
    if (!data) return
    setIsAdvancing(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/validacoes/${id}/avancar-etapa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelarInviavel: cancelInviavel })
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Falha ao avançar etapa")
        return
      }
      setSuccess("Etapa avançada com sucesso.")
      await loadData()
      setCancelInviavel(false)
    } finally {
      setIsAdvancing(false)
    }
  }

  function renderEtapaFields() {
    if (!currentEtapa) return null
    if (currentEtapa === "kickoff") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Ata da reunião</label>
            <textarea
              className="premium-input min-h-24"
              value={String(form.kickoff_ata ?? "")}
              onChange={(event) => updateField("kickoff_ata", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Escopo vendido</label>
            <input
              className="premium-input"
              value={String(form.kickoff_vendido ?? "")}
              onChange={(event) => updateField("kickoff_vendido", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Pontos de atenção</label>
            <textarea
              className="premium-input min-h-24"
              value={String(form.kickoff_pontos_atencao ?? "")}
              onChange={(event) => updateField("kickoff_pontos_atencao", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Premissas técnicas</label>
            <textarea
              className="premium-input min-h-24"
              value={String(form.kickoff_premissas ?? "")}
              onChange={(event) => updateField("kickoff_premissas", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Data da reunião</label>
            <input
              type="date"
              className="premium-input"
              value={String(form.kickoff_data_reuniao ?? "")}
              onChange={(event) => updateField("kickoff_data_reuniao", event.target.value)}
            />
          </div>
        </div>
      )
    }

    if (currentEtapa === "vistoria") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Data da vistoria</label>
            <input
              type="date"
              className="premium-input"
              value={String(form.vistoria_data ?? "")}
              onChange={(event) => updateField("vistoria_data", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Resultado</label>
            <select
              className="premium-input"
              value={String(form.vistoria_resultado ?? "")}
              onChange={(event) => updateField("vistoria_resultado", event.target.value)}
            >
              <option value="">Selecione</option>
              <option value="viavel">Viável</option>
              <option value="viavel_com_ressalvas">Viável com ressalvas</option>
              <option value="inviavel">Inviável</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Observações</label>
            <textarea
              className="premium-input min-h-24"
              value={String(form.vistoria_observacoes ?? "")}
              onChange={(event) => updateField("vistoria_observacoes", event.target.value)}
            />
          </div>
          {String(form.vistoria_resultado ?? "") === "inviavel" ? (
            <>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Justificativa de inviabilidade</label>
                <textarea
                  className="premium-input min-h-24"
                  value={String(form.vistoria_justificativa_inviavel ?? "")}
                  onChange={(event) => updateField("vistoria_justificativa_inviavel", event.target.value)}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cancelInviavel}
                  onChange={(event) => setCancelInviavel(event.target.checked)}
                />
                Cancelar validação ao avançar (inviabilidade técnica)
              </label>
            </>
          ) : null}
        </div>
      )
    }

    if (currentEtapa === "projeto") {
      return (
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Descrição técnica</label>
            <textarea
              className="premium-input min-h-28"
              value={String(form.projeto_descricao_tecnica ?? "")}
              onChange={(event) => updateField("projeto_descricao_tecnica", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ajustes de escopo</label>
            <textarea
              className="premium-input min-h-20"
              value={String(form.projeto_ajustes_escopo ?? "")}
              onChange={(event) => updateField("projeto_ajustes_escopo", event.target.value)}
            />
          </div>
        </div>
      )
    }

    if (currentEtapa === "calculadora") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Custo equipamentos (R$)</label>
            <input
              type="number"
              step="0.01"
              className="premium-input"
              value={Number(form.calc_custo_equipamentos ?? 0)}
              onChange={(event) => updateField("calc_custo_equipamentos", Number(event.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Custo materiais (R$)</label>
            <input
              type="number"
              step="0.01"
              className="premium-input"
              value={Number(form.calc_custo_materiais ?? 0)}
              onChange={(event) => updateField("calc_custo_materiais", Number(event.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Custo mão de obra (R$)</label>
            <input
              type="number"
              step="0.01"
              className="premium-input"
              value={Number(form.calc_custo_mao_obra ?? 0)}
              onChange={(event) => updateField("calc_custo_mao_obra", Number(event.target.value))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium">Justificativa de revisão</label>
            <textarea
              className="premium-input min-h-24"
              value={String(form.calc_justificativa ?? "")}
              onChange={(event) => updateField("calc_justificativa", event.target.value)}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Resumo técnico</label>
          <textarea
            className="premium-input min-h-24"
            value={String(form.envio_resumo_tecnico ?? "")}
            onChange={(event) => updateField("envio_resumo_tecnico", event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Justificativas para comercial</label>
          <textarea
            className="premium-input min-h-24"
            value={String(form.envio_justificativas ?? "")}
            onChange={(event) => updateField("envio_justificativas", event.target.value)}
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-[hsl(var(--muted))]">Carregando validação...</p>
  }

  if (!data) {
    return (
      <div className="alert-error">
        {error ?? "Validação não encontrada."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="section-eyebrow">Validação</p>
            <h2 className="text-lg font-semibold">{data.nome_cliente}</h2>
          </div>
          <Link className="premium-button-secondary" href={`/validacoes/${id}/revisoes`}>
            Revisões
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <p className="text-xs text-[hsl(var(--muted))]">Status</p>
            <p className="text-sm font-semibold">{data.status}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted))]">Etapa atual</p>
            <p className="text-sm font-semibold">{ETAPA_LABEL[data.etapa_atual]}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted))]">Atualizado</p>
            <p className="text-sm">{formatDistanceToNow(new Date(data.atualizado_em), { addSuffix: true, locale: ptBR })}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted))]">Revisões</p>
            <p className="text-sm font-semibold">{data.numero_revisoes}</p>
          </div>
        </div>
      </section>

      <EtapasFluxoVisual data={data} />

      <section className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="section-eyebrow">Etapa atual</p>
            <h3 className="text-lg font-semibold">{ETAPA_LABEL[data.etapa_atual]}</h3>
          </div>
          {currentEtapaData?.sla_limite ? (
            <p className="text-xs text-[hsl(var(--muted))]">
              SLA: {formatDistanceToNow(new Date(currentEtapaData.sla_limite), { addSuffix: true, locale: ptBR })}
            </p>
          ) : null}
        </div>

        {renderEtapaFields()}

        {error ? (
          <div className="alert-error mt-4 inline-flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="alert-success mt-4">{success}</div>
        ) : null}

        {isReadOnly ? (
          <div className="alert-warning mt-4">
            Esta validação está encerrada e não aceita novas alterações.
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="premium-button-secondary"
            onClick={() => void saveEtapa()}
            disabled={isSaving || isReadOnly}
          >
            {isSaving ? "Salvando..." : "Salvar dados da etapa"}
          </button>
          <button type="button" className="premium-button" onClick={() => void avancarEtapa()} disabled={isAdvancing || isReadOnly}>
            {isAdvancing ? "Avançando..." : "Avançar etapa"}
          </button>
        </div>
      </section>
    </div>
  )
}
