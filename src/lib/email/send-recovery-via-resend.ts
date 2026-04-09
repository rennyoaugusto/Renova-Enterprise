import { buildRenovaRecoveryEmailHtml } from "@/lib/email/renova-recovery-email"

type SendResult = { ok: true } | { ok: false; error: string }

export async function sendRecoveryEmailViaResend(
  to: string,
  actionLink: string,
  recipientName?: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY não configurada" }
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Renova <onboarding@resend.dev>"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Redefina sua senha — Renova Enterprise Management System",
      html: buildRenovaRecoveryEmailHtml(actionLink, recipientName)
    })
  })

  const json = (await response.json().catch(() => ({}))) as { message?: string }

  if (!response.ok) {
    return {
      ok: false,
      error: typeof json.message === "string" ? json.message : "Falha ao enviar e-mail (Resend)"
    }
  }

  return { ok: true }
}
