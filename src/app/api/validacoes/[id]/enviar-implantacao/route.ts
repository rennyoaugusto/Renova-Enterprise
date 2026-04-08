import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"

type RouteParams = {
  params: { id: string }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !user || !["comercial", ...ADMIN_ROLES].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { data: validacao, error: validacaoError } = await supabaseAdmin
    .from("validacoes")
    .select(
      "id,nome_cliente,tipo_projeto,tipo_projeto_descricao,status,analista_id,vendedor_id,custo_rev_equipamentos,custo_rev_materiais,custo_rev_mao_obra,custo_prev_total,custo_rev_total"
    )
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada." }, { status: 404 })
  }

  if (validacao.status !== "aprovado") {
    return NextResponse.json({ error: "Apenas validações aprovadas podem ser enviadas para implantação." }, { status: 400 })
  }

  const { data: anexos, error: anexosError } = await supabaseAdmin
    .from("validacao_anexos")
    .select("id,categoria,versao")
    .eq("validacao_id", validacao.id)
    .in("categoria", ["calculadora_inicial", "carta_implantacao", "ci_implantacao"])

  if (anexosError) {
    return NextResponse.json({ error: "Falha ao validar anexos obrigatórios." }, { status: 500 })
  }

  const categorias = new Set((anexos ?? []).map((item) => item.categoria))
  if (!categorias.has("calculadora_inicial")) {
    return NextResponse.json({ error: "Anexo obrigatório pendente: calculadora inicial." }, { status: 400 })
  }
  if (!categorias.has("carta_implantacao") && !categorias.has("ci_implantacao")) {
    return NextResponse.json(
      { error: "Anexo obrigatório pendente: C.I (envie como categoria carta_implantacao ou ci_implantacao)." },
      { status: 400 }
    )
  }

  const { error: statusError } = await supabaseAdmin
    .from("validacoes")
    .update({
      status: "enviado_implantacao"
    })
    .eq("id", validacao.id)

  if (statusError) {
    return NextResponse.json({ error: statusError.message }, { status: 500 })
  }

  const { data: obraExistente, error: obraExistenteError } = await supabaseAdmin
    .from("obras")
    .select("id")
    .eq("validacao_id", validacao.id)
    .maybeSingle()

  if (obraExistenteError) {
    return NextResponse.json({ error: "Falha ao validar obra de implantação." }, { status: 500 })
  }

  if (!obraExistente) {
    const custoFinalEquip = validacao.custo_rev_equipamentos ?? null
    const custoFinalMat = validacao.custo_rev_materiais ?? null
    const custoFinalMao = validacao.custo_rev_mao_obra ?? null
    const custoFinalTotal =
      validacao.custo_rev_total && validacao.custo_rev_total > 0 ? validacao.custo_rev_total : validacao.custo_prev_total

    const { error: obraInsertError } = await supabaseAdmin.from("obras").insert({
      validacao_id: validacao.id,
      nome_cliente: validacao.nome_cliente,
      tipo_projeto: validacao.tipo_projeto,
      tipo_projeto_descricao: validacao.tipo_projeto_descricao ?? null,
      custo_final_equipamentos: custoFinalEquip,
      custo_final_materiais: custoFinalMat,
      custo_final_mao_obra: custoFinalMao,
      custo_final_total: custoFinalTotal
    })
    if (obraInsertError) {
      return NextResponse.json({ error: "Falha ao criar obra de implantação." }, { status: 500 })
    }
  }

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: validacao.id,
    usuario_id: user.id,
    acao: "enviar_implantacao",
    detalhes: { anexos_obrigatorios_ok: true }
  })

  await supabaseAdmin.from("notificacoes").insert([
    {
      destinatario_id: validacao.analista_id,
      tipo: "enviado_implantacao",
      titulo: "Validação enviada para implantação",
      mensagem: `A validação de ${validacao.nome_cliente} foi encaminhada para implantação.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    },
    {
      destinatario_id: validacao.vendedor_id,
      tipo: "enviado_implantacao",
      titulo: "Validação enviada para implantação",
      mensagem: `A validação de ${validacao.nome_cliente} foi encaminhada para implantação.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    }
  ])

  return NextResponse.json({ ok: true, status: "enviado_implantacao" })
}
