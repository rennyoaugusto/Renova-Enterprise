import { buildRenovaWelcomeInviteEmailHtml } from "@/lib/email/renova-welcome-invite-email"
import { formatResendError } from "@/lib/email/resend-errors"
import { createResendClient, defaultResendFrom } from "@/lib/email/resend-server"

type SendResult = { ok: true } | { ok: false; error: string }

export async function sendWelcomeInviteViaResend(
  to: string,
  params: {
    recipientName: string
    emailLogin: string
    username: string
    temporaryPassword: string
    loginUrl: string
  }
): Promise<SendResult> {
  const resend = createResendClient()
  if (!resend) {
    return {
      ok: false,
      error:
        "RESEND_API_KEY ausente ou vazia no servidor. Confira .env.local na raiz do projeto, reinicie npm run dev e use a mesma pasta onde roda o Next."
    }
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Renova Enterprise Management System"
  const from = defaultResendFrom()

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `Bem-vindo ao ${appName} — seus dados de acesso`,
    html: buildRenovaWelcomeInviteEmailHtml(params)
  })

  if (error) {
    const msg = formatResendError(error)
    console.error("[Resend] convite falhou:", { to, from, error })
    return { ok: false, error: msg }
  }

  if (data && typeof data === "object" && "id" in data && !(data as { id?: string }).id) {
    console.warn("[Resend] resposta inesperada (sem id):", data)
  }

  return { ok: true }
}
