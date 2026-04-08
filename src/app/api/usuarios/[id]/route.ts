import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { updateUserSchema } from "@/lib/validations"

type RouteParams = {
  params: { id: string }
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

  if (user?.id === params.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id)

  if (error) {
    return NextResponse.json({ error: "Falha ao excluir usuário" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
