"use client"

import { useEffect, useState } from "react"

type ConfigRow = {
  id?: string
  chave: string
  valor: unknown
  descricao: string | null
}

type FormRow = {
  chave: string
  valorText: string
  descricao: string
}

function serializeValue(value: unknown) {
  if (typeof value === "string") return value
  return JSON.stringify(value)
}

function parseValue(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  try {
    return JSON.parse(trimmed)
  } catch {
    return trimmed
  }
}

export function ConfiguracoesForm() {
  const [rows, setRows] = useState<FormRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const response = await fetch("/api/configuracoes", { cache: "no-store" })
    const body = await response.json()
    if (!response.ok) {
      setError(body.error ?? "Falha ao carregar configurações.")
      setLoading(false)
      return
    }
    const parsed = ((body.data ?? []) as ConfigRow[]).map((item) => ({
      chave: item.chave,
      valorText: serializeValue(item.valor),
      descricao: item.descricao ?? ""
    }))
    setRows(parsed)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  function updateRow(index: number, patch: Partial<FormRow>) {
    setRows((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)))
  }

  async function save() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updates = rows.map((item) => ({
        chave: item.chave,
        valor: parseValue(item.valorText),
        descricao: item.descricao || null
      }))
      const response = await fetch("/api/configuracoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Falha ao salvar configurações.")
        return
      }
      setSuccess("Configurações salvas com sucesso.")
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-[hsl(var(--muted))]">Carregando configurações...</p>
  }

  return (
    <section className="surface-card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Parâmetros globais</p>
          <h2 className="text-lg font-semibold">SLA, limites e regras</h2>
        </div>
        <button type="button" className="premium-button" onClick={() => void save()} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

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

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.chave} className="rounded-xl border border-[hsl(var(--border))] p-4">
            <p className="text-sm font-semibold">{row.chave}</p>
            <p className="mb-3 text-xs text-[hsl(var(--muted))]">{row.descricao || "Sem descrição"}</p>
            <textarea
              className="premium-input min-h-16"
              value={row.valorText}
              onChange={(event) => updateRow(index, { valorText: event.target.value })}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
