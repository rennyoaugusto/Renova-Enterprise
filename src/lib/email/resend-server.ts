import { Resend } from "resend"

/**
 * Cliente Resend para rotas/API server-side.
 * A chave vem de process.env.RESEND_API_KEY — nunca hardcode no código.
 */
export function createResendClient(): Resend | null {
  const raw = process.env.RESEND_API_KEY
  const apiKey = raw?.replace(/^\uFEFF/, "").trim()
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

/** Remetente: sem domínio verificado, use exatamente onboarding@resend.dev (com ou sem nome). */
export function defaultResendFrom(): string {
  const from = process.env.RESEND_FROM_EMAIL?.replace(/^\uFEFF/, "").trim()
  if (from) return from
  return "onboarding@resend.dev"
}
