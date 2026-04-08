import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { inviteUserSchema } from "@/lib/validations"

function nameFromEmail(email: string) {
  const [localPart] = email.split("@")
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

async function syncMissingProfilesFromAuth() {
  let page = 1
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) {
      break
    }
    const users = data.users ?? []
    if (users.length === 0) {
      break
    }

    const ids = users.map((item) => item.id)
    const { data: existingProfiles } = await supabaseAdmin.from("profiles").select("id").in("id", ids)
    const existingIds = new Set((existingProfiles ?? []).map((item) => item.id))

    const missingUsers = users.filter((item) => !existingIds.has(item.id))
    if (missingUsers.length > 0) {
      const payload = missingUsers.map((item) => ({
        id: item.id,
        email: item.email ?? "",
        nome:
          (item.user_metadata?.nome as string | undefined) ??
          (item.email ? nameFromEmail(item.email) : "Usuário"),
        papel: "vendedor",
        ativo: true
      }))
      await supabaseAdmin.from("profiles").upsert(payload, { onConflict: "id" })
    }

    if (users.length < 200) {
      break
    }
    page += 1
  }
}

export async function GET() {
  const { role } = await getCurrentUserWithRole()

  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  await syncMissingProfilesFromAuth()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id,nome,email,papel,ativo,criado_em")
    .order("criado_em", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Falha ao listar usuários" }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const { role } = await getCurrentUserWithRole()

  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const rawBody = await request.json()
  const parsed = inviteUserSchema.safeParse(rawBody)

  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? parsed.error.flatten().formErrors[0] ?? "Dados inválidos"
    return NextResponse.json({ error: firstMessage }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL não configurada" }, { status: 500 })
  }

  const { nome, username, email, papel } = parsed.data

  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/primeiro-acesso`,
    data: { nome, username }
  })

  if (inviteError) {
    const status = inviteError.status ?? 400
    if (status === 429) {
      return NextResponse.json(
        { error: "Limite de envio de e-mails excedido no Supabase. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: inviteError.message }, { status })
  }

  const invitedUserId = inviteData.user?.id
  if (!invitedUserId) {
    return NextResponse.json({ error: "Convite criado sem ID de usuário retornado pelo Auth." }, { status: 500 })
  }

  const profileUpdateQuery = supabaseAdmin.from("profiles").upsert(
    {
      id: invitedUserId,
      nome,
      email,
      papel,
      ativo: true
    },
    { onConflict: "id" }
  )

  const { error: updateError } = await profileUpdateQuery

  if (updateError) {
    return NextResponse.json({ error: "Usuário convidado, mas perfil não foi atualizado" }, { status: 500 })
  }

  if (invitedUserId && username) {
    await supabaseAdmin.auth.admin.updateUserById(invitedUserId, {
      user_metadata: { nome, username }
    })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
