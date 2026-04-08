import { redirect } from "next/navigation"

import { ConfiguracoesForm } from "@/components/configuracoes/configuracoes-form"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUserWithRole } from "@/lib/auth"

export default async function ConfiguracoesPage() {
  const { user, role } = await getCurrentUserWithRole()

  if (!user) {
    redirect("/login")
  }

  if (role !== "super_admin") {
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Configurações"
        description="Painel administrativo para regras globais e SLAs do sistema."
      />

      <ConfiguracoesForm />
    </main>
  )
}
