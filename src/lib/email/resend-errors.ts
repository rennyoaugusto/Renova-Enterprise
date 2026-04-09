/** Normaliza o objeto de erro do SDK / API Resend para texto útil no UI e logs. */
export function formatResendError(err: unknown): string {
  if (err == null) return "Erro desconhecido ao chamar o Resend."
  if (typeof err === "string") return err
  if (typeof err === "object") {
    const o = err as Record<string, unknown>
    if (typeof o.message === "string" && o.message.length > 0) return o.message
    if (typeof o.name === "string" && typeof o.message === "string") return `${o.name}: ${o.message}`
    try {
      return JSON.stringify(o)
    } catch {
      return String(err)
    }
  }
  return String(err)
}
