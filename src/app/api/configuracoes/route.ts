import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

type ConfigInput = {
  chave: string
  valor: unknown
  descricao?: string | null
}

type PatchPayload = {
  updates?: ConfigInput[]
}

export async function GET() {
  const { role } = await getCurrentUserWithRole()
  if (!role) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from("configuracoes")
    .select("id,chave,valor,descricao,atualizado_em")
    .order("chave", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Falha ao carregar configurações" }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function PATCH(request: Request) {
  const { role, user } = await getCurrentUserWithRole()
  if (role !== "super_admin" || !user) {
    return NextResponse.json({ error: "Apenas super admin pode editar configurações." }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as PatchPayload
  const updates = body.updates ?? []
  if (updates.length === 0) {
    return NextResponse.json({ error: "Informe ao menos uma configuração para atualizar." }, { status: 400 })
  }

  for (const item of updates) {
    const chave = item.chave?.trim()
    if (!chave) {
      return NextResponse.json({ error: "Cada item precisa ter chave válida." }, { status: 400 })
    }
  }

  const payload = updates.map((item) => ({
    chave: item.chave.trim(),
    valor: item.valor,
    descricao: item.descricao ?? null,
    atualizado_por: user.id,
    atualizado_em: new Date().toISOString()
  }))

  const { error } = await supabaseAdmin.from("configuracoes").upsert(payload, { onConflict: "chave" })
  if (error) {
    return NextResponse.json({ error: "Falha ao salvar configurações." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
