/**
 * HTML para e-mail de redefinição de senha (Renova).
 * Pode colar o mesmo conteúdo no Supabase → Authentication → E-mail templates → Reset password,
 * trocando {{ .ConfirmationURL }} pelo placeholder do Supabase (geralmente {{ .ConfirmationURL }}).
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
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Inter,Segoe UI,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e9ef;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="padding:28px 28px 20px 28px;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);text-align:center;font-family:Inter,Segoe UI,system-ui,sans-serif;">
              <p style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;color:#ffffff;">Renova</p>
              <p style="margin:8px 0 0 0;font-size:17px;font-weight:600;letter-spacing:-0.01em;line-height:1.35;color:rgba(255,255,255,0.92);">Enterprise Management System</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 12px 0;font-size:16px;color:#0f172a;line-height:1.5;">${greeting},</p>
              <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.6;text-align:center;">Recebemos um pedido para redefinir a senha da sua conta. Use o botão abaixo para continuar. O link expira em breve por segurança.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;">
                <tr>
                  <td align="center" style="padding:0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                      <tr>
                        <td style="border-radius:10px;background:#4f46e5;text-align:center;">
                          <a href="${safeLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;font-family:Inter,Segoe UI,system-ui,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">Definir minha senha</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;line-height:1.5;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
              <p style="margin:0 0 20px 0;font-size:12px;word-break:break-all;color:#4f46e5;line-height:1.5;">${safeLink}</p>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanece a mesma.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px 28px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">MK Solutions · Renova Enterprise Management System</p>
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
