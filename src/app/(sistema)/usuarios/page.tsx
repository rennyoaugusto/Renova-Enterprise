import Link from "next/link"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { UsuarioTable } from "@/components/usuarios/usuario-table"
import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"

export default async function UsuariosPage() {
  const { user, role } = await getCurrentUserWithRole()

  if (!user) {
    redirect("/login")
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect("/dashboard")
  }

  return (
    <main className="page-wrap">
      <PageHeader
        title="Gestão de usuários"
        description="Convites, papéis e status dos usuários do sistema."
        actions={
          <Link href="/usuarios/convidar" className="premium-button">
            Convidar usuário
          </Link>
        }
      />

      <UsuarioTable />
    </main>
  )
}
