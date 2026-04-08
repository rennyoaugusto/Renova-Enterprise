import Link from "next/link"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { ConviteForm } from "@/components/usuarios/convite-form"
import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"

export default async function ConvidarUsuarioPage() {
  const { user, role } = await getCurrentUserWithRole()

  if (!user) {
    redirect("/login")
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Convidar usuário"
        description="Envia convite para primeiro acesso no PILAR."
        actions={
          <Link href="/usuarios" className="premium-button-secondary text-sm">
            Voltar
          </Link>
        }
      />

      <ConviteForm />
    </main>
  )
}
