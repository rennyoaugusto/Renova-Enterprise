import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { EtapaValidacao, ValidacaoDetalhe, ValidacaoEtapa } from "@/types/validacao"

type RouteParams = {
  params: { id: string }
}

function getJoinedName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0] as { nome?: string } | undefined
    return first?.nome ?? null
  }
  const single = value as { nome?: string } | null
  return single?.nome ?? null
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { role } = await getCurrentUserWithRole()

  if (!role) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("validacoes")
    .select(
      "id,nome_cliente,tipo_projeto,tipo_projeto_descricao,modelo_comercial,status,etapa_atual,numero_revisoes,venda_valor_total,locacao_valor_total,custo_prev_total,custo_rev_total,criado_em,atualizado_em,vendedor:profiles!validacoes_vendedor_id_fkey(nome),analista:profiles!validacoes_analista_id_fkey(nome)"
    )
    .eq("id", params.id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Validação não encontrada" }, { status: 404 })
  }

  const { data: etapasData, error: etapasError } = await supabase
    .from("validacao_etapas")
    .select("*")
    .eq("validacao_id", params.id)
    .eq("revisao_numero", data.numero_revisoes ?? 0)
    .order("criado_em", { ascending: true })

  if (etapasError) {
    return NextResponse.json({ error: "Falha ao carregar etapas" }, { status: 500 })
  }

  const parsed: ValidacaoDetalhe = {
    ...data,
    venda_valor_total: data.venda_valor_total ?? null,
    locacao_valor_total: data.locacao_valor_total ?? null,
    custo_prev_total: data.custo_prev_total ?? null,
    custo_rev_total: data.custo_rev_total ?? null,
    vendedor_nome: getJoinedName(data.vendedor),
    analista_nome: getJoinedName(data.analista),
    etapas: (etapasData ?? []) as ValidacaoEtapa[]
  }

  return NextResponse.json({ data: parsed })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !["super_admin", "coordenador", "analista"].includes(role) || !user) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const rawBody = (await request.json()) as { etapa?: EtapaValidacao; data?: Record<string, unknown> }

  if (!rawBody.etapa || !rawBody.data || typeof rawBody.data !== "object") {
    return NextResponse.json({ error: "Payload inválido para atualização de etapa" }, { status: 400 })
  }
  const dataPayload = rawBody.data as Record<string, unknown>
  const { data: validacao, error: validacaoError } = await supabaseAdmin
    .from("validacoes")
    .select("id,analista_id,numero_revisoes,status")
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada" }, { status: 404 })
  }

  if (role === "analista" && validacao.analista_id !== user.id) {
    return NextResponse.json({ error: "Apenas o analista atribuído pode salvar essa etapa." }, { status: 403 })
  }
  if (["cancelado", "enviado_implantacao"].includes(validacao.status)) {
    return NextResponse.json({ error: "Validação encerrada. Não é possível editar etapas." }, { status: 400 })
  }
  const revisaoNumero = validacao.numero_revisoes ?? 0

  const allowedFieldsByEtapa: Record<EtapaValidacao, string[]> = {
    kickoff: [
      "kickoff_ata",
      "kickoff_vendido",
      "kickoff_pontos_atencao",
      "kickoff_premissas",
      "kickoff_data_reuniao"
    ],
    vistoria: [
      "vistoria_observacoes",
      "vistoria_comentarios",
      "vistoria_data",
      "vistoria_resultado",
      "vistoria_justificativa_inviavel"
    ],
    projeto: ["projeto_descricao_tecnica", "projeto_ajustes_escopo", "projeto_comentarios"],
    calculadora: ["calc_custo_equipamentos", "calc_custo_materiais", "calc_custo_mao_obra", "calc_justificativa"],
    envio_comercial: ["envio_resumo_tecnico", "envio_justificativas", "envio_comentarios"]
  }

  const etapaFields = allowedFieldsByEtapa[rawBody.etapa]
  const etapaPayload: Record<string, unknown> = {}
  etapaFields.forEach((field) => {
    if (field in dataPayload) {
      etapaPayload[field] = dataPayload[field] ?? null
    }
  })

  if (Object.keys(etapaPayload).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido para salvar na etapa." }, { status: 400 })
  }

  const { data: existingEtapa } = await supabaseAdmin
    .from("validacao_etapas")
    .select("id")
    .eq("validacao_id", params.id)
    .eq("etapa", rawBody.etapa)
    .eq("revisao_numero", revisaoNumero)
    .maybeSingle()

  if (existingEtapa) {
    const { error: updateError } = await supabaseAdmin
      .from("validacao_etapas")
      .update(etapaPayload)
      .eq("id", existingEtapa.id)

    if (updateError) {
      return NextResponse.json({ error: "Falha ao salvar dados da etapa" }, { status: 500 })
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from("validacao_etapas").insert({
      validacao_id: params.id,
      etapa: rawBody.etapa,
      revisao_numero: revisaoNumero,
      ...etapaPayload
    })

    if (insertError) {
      return NextResponse.json({ error: "Falha ao criar dados da etapa" }, { status: 500 })
    }
  }

  if (rawBody.etapa === "calculadora") {
    await supabaseAdmin
      .from("validacoes")
      .update({
        custo_rev_equipamentos: dataPayload.calc_custo_equipamentos ?? null,
        custo_rev_materiais: dataPayload.calc_custo_materiais ?? null,
        custo_rev_mao_obra: dataPayload.calc_custo_mao_obra ?? null
      })
      .eq("id", params.id)
  }

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: params.id,
    usuario_id: user.id,
    acao: "salvar_dados_etapa",
    detalhes: { etapa: rawBody.etapa, campos: Object.keys(etapaPayload), revisao_numero: revisaoNumero }
  })

  return NextResponse.json({ ok: true })
}
