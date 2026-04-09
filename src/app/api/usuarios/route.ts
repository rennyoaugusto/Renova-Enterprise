import { NextResponse } from "next/server"

import { generateTemporaryPassword } from "@/lib/auth/generate-temp-password"
import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { sendWelcomeInviteViaResend } from "@/lib/email/send-invite-via-resend"
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

  const { nome, sobrenome, username, email, papel } = parsed.data
  const nomeCompleto = `${nome.trim()} ${sobrenome.trim()}`.trim()
  const temporaryPassword = generateTemporaryPassword()

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      nome: nomeCompleto,
      username,
      primeiro_acesso: true
    }
  })

  if (createError) {
    const status = createError.status ?? 400
    return NextResponse.json({ error: createError.message }, { status })
  }

  const newUserId = created.user?.id
  if (!newUserId) {
    return NextResponse.json({ error: "Usuário criado sem ID retornado pelo Auth." }, { status: 500 })
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: newUserId,
      nome: nomeCompleto,
      email,
      papel,
      ativo: true
    },
    { onConflict: "id" }
  )

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return NextResponse.json({ error: "Perfil não pôde ser criado. Usuário removido — tente novamente." }, { status: 500 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "")
  const loginUrl = `${base}/login`

  const emailResult = await sendWelcomeInviteViaResend(email, {
    recipientName: nomeCompleto,
    emailLogin: email,
    username,
    temporaryPassword,
    loginUrl
  })

  if (!emailResult.ok) {
    return NextResponse.json(
      {
        ok: true,
        emailSent: false,
        warning:
          "Conta criada, mas o e-mail não foi enviado. Sem domínio verificado no Resend, só é permitido enviar para o e-mail da sua conta Resend ou para endereços de teste (ex.: delivered@resend.dev). Veja o motivo abaixo.",
        emailError: emailResult.error
      },
      { status: 201 }
    )
  }

  return NextResponse.json({ ok: true, emailSent: true }, { status: 201 })
}
