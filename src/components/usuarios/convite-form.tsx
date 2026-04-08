"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { USER_ROLES, ROLE_LABELS } from "@/lib/constants"
import { inviteUserSchema, type InviteUserInput } from "@/lib/validations"

function slugifyPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function buildUsername(fullName: string) {
  const chunks = fullName.trim().split(/\s+/).filter(Boolean)
  const first = slugifyPart(chunks[0] ?? "")
  const last = slugifyPart(chunks[chunks.length - 1] ?? "")
  if (!first && !last) return ""
  if (!last) return first
  return `${first}.${last}`
}

export function ConviteForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [usernameTouched, setUsernameTouched] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      nome: "",
      username: "",
      email: "",
      papel: "vendedor"
    }
  })
  const nome = watch("nome")

  useEffect(() => {
    if (!usernameTouched) {
      setValue("username", buildUsername(nome), { shouldValidate: true })
    }
  }, [nome, setValue, usernameTouched])

  async function onSubmit(values: InviteUserInput) {
    setServerError(null)
    setSuccessMessage(null)

    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })

    const body = await response.json()

    if (!response.ok) {
      setServerError(body.error ?? "Falha ao convidar usuário")
      return
    }

    setSuccessMessage("Convite enviado com sucesso.")
    router.refresh()
  }

  return (
    <form className="surface-card space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
          Nome completo
        </label>
        <input
          id="nome"
          className="premium-input"
          placeholder="Ex.: Ana Melo"
          {...register("nome")}
        />
        {errors.nome ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.nome.message}</p> : null}
      </div>

      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
          Nome de usuário
        </label>
        <input
          id="username"
          className="premium-input"
          placeholder="nome.sobrenome"
          {...register("username", {
            onChange: () => setUsernameTouched(true)
          })}
        />
        {errors.username ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.username.message}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className="premium-input"
          {...register("email")}
        />
        {errors.email ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.email.message}</p> : null}
      </div>

      <div>
        <label htmlFor="papel" className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
          Papel inicial
        </label>
        <select
          id="papel"
          className="premium-input"
          {...register("papel")}
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        {errors.papel ? <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.papel.message}</p> : null}
      </div>

      {serverError ? (
        <div className="alert-error">{serverError}</div>
      ) : null}

      {successMessage ? (
        <div className="alert-success">{successMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="premium-button disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Enviando..." : "Enviar convite"}
      </button>
    </form>
  )
}
