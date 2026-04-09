/**
 * HTML para e-mail de redefinição (Resend / referência visual).
 * O fluxo principal no app usa o template em `email-templates/supabase-reset-password.html` no painel Supabase.
 */
export function buildRenovaRecoveryEmailHtml(actionLink: string, recipientName?: string): string {
  const greeting = recipientName?.trim() ? `Olá, ${escapeHtml(recipientName.trim())}` : "Olá"
  const safeLink = escapeHtml(actionLink)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redefinir senha — Renova</title>
</head>
<body style="margin:0;padding:0;background:#eef0f4;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#eef0f4 0%,#e8ebf2 50%,#eef0f4 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;border-collapse:separate;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:#0f172a;">Renova</p>
              <p style="margin:4px 0 0 0;font-size:12px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;color:#64748b;">Enterprise</p>
            </td>
          </tr>
          <tr>
            <td style="border-radius:20px;overflow:hidden;background:#ffffff;border:1px solid #e2e8f0;box-shadow:0 25px 50px -12px rgba(15,23,42,0.12),0 0 0 1px rgba(255,255,255,0.6) inset;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:28px 28px 24px 28px;background:linear-gradient(145deg,#0b4bd4 0%,#2563eb 42%,#0ea5e9 100%);text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.78);">Segurança</p>
                    <p style="margin:10px 0 0 0;font-size:22px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;color:#ffffff;">Redefinir sua senha</p>
                    <p style="margin:10px auto 0 auto;max-width:400px;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.9);">
                      Use o botão abaixo para continuar. O link expira em breve.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 28px 8px 28px;">
                    <p style="margin:0 0 8px 0;font-size:15px;color:#0f172a;line-height:1.5;">${greeting},</p>
                    <p style="margin:0 0 28px 0;font-size:15px;color:#475569;line-height:1.65;">
                      Recebemos um pedido para redefinir a senha da sua conta. Se foi você, toque no botão para definir uma nova senha.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px 0;">
                      <tr>
                        <td align="center" style="padding:0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                            <tr>
                              <td style="border-radius:12px;background:linear-gradient(180deg,#3b82f6 0%,#2563eb 100%);box-shadow:0 10px 25px -8px rgba(37,99,235,0.55);text-align:center;">
                                <a href="${safeLink}" style="display:inline-block;padding:15px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;font-family:inherit;">Definir nova senha</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 10px 0;font-size:12px;color:#64748b;line-height:1.5;">Se o botão não abrir, copie o link:</p>
                    <p style="margin:0 0 24px 0;font-size:11px;word-break:break-all;line-height:1.5;color:#2563eb;">${safeLink}</p>
                    <p style="margin:0;padding:16px 0 0 0;border-top:1px solid #f1f5f9;font-size:13px;color:#94a3b8;line-height:1.55;text-align:center;">
                      Se você <strong>não</strong> pediu isso, ignore este e-mail — sua senha permanece a mesma.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 24px 28px;background:#f8fafc;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.5;">
                      MK Solutions · Renova Enterprise Management System<br />
                      <span style="color:#cbd5e1;">Este é um e-mail automático; não responda.</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
