import Link from "next/link"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { UsuarioTable } from "@/components/usuarios/usuario-table"
import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"

type UsuariosPageProps = {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const { user, role } = await getCurrentUserWithRole()

  if (!user) {
    redirect("/login")
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect("/dashboard")
  }

  const convite = typeof searchParams.convite === "string" ? searchParams.convite : undefined

  return (
    <main className="page-wrap gap-8">
      {convite === "enviado" ? (
        <div className="alert-success text-sm">
          Convite enviado por e-mail com senha provisória. O usuário define a senha definitiva no primeiro acesso.
        </div>
      ) : null}
      {convite === "criado-sem-email" ? (
        <div className="alert-warning text-sm leading-relaxed">
          Usuário criado, mas o e-mail não foi enviado (verifique Resend ou domínio). Use &quot;Enviar redefinição de
          senha&quot; na linha do usuário, se precisar.
        </div>
      ) : null}

      <PageHeader
        title="Gestão de usuários"
        description="Convites, papéis e status da equipe. Use os filtros para localizar alguém rapidamente."
        actions={
          <Link href="/usuarios/convidar" className="premium-button inline-flex items-center gap-2">
            Convidar usuário
          </Link>
        }
      />

      <UsuarioTable />
    </main>
  )
}
