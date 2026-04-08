import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { ValidacoesList } from "@/components/validacoes/validacoes-list"
import { getCurrentUserWithRole } from "@/lib/auth"

export default async function ValidacoesPage() {
  const { role } = await getCurrentUserWithRole()
  const canCreate = role ? ["super_admin", "coordenador", "analista", "vendedor"].includes(role) : false

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Validações"
        description="Painel principal do módulo de validação de vendas."
        actions={
          canCreate ? (
            <Link href="/validacoes/nova" className="premium-button">
              Registrar venda
            </Link>
          ) : null
        }
      />

      <ValidacoesList />
    </main>
  )
}
