import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { getCurrentUserWithRole } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

const MAX_FILE_SIZE = 25 * 1024 * 1024

const ACCEPTED_FORMATS_BY_CATEGORY: Record<string, string[]> = {
  calculadora_inicial: ["xlsx", "xls", "pdf"],
  proposta_comercial: ["pdf", "docx"],
  outros: ["pdf", "xlsx", "xls", "docx", "png", "jpg", "jpeg"]
}

function extensionFromName(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? ""
}

export async function POST(request: Request) {
  const { role, user } = await getCurrentUserWithRole()

  if (!role || !["super_admin", "coordenador", "analista", "vendedor"].includes(role) || !user) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const formData = await request.formData()
  const validacaoId = String(formData.get("validacaoId") ?? "")
  const categoria = String(formData.get("categoria") ?? "outros")
  const file = formData.get("file")

  if (!validacaoId) {
    return NextResponse.json({ error: "validacaoId é obrigatório" }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Arquivo excede o limite de 25MB" }, { status: 400 })
  }

  const extension = extensionFromName(file.name)
  const accepted = ACCEPTED_FORMATS_BY_CATEGORY[categoria] ?? ACCEPTED_FORMATS_BY_CATEGORY.outros
  if (!accepted.includes(extension)) {
    return NextResponse.json({ error: `Formato .${extension} não permitido para ${categoria}` }, { status: 400 })
  }

  const { data: validacao, error: validacaoError } = await supabaseAdmin
    .from("validacoes")
    .select("id, criado_por")
    .eq("id", validacaoId)
    .maybeSingle()

  if (validacaoError || !validacao) {
    return NextResponse.json({ error: "Validação não encontrada" }, { status: 404 })
  }

  if (role === "vendedor" && validacao.criado_por !== user.id) {
    return NextResponse.json({ error: "Vendedor só pode anexar em validações criadas por ele" }, { status: 403 })
  }

  const { data: currentVersion } = await supabaseAdmin
    .from("validacao_anexos")
    .select("id,versao")
    .eq("validacao_id", validacaoId)
    .eq("categoria", categoria)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = (currentVersion?.versao ?? 0) + 1
  const storageName = `${validacaoId}/registro/${categoria}_${nextVersion}_${Date.now()}_${randomUUID()}.${extension}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabaseAdmin.storage
    .from("validacoes-anexos")
    .upload(storageName, arrayBuffer, { contentType: file.type || "application/octet-stream", upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: "Falha no upload do anexo" }, { status: 500 })
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("validacao_anexos")
    .insert({
      validacao_id: validacaoId,
      etapa: null,
      revisao_numero: 0,
      nome_original: file.name,
      nome_storage: storageName,
      tipo_arquivo: extension,
      tamanho_bytes: file.size,
      categoria,
      versao: nextVersion,
      enviado_por: user.id
    })
    .select("id")
    .single()

  if (insertError || !inserted) {
    return NextResponse.json({ error: "Upload realizado, mas falhou ao registrar metadados" }, { status: 500 })
  }

  if (currentVersion?.id) {
    await supabaseAdmin.from("validacao_anexos").update({ substituido_por: inserted.id }).eq("id", currentVersion.id)
  }

  await supabaseAdmin.from("validacao_log").insert({
    validacao_id: validacaoId,
    usuario_id: user.id,
    acao: "upload_anexo",
    detalhes: {
      categoria,
      arquivo: file.name,
      versao: nextVersion
    }
  })

  return NextResponse.json({ ok: true })
}
