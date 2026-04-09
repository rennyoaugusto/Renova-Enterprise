import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { updateUserSchema } from "@/lib/validations"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteParams = {
  params: { id: string }
}

/**
 * Remove vínculos do perfil e exclui o usuário no Auth (cascade remove profiles).
 * Validações em que o usuário era vendedor/analista/criador passam a apontar para `reassignToId` (admin que executa a exclusão).
 */
async function purgeUserAndDeleteAuth(
  userId: string,
  reassignToId: string
): Promise<{ error?: string }> {
  const { error: e1 } = await supabaseAdmin.from("validacao_log").delete().eq("usuario_id", userId)
  if (e1) {
    return { error: `Auditoria: ${e1.message}` }
  }

  const { error: e2 } = await supabaseAdmin.from("notificacoes").delete().eq("destinatario_id", userId)
  if (e2) {
    return { error: `Notificações: ${e2.message}` }
  }

  const { error: e3 } = await supabaseAdmin.from("validacao_revisoes").delete().eq("solicitante_id", userId)
  if (e3) {
    return { error: `Revisões: ${e3.message}` }
  }

  const { error: e4 } = await supabaseAdmin.from("validacao_anexos").delete().eq("enviado_por", userId)
  if (e4) {
    return { error: `Anexos: ${e4.message}` }
  }

  const { error: e5 } = await supabaseAdmin
    .from("validacao_etapas")
    .update({ concluida_por: null })
    .eq("concluida_por", userId)
  if (e5) {
    return { error: `Etapas: ${e5.message}` }
  }

  const { error: e6a } = await supabaseAdmin.from("validacoes").update({ cancelado_por: null }).eq("cancelado_por", userId)
  if (e6a) {
    return { error: `Validações: ${e6a.message}` }
  }
  const { error: e6b } = await supabaseAdmin.from("validacoes").update({ aprovado_por: null }).eq("aprovado_por", userId)
  if (e6b) {
    return { error: `Validações: ${e6b.message}` }
  }

  const { error: e7a } = await supabaseAdmin
    .from("validacoes")
    .update({ vendedor_id: reassignToId })
    .eq("vendedor_id", userId)
  if (e7a) {
    return { error: `Validações (vendedor): ${e7a.message}` }
  }
  const { error: e7b } = await supabaseAdmin
    .from("validacoes")
    .update({ analista_id: reassignToId })
    .eq("analista_id", userId)
  if (e7b) {
    return { error: `Validações (analista): ${e7b.message}` }
  }
  const { error: e7c } = await supabaseAdmin
    .from("validacoes")
    .update({ criado_por: reassignToId })
    .eq("criado_por", userId)
  if (e7c) {
    return { error: `Validações (criador): ${e7c.message}` }
  }

  const { error: e8 } = await supabaseAdmin
    .from("configuracoes")
    .update({ atualizado_por: null })
    .eq("atualizado_por", userId)
  if (e8) {
    return { error: `Configurações: ${e8.message}` }
  }

  const { error: e9 } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (e9) {
    return { error: e9.message }
  }

  return {}
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { role } = await getCurrentUserWithRole()

  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const rawBody = await request.json()
  const parsed = updateUserSchema.safeParse(rawBody)

  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? parsed.error.flatten().formErrors[0] ?? "Dados inválidos"
    return NextResponse.json({ error: firstMessage }, { status: 400 })
  }

  if (
    !parsed.data.papel &&
    typeof parsed.data.ativo !== "boolean" &&
    !parsed.data.nome &&
    !parsed.data.email &&
    !parsed.data.username
  ) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
  }

  const profilePayload: Record<string, unknown> = {}

  if (parsed.data.nome) profilePayload.nome = parsed.data.nome
  if (parsed.data.email) profilePayload.email = parsed.data.email
  if (parsed.data.papel) profilePayload.papel = parsed.data.papel
  if (typeof parsed.data.ativo === "boolean") profilePayload.ativo = parsed.data.ativo

  if (Object.keys(profilePayload).length > 0) {
    const { error } = await supabaseAdmin.from("profiles").update(profilePayload).eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 })
    }
  }

  if (parsed.data.email || parsed.data.username || parsed.data.nome) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(params.id, {
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
      user_metadata: {
        ...(parsed.data.nome ? { nome: parsed.data.nome } : {}),
        ...(parsed.data.username ? { username: parsed.data.username } : {})
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: `Perfil atualizado, mas dados de autenticação falharam: ${authError.message}` },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 })
  }

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (user.id === params.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 400 })
  }

  const { error: purgeError } = await purgeUserAndDeleteAuth(params.id, user.id)

  if (purgeError) {
    return NextResponse.json({ error: purgeError }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    mode: "removido",
    message:
      "Usuário removido. Validações em que ele figurava como vendedor, analista ou criador foram reatribuídas ao seu usuário."
  })
}
