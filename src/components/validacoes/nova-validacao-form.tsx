"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { createValidacaoSchema, type CreateValidacaoInput } from "@/lib/validations"
import type { UserRole } from "@/types/usuario"

type NovaValidacaoFormProps = {
  currentRole: UserRole
}

type FormOptions = {
  vendedores: Array<{ id: string; nome: string }>
  analistas: Array<{ id: string; nome: string }>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0)
}

function isAllowedFile(file: File, accepted: string[]) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return accepted.includes(ext)
}

export function NovaValidacaoForm({ currentRole }: NovaValidacaoFormProps) {
  const router = useRouter()
  const [options, setOptions] = useState<FormOptions>({ vendedores: [], analistas: [] })
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [calcFile, setCalcFile] = useState<File | null>(null)
  const [proposalFile, setProposalFile] = useState<File | null>(null)
  const [otherFiles, setOtherFiles] = useState<File[]>([])
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CreateValidacaoInput>({
    resolver: zodResolver(createValidacaoSchema),
    defaultValues: {
      nome_cliente: "",
      tipo_projeto: "portaria_remota",
      modelo_comercial: "venda",
      locacao_custo_inicial: 0,
      custo_prev_equipamentos: 0,
      custo_prev_materiais: 0,
      custo_prev_mao_obra: 0
    }
  })

  const modelo = watch("modelo_comercial")
  const tipoProjeto = watch("tipo_projeto")
  const vendaEquip = watch("venda_valor_equipamentos") ?? 0
  const vendaMat = watch("venda_valor_materiais") ?? 0
  const vendaMao = watch("venda_valor_mao_obra") ?? 0
  const locMensal = watch("locacao_valor_mensal") ?? 0
  const locPrazo = watch("locacao_prazo_meses") ?? 0
  const locInicial = watch("locacao_custo_inicial") ?? 0
  const custoEquip = watch("custo_prev_equipamentos") ?? 0
  const custoMat = watch("custo_prev_materiais") ?? 0
  const custoMao = watch("custo_prev_mao_obra") ?? 0

  const totals = useMemo(() => {
    const valorTotal = modelo === "venda" ? vendaEquip + vendaMat + vendaMao : locMensal * locPrazo + locInicial
    const custoTotal = custoEquip + custoMat + custoMao
    const margemReais = valorTotal - custoTotal
    const margemPercent = valorTotal > 0 ? (margemReais / valorTotal) * 100 : 0
    return { valorTotal, custoTotal, margemReais, margemPercent }
  }, [modelo, vendaEquip, vendaMat, vendaMao, locMensal, locPrazo, locInicial, custoEquip, custoMat, custoMao])

  const margemColor =
    totals.margemPercent <= 0
      ? "text-[hsl(var(--danger))]"
      : totals.margemPercent < 15
        ? "text-[hsl(var(--warning))]"
        : totals.margemPercent < 30
          ? "text-[hsl(var(--warning))]"
          : "text-[hsl(var(--success))]"

  const blockedByMargin = totals.margemPercent <= 0 && !["coordenador", "super_admin"].includes(currentRole)
  const missingAssigneesMessage = useMemo(() => {
    if (options.vendedores.length === 0) {
      return "Nenhum vendedor ativo encontrado. Cadastre/ative um vendedor na Gestão de Usuários para salvar a venda."
    }
    if (options.analistas.length === 0) {
      return "Nenhum analista ativo encontrado. Cadastre/ative um analista na Gestão de Usuários para salvar a venda."
    }
    return null
  }, [options.analistas.length, options.vendedores.length])

  useEffect(() => {
    async function loadOptions() {
      const response = await fetch("/api/validacoes?mode=options", { cache: "no-store" })
      const body = await response.json()
      if (response.ok) {
        setOptions(body.data ?? { vendedores: [], analistas: [] })
      }
    }
    void loadOptions()
  }, [])

  async function uploadOne(validacaoId: string, categoria: string, file: File) {
    const data = new FormData()
    data.append("validacaoId", validacaoId)
    data.append("categoria", categoria)
    data.append("file", file)

    const response = await fetch("/api/validacoes/upload", {
      method: "POST",
      body: data
    })
    const body = await response.json()
    if (!response.ok) {
      throw new Error(body.error ?? `Falha ao enviar anexo ${categoria}`)
    }
  }

  async function onSubmit(values: CreateValidacaoInput) {
    setServerError(null)
    setSuccessMessage(null)

    if (missingAssigneesMessage) {
      setServerError(missingAssigneesMessage)
      return
    }

    if (!calcFile || !proposalFile) {
      setServerError("Anexos obrigatórios: Calculadora inicial e Proposta comercial.")
      return
    }

    if (calcFile.size > 25 * 1024 * 1024 || proposalFile.size > 25 * 1024 * 1024) {
      setServerError("Arquivo excede 25MB.")
      return
    }

    if (!isAllowedFile(calcFile, ["xlsx", "xls", "pdf"])) {
      setServerError("Calculadora inicial deve ser .xlsx, .xls ou .pdf")
      return
    }

    if (!isAllowedFile(proposalFile, ["pdf", "docx"])) {
      setServerError("Proposta comercial deve ser .pdf ou .docx")
      return
    }

    for (const file of otherFiles) {
      if (file.size > 25 * 1024 * 1024) {
        setServerError(`Arquivo ${file.name} excede 25MB.`)
        return
      }
      if (!isAllowedFile(file, ["pdf", "xlsx", "xls", "docx", "png", "jpg", "jpeg"])) {
        setServerError(`Formato inválido em ${file.name}.`)
        return
      }
    }

    setIsSubmittingForm(true)
    try {
      const response = await fetch("/api/validacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })
      const body = await response.json()

      if (!response.ok) {
        setServerError(body.error ?? "Falha ao registrar venda")
        return
      }

      const validacaoId = body.data?.id as string
      await uploadOne(validacaoId, "calculadora_inicial", calcFile)
      await uploadOne(validacaoId, "proposta_comercial", proposalFile)

      for (const file of otherFiles) {
        await uploadOne(validacaoId, "outros", file)
      }

      setSuccessMessage("Venda registrada com sucesso.")
      router.push("/validacoes")
      router.refresh()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Falha ao concluir cadastro e upload")
    } finally {
      setIsSubmittingForm(false)
    }
  }

  return (
    <form className="surface-card space-y-5 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Nome do cliente</label>
          <input className="premium-input" {...register("nome_cliente")} />
          {errors.nome_cliente ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.nome_cliente.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Vendedor</label>
          <select className="premium-input" {...register("vendedor_id")}>
            <option value="">Selecione</option>
            {options.vendedores.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
          {errors.vendedor_id ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.vendedor_id.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Analista técnico</label>
          <select className="premium-input" {...register("analista_id")}>
            <option value="">Selecione</option>
            {options.analistas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
          {errors.analista_id ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.analista_id.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Tipo do projeto</label>
          <select className="premium-input" {...register("tipo_projeto")}>
            <option value="portaria_remota">Portaria remota</option>
            <option value="sistema_tecnico">Sistema técnico</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Modelo comercial</label>
          <select className="premium-input" {...register("modelo_comercial")}>
            <option value="venda">Venda</option>
            <option value="locacao">Locação</option>
          </select>
        </div>

        {tipoProjeto === "outros" ? (
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Descrição do tipo de projeto</label>
            <input className="premium-input" {...register("tipo_projeto_descricao")} />
            {errors.tipo_projeto_descricao ? (
              <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.tipo_projeto_descricao.message}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modelo === "venda" ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Valor equipamentos (R$)</label>
              <input type="number" step="0.01" className="premium-input" {...register("venda_valor_equipamentos", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Valor materiais (R$)</label>
              <input type="number" step="0.01" className="premium-input" {...register("venda_valor_materiais", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Valor mão de obra (R$)</label>
              <input type="number" step="0.01" className="premium-input" {...register("venda_valor_mao_obra", { valueAsNumber: true })} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Prazo locação (meses)</label>
              <input type="number" className="premium-input" {...register("locacao_prazo_meses", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Valor mensal (R$)</label>
              <input type="number" step="0.01" className="premium-input" {...register("locacao_valor_mensal", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Custo inicial (R$)</label>
              <input type="number" step="0.01" className="premium-input" {...register("locacao_custo_inicial", { valueAsNumber: true })} />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Custo prev. equipamentos (R$)</label>
          <input type="number" step="0.01" className="premium-input" {...register("custo_prev_equipamentos", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Custo prev. materiais (R$)</label>
          <input type="number" step="0.01" className="premium-input" {...register("custo_prev_materiais", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Custo prev. mão de obra (R$)</label>
          <input type="number" step="0.01" className="premium-input" {...register("custo_prev_mao_obra", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="surface-card grid gap-3 p-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-[hsl(var(--muted))]">Valor total</p>
          <p className="text-sm font-semibold">{formatCurrency(totals.valorTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted))]">Custo total</p>
          <p className="text-sm font-semibold">{formatCurrency(totals.custoTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted))]">Margem (R$)</p>
          <p className={`text-sm font-semibold ${margemColor}`}>{formatCurrency(totals.margemReais)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted))]">Margem (%)</p>
          <p className={`text-sm font-semibold ${margemColor}`}>{totals.margemPercent.toFixed(1)}%</p>
        </div>
      </div>

      {totals.margemPercent < 15 ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Justificativa de margem</label>
          <textarea className="premium-input min-h-24" {...register("justificativa_margem")} />
          {errors.justificativa_margem ? (
            <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.justificativa_margem.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Calculadora inicial (obrigatório)</label>
          <input
            type="file"
            className="premium-input"
            accept=".xlsx,.xls,.pdf"
            onChange={(event) => setCalcFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Proposta comercial (obrigatório)</label>
          <input
            type="file"
            className="premium-input"
            accept=".pdf,.docx"
            onChange={(event) => setProposalFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Outros documentos (opcional)</label>
          <input
            type="file"
            className="premium-input"
            accept=".pdf,.xlsx,.xls,.docx,.png,.jpg,.jpeg"
            multiple
            onChange={(event) => setOtherFiles(Array.from(event.target.files ?? []))}
          />
        </div>
      </div>

      {blockedByMargin ? (
        <div className="alert-error">
          Margem ≤ 0% bloqueada para seu perfil. Solicite aprovação do Coordenador.
        </div>
      ) : null}

      {missingAssigneesMessage ? (
        <div className="alert-warning">
          {missingAssigneesMessage}
        </div>
      ) : null}

      {serverError ? (
        <div className="alert-error">
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="alert-success">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmittingForm || blockedByMargin || Boolean(missingAssigneesMessage)}
        className="premium-button disabled:opacity-60"
      >
        {isSubmittingForm ? "Salvando..." : "Salvar registro de venda"}
      </button>
    </form>
  )
}
