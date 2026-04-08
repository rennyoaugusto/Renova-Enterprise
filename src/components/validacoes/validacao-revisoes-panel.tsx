"use client"

import { useEffect, useState } from "react"

import type { UserRole } from "@/types/usuario"
import type { EtapaValidacao, StatusValidacao } from "@/types/validacao"

type Revisao = {
  id: string
  numero: number
  motivo: string
  etapa_retorno: EtapaValidacao
  comentarios: string | null
  criado_em: string
}

type ValidacaoResumo = {
  id: string
  nome_cliente: string
  status: StatusValidacao
  numero_revisoes: number
  etapa_atual: EtapaValidacao
}

const ETAPA_LABEL: Record<EtapaValidacao, string> = {
  kickoff: "KickOff",
  vistoria: "Vistoria",
  projeto: "Projeto",
  calculadora: "Calculadora",
  envio_comercial: "Envio Comercial"
}

const STATUS_LABEL: Record<StatusValidacao, string> = {
  em_validacao: "Em validação",
  aguardando_comercial: "Aguardando comercial",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  enviado_implantacao: "Enviado implantação",
  cancelado: "Cancelado"
}

function isAdminLike(role: UserRole | null) {
  return role === "super_admin" || role === "coordenador"
}

export function ValidacaoRevisoesPanel({ id, role }: { id: string; role: UserRole | null }) {
  const [validacao, setValidacao] = useState<ValidacaoResumo | null>(null)
  const [revisoes, setRevisoes] = useState<Revisao[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [motivo, setMotivo] = useState("")
  const [etapaRetorno, setEtapaRetorno] = useState<"projeto" | "calculadora">("projeto")
  const [comentarios, setComentarios] = useState("")

  async function load() {
    setLoading(true)
    setError(null)
    const response = await fetch(`/api/validacoes/${id}/revisoes`, { cache: "no-store" })
    const body = await response.json()
    if (!response.ok) {
      setError(body.error ?? "Falha ao carregar revisões.")
      setLoading(false)
      return
    }
    setValidacao(body.data.validacao as ValidacaoResumo)
    setRevisoes((body.data.revisoes ?? []) as Revisao[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function solicitarRevisao() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/validacoes/${id}/solicitar-revisao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo,
          etapa_retorno: etapaRetorno,
          comentarios
        })
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Falha ao solicitar revisão.")
        return
      }
      setSuccess("Revisão solicitada com sucesso.")
      setMotivo("")
      setComentarios("")
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function runAction(url: string, payload?: Record<string, unknown>, okMessage?: string) {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Falha ao executar ação.")
        return
      }
      setSuccess(okMessage ?? "Ação executada com sucesso.")
      await load()
    } finally {
      setSaving(false)
    }
  }

  const canReviewRequest = role === "comercial" || isAdminLike(role)
  const canCloseFlow = role === "comercial" || isAdminLike(role)

  if (loading) {
    return <p className="text-sm text-[hsl(var(--muted))]">Carregando histórico de revisões...</p>
  }

  if (!validacao) {
    return (
      <div className="alert-error">
        {error ?? "Validação não encontrada."}
      </div>
    )
  }

  return (
    <section className="space-y-5">
      <div className="surface-card p-5">
        <p className="section-eyebrow">Validação</p>
        <h2 className="text-lg font-semibold">{validacao.nome_cliente}</h2>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <p>Status: <strong>{STATUS_LABEL[validacao.status]}</strong></p>
          <p>Etapa atual: <strong>{ETAPA_LABEL[validacao.etapa_atual]}</strong></p>
          <p>Número de revisões: <strong>{validacao.numero_revisoes}</strong></p>
        </div>
      </div>

      {canCloseFlow ? (
        <div className="surface-card space-y-3 p-5">
          <p className="section-eyebrow">Ações comerciais</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="premium-button"
              disabled={saving || !["aguardando_comercial", "em_revisao"].includes(validacao.status)}
              onClick={() => void runAction(`/api/validacoes/${id}/aprovar`, undefined, "Validação aprovada.")}
            >
              Aprovar validação
            </button>
            <button
              type="button"
              className="premium-button-secondary"
              disabled={saving}
              onClick={() => {
                const justificativa = window.prompt("Informe justificativa do cancelamento:")
                if (!justificativa) return
                void runAction(
                  `/api/validacoes/${id}/cancelar`,
                  { motivo: "outro", justificativa },
                  "Validação cancelada com sucesso."
                )
              }}
            >
              Cancelar validação
            </button>
            <button
              type="button"
              className="premium-button-secondary"
              disabled={saving || validacao.status !== "aprovado"}
              onClick={() =>
                void runAction(`/api/validacoes/${id}/enviar-implantacao`, undefined, "Validação enviada para implantação.")
              }
            >
              Enviar para implantação
            </button>
          </div>
        </div>
      ) : null}

      {canReviewRequest ? (
        <div className="surface-card space-y-4 p-5">
          <div>
            <p className="section-eyebrow">Solicitar revisão</p>
            <h3 className="text-base font-semibold">Retornar fluxo para projeto/calculadora</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Motivo</label>
              <textarea className="premium-input min-h-24" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Etapa de retorno</label>
              <select className="premium-input" value={etapaRetorno} onChange={(event) => setEtapaRetorno(event.target.value as "projeto" | "calculadora")}>
                <option value="projeto">Projeto</option>
                <option value="calculadora">Calculadora</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Comentários</label>
              <input className="premium-input" value={comentarios} onChange={(event) => setComentarios(event.target.value)} />
            </div>
          </div>
          <button type="button" className="premium-button" disabled={saving} onClick={() => void solicitarRevisao()}>
            {saving ? "Enviando..." : "Solicitar revisão"}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="alert-error">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert-success">
          {success}
        </div>
      ) : null}

      <div className="surface-card p-5">
        <p className="mb-3 section-eyebrow">Histórico de revisões</p>
        {revisoes.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted))]">Nenhuma revisão registrada até o momento.</p>
        ) : (
          <div className="space-y-3">
            {revisoes.map((item) => (
              <div key={item.id} className="rounded-xl border border-[hsl(var(--border))] p-4">
                <p className="text-sm font-semibold">Revisão #{item.numero}</p>
                <p className="text-xs text-[hsl(var(--muted))]">Retorno para: {ETAPA_LABEL[item.etapa_retorno]}</p>
                <p className="mt-2 text-sm">{item.motivo}</p>
                {item.comentarios ? <p className="mt-2 text-xs text-[hsl(var(--muted))]">Comentário: {item.comentarios}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
