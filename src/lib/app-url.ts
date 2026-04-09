/**
 * URL pública do app (links em e-mails, recovery, convites).
 * - Defina NEXT_PUBLIC_APP_URL na Vercel (ex: https://pilar-system-8ywy.vercel.app)
 * - Em previews, VERCEL_URL é usada no servidor se a pública não estiver definida
 */
export function getPublicAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  if (explicit) {
    return explicit
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "")
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")
    return `https://${host}`
  }

  return ""
}

/** Rota após o clique no link de recuperação (troca de senha). */
export function getPasswordRecoveryRedirectPath(): string {
  return "/primeiro-acesso"
}

export function buildAuthCallbackRecoveryUrl(): string {
  const base = getPublicAppUrl()
  const nextPath = getPasswordRecoveryRedirectPath()
  if (!base) {
    return ""
  }
  const next = encodeURIComponent(nextPath)
  return `${base}/api/auth/callback?next=${next}`
}
