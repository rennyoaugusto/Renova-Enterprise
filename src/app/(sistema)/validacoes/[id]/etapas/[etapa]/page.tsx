import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { ValidacaoDetalheWorkflow } from "@/components/validacoes/validacao-detalhe-workflow"

type EtapaPageProps = {
  params: { id: string; etapa: string }
}

export default function EtapaPage({ params }: EtapaPageProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title={`Etapa ${params.etapa}`}
        description={`Visão de etapa da validação ${params.id}.`}
        actions={
          <Link href={`/validacoes/${params.id}`} className="premium-button-secondary">
            Ver detalhe completo
          </Link>
        }
      />
      <ValidacaoDetalheWorkflow id={params.id} />
    </main>
  )
}
