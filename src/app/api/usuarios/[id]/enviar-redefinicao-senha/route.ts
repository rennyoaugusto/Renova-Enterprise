import { NextResponse } from "next/server"

import { buildAuthCallbackRecoveryUrl } from "@/lib/app-url"
import { sendRecoveryEmailViaResend } from "@/lib/email/send-recovery-via-resend"
import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/admin"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteParams = {
  params: { id: string }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { role } = await getCurrentUserWithRole()

  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 })
  }

  const redirectTo = buildAuthCallbackRecoveryUrl()
  if (!redirectTo) {
    return NextResponse.json(
      {
        error:
          "Configure NEXT_PUBLIC_APP_URL (ex.: https://pilar-system-8ywy.vercel.app) para gerar o link de redefinição."
      },
      { status: 500 }
    )
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("email,nome")
    .eq("id", params.id)
    .maybeSingle()

  if (profileError || !profile?.email) {
    return NextResponse.json({ error: "Usuário ou e-mail não encontrado" }, { status: 404 })
  }

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: profile.email,
    options: { redirectTo }
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: linkError?.message ?? "Não foi possível gerar o link de recuperação" },
      { status: 500 }
    )
  }

  const actionLink = linkData.properties.action_link
  const sent = await sendRecoveryEmailViaResend(actionLink, profile.nome ?? undefined)

  if (!sent.ok) {
    return NextResponse.json(
      {
        error: sent.error,
        hint:
          "Configure RESEND_API_KEY e RESEND_FROM_EMAIL no Vercel. No Supabase: Authentication → URL Configuration (Site URL e Redirect URLs com sua URL de produção) e o template em email-templates/supabase-reset-password.html."
      },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: true, message: "E-mail de redefinição enviado." })
}
