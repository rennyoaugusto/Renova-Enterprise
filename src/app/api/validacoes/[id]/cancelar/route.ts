import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"

type RouteParams = {
  params: { id: string }
}

type CancelPayload = {
  motivo?: "inviabilidade_tecnica" | "desistencia_cliente" | "custo_inviavel" | "outro"
  justificativa?: string
}

export async function POST(request: Request, { params }: RouteParams) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !user || !["comercial", ...ADMIN_ROLES].includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as CancelPayload
  const motivo = body.motivo ?? "outro"
  const justificativa = body.justificativa?.trim()

  if (!justificativa || justificativa.length < 8) {
    return NextResponse.json({ error: "Informe justificativa de cancelamento com pelo menos 8 caracteres." }, { status: 400 })
  }

  const { data: validacao, error: validacaoError } = await supabaseAdmin
    .from("validacoes")
    .select("id,status,nome_cliente,analista_id,vendedor_id")
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada." }, { status: 404 })
  }

  if (["cancelado", "enviado_implantacao"].includes(validacao.status)) {
    return NextResponse.json({ error: "Esta validação já foi encerrada e não pode ser cancelada." }, { status: 400 })
  }

  const { error: updateError } = await supabaseAdmin
    .from("validacoes")
    .update({
      status: "cancelado",
      motivo_cancelamento: motivo,
      justificativa_cancelamento: justificativa,
      cancelado_por: user.id,
      cancelado_em: new Date().toISOString()
    })
    .eq("id", validacao.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: validacao.id,
    usuario_id: user.id,
    acao: "cancelar_validacao",
    detalhes: { motivo, justificativa }
  })

  await supabaseAdmin.from("notificacoes").insert([
    {
      destinatario_id: validacao.analista_id,
      tipo: "validacao_cancelada",
      titulo: "Validação cancelada",
      mensagem: `A validação de ${validacao.nome_cliente} foi cancelada.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    },
    {
      destinatario_id: validacao.vendedor_id,
      tipo: "validacao_cancelada",
      titulo: "Validação cancelada",
      mensagem: `A validação de ${validacao.nome_cliente} foi cancelada.`,
      referencia_tipo: "validacao",
      referencia_id: validacao.id
    }
  ])

  return NextResponse.json({ ok: true, status: "cancelado" })
}
