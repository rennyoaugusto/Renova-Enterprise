import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { EtapaValidacao } from "@/types/validacao"

type RouteParams = {
  params: { id: string }
}

type RevisaoPayload = {
  motivo?: string
  etapa_retorno?: EtapaValidacao
  comentarios?: string
}

const ALLOWED_ETAPA_RETORNO: EtapaValidacao[] = ["projeto", "calculadora"]

async function readMaxRevisoes() {
  const { data } = await supabaseAdmin.from("configuracoes").select("valor").eq("chave", "max_revisoes").maybeSingle()
  const parsed = Number(data?.valor ?? 5)
  return Number.isFinite(parsed) ? parsed : 5
}

export async function POST(request: Request, { params }: RouteParams) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !user || !["comercial", ...ADMIN_ROLES].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as RevisaoPayload
  const motivo = body.motivo?.trim()
  const etapaRetorno = body.etapa_retorno
  const comentarios = body.comentarios?.trim() || null

  if (!motivo || motivo.length < 8) {
    return NextResponse.json({ error: "Informe um motivo de revisão com pelo menos 8 caracteres." }, { status: 400 })
  }

  if (!etapaRetorno || !ALLOWED_ETAPA_RETORNO.includes(etapaRetorno)) {
    return NextResponse.json({ error: "Etapa de retorno inválida. Use Projeto ou Calculadora." }, { status: 400 })
  }

  const { data: validacao, error: validacaoError } = await supabaseAdmin
    .from("validacoes")
    .select("id,status,numero_revisoes,nome_cliente,analista_id,vendedor_id")
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada." }, { status: 404 })
  }

  if (!["aguardando_comercial", "aprovado"].includes(validacao.status)) {
    return NextResponse.json(
      { error: "Revisão só pode ser solicitada quando a validação estiver aguardando comercial ou aprovada." },
      { status: 400 }
    )
  }

  const maxRevisoes = await readMaxRevisoes()
  const proximaRevisao = (validacao.numero_revisoes ?? 0) + 1
  if (proximaRevisao > maxRevisoes && !ADMIN_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Limite de ${maxRevisoes} revisões atingido. Solicite ação de coordenador/super admin.` },
      { status: 400 }
    )
  }

  const { error: revisaoError } = await supabaseAdmin.from("validacao_revisoes").insert({
    validacao_id: validacao.id,
    numero: proximaRevisao,
    solicitante_id: user.id,
    motivo,
    etapa_retorno: etapaRetorno,
    comentarios
  })

  if (revisaoError) {
    return NextResponse.json({ error: revisaoError.message }, { status: 500 })
  }

  const { data: currentEtapa, error: currentEtapaError } = await supabaseAdmin
    .from("validacao_etapas")
    .select("id")
    .eq("validacao_id", validacao.id)
    .eq("etapa", etapaRetorno)
    .eq("revisao_numero", proximaRevisao)
    .maybeSingle()

  if (currentEtapaError) {
    return NextResponse.json({ error: "Falha ao preparar etapa de retorno." }, { status: 500 })
  }

  if (!currentEtapa) {
    const now = new Date()
    const limit = new Date(now)
    limit.setDate(limit.getDate() + 2)
    const { error: etapaInsertError } = await supabaseAdmin.from("validacao_etapas").insert({
      validacao_id: validacao.id,
      etapa: etapaRetorno,
      revisao_numero: proximaRevisao,
      concluida: false,
      sla_inicio: now.toISOString(),
      sla_limite: limit.toISOString()
    })
    if (etapaInsertError) {
      return NextResponse.json({ error: "Falha ao criar etapa da revisão." }, { status: 500 })
    }
  }

  const { error: validacaoUpdateError } = await supabaseAdmin
    .from("validacoes")
    .update({
      status: "em_revisao",
      etapa_atual: etapaRetorno,
      numero_revisoes: proximaRevisao
    })
    .eq("id", validacao.id)

  if (validacaoUpdateError) {
    return NextResponse.json({ error: "Falha ao atualizar status da validação." }, { status: 500 })
  }

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: validacao.id,
    usuario_id: user.id,
    acao: "solicitar_revisao",
    detalhes: {
      revisao_numero: proximaRevisao,
      etapa_retorno: etapaRetorno,
      motivo
    }
  })

  await supabaseAdmin.from("notificacoes").insert([
    {
      destinatario_id: validacao.analista_id,
      tipo: "revisao_solicitada",
      titulo: "Revisão solicitada",
      mensagem: `Validação de ${validacao.nome_cliente} retornou para ${etapaRetorno}.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    },
    {
      destinatario_id: validacao.vendedor_id,
      tipo: "revisao_solicitada",
      titulo: "Revisão solicitada",
      mensagem: `Comercial solicitou revisão na validação de ${validacao.nome_cliente}.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    }
  ])

  return NextResponse.json({ ok: true, revisao_numero: proximaRevisao, etapa_atual: etapaRetorno, status: "em_revisao" })
}
