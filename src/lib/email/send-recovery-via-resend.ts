import { buildRenovaRecoveryEmailHtml } from "@/lib/email/renova-recovery-email"
import { formatResendError } from "@/lib/email/resend-errors"
import { createResendClient, defaultResendFrom } from "@/lib/email/resend-server"

type SendResult = { ok: true } | { ok: false; error: string }

export async function sendRecoveryEmailViaResend(
  to: string,
  actionLink: string,
  recipientName?: string
): Promise<SendResult> {
  const resend = createResendClient()
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY não configurada no servidor." }
  }

  const { error } = await resend.emails.send({
    from: defaultResendFrom(),
    to,
    subject: "Redefina sua senha — Renova Enterprise Management System",
    html: buildRenovaRecoveryEmailHtml(actionLink, recipientName)
  })

  if (error) {
    console.error("[Resend] recuperação falhou:", { to, error })
    return { ok: false, error: formatResendError(error) }
  }

  return { ok: true }
}
