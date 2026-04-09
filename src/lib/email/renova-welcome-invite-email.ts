const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Renova Enterprise Management System"

export function buildRenovaWelcomeInviteEmailHtml(params: {
  recipientName: string
  emailLogin: string
  username: string
  temporaryPassword: string
  loginUrl: string
}) {
  const { recipientName, emailLogin, username, temporaryPassword, loginUrl } = params

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bem-vindo</title>
</head>
<body style="margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f1117;color:#e5e7eb;line-height:1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f1117;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:linear-gradient(180deg,#161922 0%,#12151c 100%);border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#2563eb,#22d3ee,#1d4ed8);"></td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;">${APP_NAME}</p>
              <h1 style="margin:12px 0 0;font-size:22px;font-weight:700;color:#f8fafc;">Seja bem-vindo, ${escapeHtml(recipientName)}</h1>
              <p style="margin:12px 0 0;font-size:15px;color:#94a3b8;">Sua conta foi criada. No primeiro acesso você definirá uma nova senha.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <table role="presentation" width="100%" style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.25);border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#94a3b8;">E-mail de login</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#f8fafc;word-break:break-all;">${escapeHtml(emailLogin)}</p>
                    <p style="margin:16px 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#94a3b8;">Usuário (identificação)</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#f8fafc;">@${escapeHtml(username)}</p>
                    <p style="margin:16px 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#94a3b8;">Senha provisória</p>
                    <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.04em;color:#38bdf8;font-family:ui-monospace,monospace;">${escapeHtml(temporaryPassword)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#64748b;">Use o <strong style="color:#cbd5e1;">e-mail</strong> e a <strong style="color:#cbd5e1;">senha provisória</strong> na tela de login. O sistema pedirá para você criar uma senha definitiva antes de continuar.</p>
              <p style="margin:24px 0 0;text-align:center;">
                <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:14px 28px;background:linear-gradient(180deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px;box-shadow:0 8px 24px rgba(37,99,235,0.35);">Acessar o login</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
