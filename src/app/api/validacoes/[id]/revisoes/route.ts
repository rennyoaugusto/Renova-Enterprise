import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type RouteParams = {
  params: { id: string }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { role } = await getCurrentUserWithRole()
  if (!role) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: validacao, error: validacaoError } = await supabase
    .from("validacoes")
    .select("id,nome_cliente,status,numero_revisoes,etapa_atual")
    .eq("id", params.id)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada" }, { status: 404 })
  }

  const { data: revisoes, error: revisoesError } = await supabase
    .from("validacao_revisoes")
    .select("id,numero,motivo,etapa_retorno,comentarios,criado_em,solicitante_id")
    .eq("validacao_id", params.id)
    .order("numero", { ascending: false })

  if (revisoesError) {
    return NextResponse.json({ error: "Falha ao carregar revisões" }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      validacao,
      revisoes: revisoes ?? []
    }
  })
}
