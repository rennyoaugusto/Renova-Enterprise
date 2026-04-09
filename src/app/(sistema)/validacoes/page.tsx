import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { ValidacoesList } from "@/components/validacoes/validacoes-list"
import { getCurrentUserWithRole } from "@/lib/auth"

export default async function ValidacoesPage() {
  const { role } = await getCurrentUserWithRole()
  const canCreate = role ? ["super_admin", "coordenador", "analista", "vendedor"].includes(role) : false

  return (
    <main className="page-wrap gap-8">
      <PageHeader
        title="Validações"
        description="Acompanhe vendas em andamento, SLA e aprovações. Use os chips de status para focar no que importa agora."
        actions={
          canCreate ? (
            <Link href="/validacoes/nova" className="premium-button inline-flex items-center gap-2">
              Registrar venda
            </Link>
          ) : null
        }
      />

      <ValidacoesList canRegister={canCreate} />
    </main>
  )
}
