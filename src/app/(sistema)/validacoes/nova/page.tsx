import Link from "next/link"

import { NovaValidacaoForm } from "@/components/validacoes/nova-validacao-form"
import { PageHeader } from "@/components/shared/page-header"
import { getCurrentUserWithRole } from "@/lib/auth"

export default async function NovaValidacaoPage() {
  const { role } = await getCurrentUserWithRole()

  if (!role || !["super_admin", "coordenador", "analista", "vendedor"].includes(role)) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <PageHeader title="Registrar venda" description="Você não possui permissão para acessar esta tela." />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Registrar venda"
        description="Cadastro completo da validação inicial com cálculo de margem e anexos obrigatórios."
        actions={
          <Link href="/validacoes" className="premium-button-secondary">
            Voltar
          </Link>
        }
      />
      <NovaValidacaoForm currentRole={role} />
    </main>
  )
}
