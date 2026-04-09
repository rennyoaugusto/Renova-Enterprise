import { NextResponse } from "next/server"

import { buildAuthCallbackRecoveryUrl } from "@/lib/app-url"
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
          "Configure NEXT_PUBLIC_APP_URL (ex.: https://seu-dominio.com) e inclua a URL de callback nas Redirect URLs do Supabase."
      },
      { status: 500 }
    )
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .eq("id", params.id)
    .maybeSingle()

  if (profileError || !profile?.email) {
    return NextResponse.json({ error: "Usuário ou e-mail não encontrado" }, { status: 404 })
  }

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(profile.email, { redirectTo })

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        hint:
          "O e-mail é enviado pelo Supabase (Authentication → E-mail templates). Verifique SMTP do projeto e Redirect URLs com /api/auth/callback."
      },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: true, message: "E-mail de redefinição enviado." })
}
