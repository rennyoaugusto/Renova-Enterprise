import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { EtapaValidacao } from "@/types/validacao"

type RouteParams = {
  params: { id: string }
}

const FLOW: EtapaValidacao[] = ["kickoff", "vistoria", "projeto", "calculadora", "envio_comercial"]

function requiredFieldsByEtapa(etapa: EtapaValidacao): string[] {
  switch (etapa) {
    case "kickoff":
      return ["kickoff_ata", "kickoff_vendido", "kickoff_pontos_atencao", "kickoff_premissas", "kickoff_data_reuniao"]
    case "vistoria":
      return ["vistoria_data", "vistoria_resultado"]
    case "projeto":
      return ["projeto_descricao_tecnica"]
    case "calculadora":
      return ["calc_custo_equipamentos", "calc_custo_materiais", "calc_custo_mao_obra", "calc_justificativa"]
    case "envio_comercial":
      return ["envio_resumo_tecnico", "envio_justificativas"]
    default:
      return []
  }
}

async function getSlaDays(etapa: EtapaValidacao) {
  const configMap: Record<EtapaValidacao, string> = {
    kickoff: "sla_kickoff",
    vistoria: "sla_vistoria",
    projeto: "sla_projeto",
    calculadora: "sla_calculadora",
    envio_comercial: "sla_envio_comercial"
  }

  const { data } = await supabaseAdmin
    .from("configuracoes")
    .select("valor")
    .eq("chave", configMap[etapa])
    .maybeSingle()

  const parsed = Number(data?.valor ?? 2)
  return Number.isNaN(parsed) ? 2 : parsed
}

export async function POST(request: Request, { params }: RouteParams) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !["super_admin", "coordenador", "analista"].includes(role) || !user) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const rawBody = (await request.json().catch(() => ({}))) as { cancelarInviavel?: boolean }

  const { data: validacao, error: validacaoError } = await supabaseAdmin
    .from("validacoes")
    .select("id,etapa_atual,status,analista_id,numero_revisoes")
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada" }, { status: 404 })
  }
  if (["cancelado", "enviado_implantacao"].includes(validacao.status)) {
    return NextResponse.json({ error: "Validação encerrada. Não é possível avançar etapas." }, { status: 400 })
  }

  if (role === "analista" && validacao.analista_id !== user.id) {
    return NextResponse.json({ error: "Apenas o analista atribuído pode avançar esta validação." }, { status: 403 })
  }

  const etapaAtual = validacao.etapa_atual as EtapaValidacao
  const revisaoNumero = validacao.numero_revisoes ?? 0
  const { data: etapaData, error: etapaError } = await supabaseAdmin
    .from("validacao_etapas")
    .select("*")
    .eq("validacao_id", params.id)
    .eq("etapa", etapaAtual)
    .eq("revisao_numero", revisaoNumero)
    .maybeSingle()

  if (etapaError || !etapaData) {
    return NextResponse.json(
      { error: `Dados da etapa ${etapaAtual} não encontrados. Salve os dados antes de avançar.` },
      { status: 400 }
    )
  }

  const requiredFields = requiredFieldsByEtapa(etapaAtual)
  const missing = requiredFields.filter((field) => !etapaData[field])
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Campos obrigatórios pendentes para avançar: ${missing.join(", ")}` },
      { status: 400 }
    )
  }

  if (etapaAtual === "vistoria" && etapaData.vistoria_resultado === "inviavel") {
    if (!etapaData.vistoria_justificativa_inviavel) {
      return NextResponse.json(
        { error: "Resultado inviável exige justificativa obrigatória na vistoria." },
        { status: 400 }
      )
    }

    if (!rawBody.cancelarInviavel) {
      return NextResponse.json(
        { error: "Vistoria inviável: confirme cancelamento para encerrar validação." },
        { status: 400 }
      )
    }

    await supabaseAdmin
      .from("validacoes")
      .update({
        status: "cancelado",
        motivo_cancelamento: "inviabilidade_tecnica",
        justificativa_cancelamento: etapaData.vistoria_justificativa_inviavel,
        cancelado_por: user.id,
        cancelado_em: new Date().toISOString()
      })
      .eq("id", params.id)

    await supabaseAdmin.from("validacao_log").insert({
      validacao_id: params.id,
      usuario_id: user.id,
      acao: "cancelamento_por_inviabilidade",
      detalhes: { etapa: "vistoria", revisao_numero: revisaoNumero }
    })

    return NextResponse.json({ ok: true, encerrado: true, status: "cancelado" })
  }

  await supabaseAdmin
    .from("validacao_etapas")
    .update({
      concluida: true,
      concluida_em: new Date().toISOString(),
      concluida_por: user.id
    })
    .eq("id", etapaData.id)

  const currentIndex = FLOW.indexOf(etapaAtual)
  const nextEtapa = FLOW[currentIndex + 1]

  if (!nextEtapa) {
    await supabaseAdmin
      .from("validacoes")
      .update({ status: "aguardando_comercial", etapa_atual: "envio_comercial" })
      .eq("id", params.id)

    await supabaseAdmin.from("validacao_log").insert({
      validacao_id: params.id,
      usuario_id: user.id,
      acao: "envio_ao_comercial",
      detalhes: { etapa_origem: etapaAtual }
    })

    return NextResponse.json({ ok: true, nextEtapa: null, status: "aguardando_comercial" })
  }

  const slaDays = await getSlaDays(nextEtapa)
  const now = new Date()
  const limit = new Date(now)
  limit.setDate(limit.getDate() + slaDays)

  const { data: nextEtapaExists } = await supabaseAdmin
    .from("validacao_etapas")
    .select("id")
    .eq("validacao_id", params.id)
    .eq("etapa", nextEtapa)
    .eq("revisao_numero", revisaoNumero)
    .maybeSingle()

  if (!nextEtapaExists) {
    await supabaseAdmin.from("validacao_etapas").insert({
      validacao_id: params.id,
      etapa: nextEtapa,
      revisao_numero: revisaoNumero,
      concluida: false,
      sla_inicio: now.toISOString(),
      sla_limite: limit.toISOString()
    })
  }

  await supabaseAdmin.from("validacoes").update({ etapa_atual: nextEtapa }).eq("id", params.id)

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: params.id,
    usuario_id: user.id,
    acao: "avancar_etapa",
    detalhes: { etapa_origem: etapaAtual, etapa_destino: nextEtapa, sla_dias: slaDays, revisao_numero: revisaoNumero }
  })

  return NextResponse.json({ ok: true, nextEtapa, status: "em_validacao" })
}
