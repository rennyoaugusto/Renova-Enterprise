import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { createValidacaoSchema } from "@/lib/validations"
import type { ValidacaoListItem } from "@/types/validacao"

function getJoinedName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0] as { nome?: string } | undefined
    return first?.nome ?? null
  }
  const single = value as { nome?: string } | null
  return single?.nome ?? null
}

export async function GET(request: Request) {
  const { role } = await getCurrentUserWithRole()

  if (!role) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("mode")
  const search = searchParams.get("search")
  const status = searchParams.get("status")
  const etapa = searchParams.get("etapa")

  const supabase = await createClient()

  if (mode === "options") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,nome,papel,ativo")
      .in("papel", ["vendedor", "analista"])
      .eq("ativo", true)
      .order("nome", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Falha ao carregar opções do formulário" }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        vendedores: (data ?? []).filter((item) => item.papel === "vendedor"),
        analistas: (data ?? []).filter((item) => item.papel === "analista")
      }
    })
  }

  let query = supabase
    .from("validacoes")
    .select(
      "id,nome_cliente,tipo_projeto,modelo_comercial,status,etapa_atual,numero_revisoes,venda_valor_mao_obra,locacao_valor_mensal,venda_valor_total,locacao_valor_total,custo_prev_total,custo_rev_total,atualizado_em,vendedor_id,analista_id,vendedor:profiles!validacoes_vendedor_id_fkey(nome),analista:profiles!validacoes_analista_id_fkey(nome)"
    )
    .order("atualizado_em", { ascending: false })

  if (search) {
    query = query.ilike("nome_cliente", `%${search}%`)
  }

  if (status && status !== "todos") {
    query = query.eq("status", status)
  }

  if (etapa && etapa !== "todas") {
    query = query.eq("etapa_atual", etapa)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: "Falha ao listar validações" }, { status: 500 })
  }

  const parsedData: ValidacaoListItem[] = (data ?? []).map((item) => ({
    ...item,
    venda_valor_mao_obra: item.venda_valor_mao_obra ?? null,
    locacao_valor_mensal: item.locacao_valor_mensal ?? null,
    venda_valor_total: item.venda_valor_total ?? null,
    locacao_valor_total: item.locacao_valor_total ?? null,
    custo_prev_total: item.custo_prev_total ?? null,
    custo_rev_total: item.custo_rev_total ?? null,
    vendedor_nome: getJoinedName(item.vendedor),
    analista_nome: getJoinedName(item.analista)
  }))

  return NextResponse.json({ data: parsedData })
}

export async function POST(request: Request) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !["super_admin", "coordenador", "analista", "vendedor"].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  if (!user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  const rawBody = await request.json()
  const parsed = createValidacaoSchema.safeParse(rawBody)

  if (!parsed.success) {
    const firstMessage = parsed.error.issues[0]?.message ?? "Dados inválidos para registrar venda"
    return NextResponse.json({ error: firstMessage }, { status: 400 })
  }

  const payload = parsed.data
  const valorTotal =
    payload.modelo_comercial === "venda"
      ? (payload.venda_valor_equipamentos ?? 0) + (payload.venda_valor_materiais ?? 0) + (payload.venda_valor_mao_obra ?? 0)
      : (payload.locacao_valor_mensal ?? 0) * (payload.locacao_prazo_meses ?? 0) + (payload.locacao_custo_inicial ?? 0)
  const custoTotal = payload.custo_prev_equipamentos + payload.custo_prev_materiais + payload.custo_prev_mao_obra
  const margemPercentual = valorTotal > 0 ? ((valorTotal - custoTotal) / valorTotal) * 100 : 0

  if (margemPercentual <= 0 && !ADMIN_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Margem menor ou igual a zero exige aprovação de Coordenador para salvar." },
      { status: 400 }
    )
  }

  if (margemPercentual < 15 && !payload.justificativa_margem?.trim()) {
    return NextResponse.json({ error: "Informe justificativa para margem abaixo de 15%." }, { status: 400 })
  }

  const { data: selectedProfiles, error: selectedProfilesError } = await supabaseAdmin
    .from("profiles")
    .select("id,papel,ativo")
    .in("id", [payload.vendedor_id, payload.analista_id])

  if (selectedProfilesError) {
    return NextResponse.json({ error: "Falha ao validar vendedor e analista selecionados." }, { status: 500 })
  }

  const vendedorProfile = (selectedProfiles ?? []).find((item) => item.id === payload.vendedor_id)
  const analistaProfile = (selectedProfiles ?? []).find((item) => item.id === payload.analista_id)

  if (!vendedorProfile || !vendedorProfile.ativo) {
    return NextResponse.json(
      { error: "Vendedor selecionado não existe ou está inativo. Atualize a página e selecione um vendedor válido." },
      { status: 400 }
    )
  }

  if (!analistaProfile || !analistaProfile.ativo) {
    return NextResponse.json(
      { error: "Analista selecionado não existe ou está inativo. Atualize a página e selecione um analista válido." },
      { status: 400 }
    )
  }

  if (!["vendedor", "coordenador", "super_admin"].includes(vendedorProfile.papel)) {
    return NextResponse.json({ error: "Perfil selecionado como vendedor não possui papel permitido." }, { status: 400 })
  }

  if (!["analista", "coordenador", "super_admin"].includes(analistaProfile.papel)) {
    return NextResponse.json({ error: "Perfil selecionado como analista não possui papel permitido." }, { status: 400 })
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("validacoes")
    .insert({
      nome_cliente: payload.nome_cliente,
      tipo_projeto: payload.tipo_projeto,
      tipo_projeto_descricao: payload.tipo_projeto_descricao ?? null,
      vendedor_id: payload.vendedor_id,
      analista_id: payload.analista_id,
      criado_por: user.id,
      modelo_comercial: payload.modelo_comercial,
      venda_valor_equipamentos: payload.venda_valor_equipamentos ?? null,
      venda_valor_materiais: payload.venda_valor_materiais ?? null,
      venda_valor_mao_obra: payload.venda_valor_mao_obra ?? null,
      locacao_prazo_meses: payload.locacao_prazo_meses ?? null,
      locacao_valor_mensal: payload.locacao_valor_mensal ?? null,
      locacao_custo_inicial: payload.locacao_custo_inicial ?? null,
      custo_prev_equipamentos: payload.custo_prev_equipamentos,
      custo_prev_materiais: payload.custo_prev_materiais,
      custo_prev_mao_obra: payload.custo_prev_mao_obra,
      status: "em_validacao",
      etapa_atual: "kickoff",
      numero_revisoes: 0
    })
    .select("id")
    .single()

  if (insertError || !inserted) {
    return NextResponse.json({ error: insertError?.message ?? "Falha ao criar validação" }, { status: 500 })
  }

  const { data: slaConfig } = await supabaseAdmin
    .from("configuracoes")
    .select("valor")
    .eq("chave", "sla_kickoff")
    .maybeSingle()
  const slaDias = Number(slaConfig?.valor ?? 2)
  const slaLimite = new Date()
  slaLimite.setDate(slaLimite.getDate() + (Number.isNaN(slaDias) ? 2 : slaDias))

  await supabaseAdmin.from("validacao_etapas").insert({
    validacao_id: inserted.id,
    etapa: "kickoff",
    revisao_numero: 0,
    concluida: false,
    sla_inicio: new Date().toISOString(),
    sla_limite: slaLimite.toISOString()
  })

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: inserted.id,
    usuario_id: user.id,
    acao: "criacao_validacao",
    detalhes: {
      margem_percentual: margemPercentual,
      justificativa_margem: payload.justificativa_margem ?? null
    }
  })

  await supabaseAdmin.from("notificacoes").insert({
    destinatario_id: payload.analista_id,
    tipo: "nova_venda",
    titulo: "Nova validação atribuída",
    mensagem: `Nova validação criada para ${payload.nome_cliente}.`,
    referencia_tipo: "validacao",
    referencia_id: inserted.id,
    enviar_email: false
  })

  return NextResponse.json({
    ok: true,
    data: {
      id: inserted.id,
      margem_percentual: margemPercentual
    }
  })
}
