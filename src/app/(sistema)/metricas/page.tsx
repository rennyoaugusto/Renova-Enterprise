import { redirect } from "next/navigation"

import { MetricasDashboard } from "@/components/metricas/metricas-dashboard"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUserWithRole } from "@/lib/auth"
import { ADMIN_ROLES } from "@/lib/constants"

export default async function MetricasPage() {
  const { user, role } = await getCurrentUserWithRole()

  if (!user) {
    redirect("/login")
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Métricas"
        description="Acompanhamento operacional e financeiro das validações."
      />

      <MetricasDashboard />
    </main>
  )
}
