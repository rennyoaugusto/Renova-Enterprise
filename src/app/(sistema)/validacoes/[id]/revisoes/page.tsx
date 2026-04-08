import { redirect } from "next/navigation"

import { ValidacaoRevisoesPanel } from "@/components/validacoes/validacao-revisoes-panel"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUserWithRole } from "@/lib/auth"

type RevisoesPageProps = {
  params: { id: string }
}

export default async function RevisoesPage({ params }: RevisoesPageProps) {
  const { user, role } = await getCurrentUserWithRole()
  if (!user) {
    redirect("/login")
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader title="Revisões" description="Histórico de retornos do comercial e ações de encerramento." />
      <ValidacaoRevisoesPanel id={params.id} role={role} />
    </main>
  )
}
