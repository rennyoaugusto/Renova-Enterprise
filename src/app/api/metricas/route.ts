import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/server"

function daysFromPeriod(periodo: string | null) {
  if (periodo === "7") return 7
  if (periodo === "30") return 30
  if (periodo === "90") return 90
  return null
}

export async function GET(request: Request) {
  const { role } = await getCurrentUserWithRole()
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const analistaId = searchParams.get("analista")
  const periodDays = daysFromPeriod(searchParams.get("periodo"))

  const supabase = await createClient()
  let query = supabase
    .from("validacoes")
    .select(
      "id,status,etapa_atual,modelo_comercial,analista_id,atualizado_em,criado_em,venda_valor_total,locacao_valor_total,custo_prev_total,custo_rev_total,analista:profiles!validacoes_analista_id_fkey(nome)"
    )
    .order("criado_em", { ascending: false })

  if (analistaId && analistaId !== "todos") {
    query = query.eq("analista_id", analistaId)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: "Falha ao carregar métricas" }, { status: 500 })
  }

  let items = data ?? []
  if (periodDays !== null) {
    const limitDate = Date.now() - periodDays * 24 * 60 * 60 * 1000
    items = items.filter((item) => new Date(item.criado_em).getTime() >= limitDate)
  }

  const total = items.length
  const byStatus = {
    em_validacao: items.filter((i) => i.status === "em_validacao").length,
    aguardando_comercial: items.filter((i) => i.status === "aguardando_comercial").length,
    em_revisao: items.filter((i) => i.status === "em_revisao").length,
    aprovado: items.filter((i) => i.status === "aprovado").length,
    enviado_implantacao: items.filter((i) => i.status === "enviado_implantacao").length,
    cancelado: items.filter((i) => i.status === "cancelado").length
  }

  const byEtapa = {
    kickoff: items.filter((i) => i.etapa_atual === "kickoff").length,
    vistoria: items.filter((i) => i.etapa_atual === "vistoria").length,
    projeto: items.filter((i) => i.etapa_atual === "projeto").length,
    calculadora: items.filter((i) => i.etapa_atual === "calculadora").length,
    envio_comercial: items.filter((i) => i.etapa_atual === "envio_comercial").length
  }

  const values = items.map((item) => {
    const valor = item.modelo_comercial === "locacao" ? item.locacao_valor_total ?? 0 : item.venda_valor_total ?? 0
    const custo = item.custo_rev_total && item.custo_rev_total > 0 ? item.custo_rev_total : item.custo_prev_total ?? 0
    const margem = valor > 0 ? ((valor - custo) / valor) * 100 : 0
    return { valor, margem }
  })

  const valorTotal = values.reduce((acc, item) => acc + item.valor, 0)
  const margemMedia = values.length ? values.reduce((acc, item) => acc + item.margem, 0) / values.length : 0
  const slaEstourado = items.filter((item) => Date.now() - new Date(item.atualizado_em).getTime() > 96 * 60 * 60 * 1000).length

  const analistas = Array.from(
    new Map(
      items.map((item) => {
        const raw = item.analista as { nome?: string }[] | { nome?: string } | null
        const nome = Array.isArray(raw) ? raw[0]?.nome : raw?.nome
        return [item.analista_id, { id: item.analista_id, nome: nome ?? "Sem nome" }]
      })
    ).values()
  )

  return NextResponse.json({
    data: {
      total,
      byStatus,
      byEtapa,
      valorTotal,
      margemMedia,
      slaEstourado,
      analistas
    }
  })
}
