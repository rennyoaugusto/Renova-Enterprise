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
    .select("id,status,nome_cliente,analista_id,vendedor_id")
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada." }, { status: 404 })
  }

  if (!["aguardando_comercial", "em_revisao"].includes(validacao.status)) {
    return NextResponse.json({ error: "Somente validações em fila comercial podem ser aprovadas." }, { status: 400 })
  }

  const { error: updateError } = await supabaseAdmin
    .from("validacoes")
    .update({
      status: "aprovado",
      aprovado_por: user.id,
      aprovado_em: new Date().toISOString()
    })
    .eq("id", validacao.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: validacao.id,
    usuario_id: user.id,
    acao: "aprovar_validacao",
    detalhes: { status_anterior: validacao.status }
  })

  await supabaseAdmin.from("notificacoes").insert([
    {
      destinatario_id: validacao.analista_id,
      tipo: "validacao_aprovada",
      titulo: "Validação aprovada",
      mensagem: `A validação de ${validacao.nome_cliente} foi aprovada pelo comercial.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    },
    {
      destinatario_id: validacao.vendedor_id,
      tipo: "validacao_aprovada",
      titulo: "Validação aprovada",
      mensagem: `A validação de ${validacao.nome_cliente} foi aprovada.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    }
  ])

  return NextResponse.json({ ok: true, status: "aprovado" })
}
