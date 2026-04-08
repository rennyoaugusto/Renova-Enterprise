import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type PatchPayload = {
  ids?: string[]
  markAll?: boolean
  lida?: boolean
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get("unreadOnly") === "1"
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "20"), 1), 100)

  let query = supabase
    .from("notificacoes")
    .select("id,tipo,titulo,mensagem,referencia_tipo,referencia_id,lida,lida_em,criado_em")
    .order("criado_em", { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq("lida", false)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: "Falha ao carregar notificações" }, { status: 500 })
  }

  const { count } = await supabase
    .from("notificacoes")
    .select("id", { count: "exact", head: true })
    .eq("lida", false)

  return NextResponse.json({
    data: data ?? [],
    unread_count: count ?? 0
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as PatchPayload
  const lida = body.lida ?? true
  const payload = {
    lida,
    lida_em: lida ? new Date().toISOString() : null
  }

  if (body.markAll) {
    const { error } = await supabase.from("notificacoes").update(payload).eq("lida", !lida)
    if (error) {
      return NextResponse.json({ error: "Falha ao atualizar notificações." }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (!body.ids || body.ids.length === 0) {
    return NextResponse.json({ error: "Informe ids ou markAll para atualizar notificações." }, { status: 400 })
  }

  const { error } = await supabase.from("notificacoes").update(payload).in("id", body.ids)
  if (error) {
    return NextResponse.json({ error: "Falha ao atualizar notificações." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
