import Link from "next/link"

import { ValidacaoDetalheWorkflow } from "@/components/validacoes/validacao-detalhe-workflow"
import { PageHeader } from "@/components/shared/page-header"

type ValidacaoDetalhePageProps = {
  params: { id: string }
}

export default function ValidacaoDetalhePage({ params }: ValidacaoDetalhePageProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Detalhe da validação"
        description={`Fluxo técnico completo da validação ${params.id}.`}
        actions={
          <Link href="/validacoes" className="premium-button-secondary">
            Voltar
          </Link>
        }
      />
      <ValidacaoDetalheWorkflow id={params.id} />
    </main>
  )
}
