"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, LockKeyhole } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { definePasswordSchema, type DefinePasswordInput } from "@/lib/validations"

export default function PrimeiroAcessoPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DefinePasswordInput>({
    resolver: zodResolver(definePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  })

  useEffect(() => {
    setReady(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  }, [])

  async function onSubmit(values: DefinePasswordInput) {
    setServerError(null)

    if (!ready) {
      setServerError("Configure as variáveis do Supabase em .env.local para continuar.")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      setServerError("Não foi possível definir a senha. Abra novamente o link recebido por e-mail.")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="auth-surface relative flex min-h-screen flex-col items-center justify-center px-4 py-12">

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image src="/brand/renova-icon.png" alt="Renova logo" width={56} height={56} className="rounded-2xl" priority />
        <div className="text-center">
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Renova Enterprise Management System</p>
          <p className="text-xs text-[hsl(var(--muted))]">Configure seu acesso</p>
        </div>
      </div>

      {/* Card */}
      <div className="surface-card-strong w-full max-w-sm">
        <div className="p-7">

          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[hsl(var(--primary))]"
              style={{ background: "hsl(var(--primary) / 0.1)" }}
            >
              <LockKeyhole size={17} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">Definir senha</h1>
              <p className="text-xs text-[hsl(var(--muted))]">
                Convite ou redefinição: defina sua senha para concluir o acesso.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[hsl(var(--foreground))]" htmlFor="password">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="premium-input"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[hsl(var(--foreground))]" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="premium-input"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-[hsl(var(--danger))]">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            {serverError ? (
              <div className="alert-error">{serverError}</div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="premium-button w-full"
            >
              {isSubmitting ? "Salvando..." : "Definir senha"}
              {!isSubmitting && <ArrowRight size={15} />}
            </button>

          </form>
        </div>

        <div
          className="px-7 py-4"
          style={{ borderTop: "1px solid hsl(var(--border))" }}
        >
          <Link
            href="/login"
            className="text-xs text-[hsl(var(--muted))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Voltar para o login
          </Link>
        </div>
      </div>

    </main>
  )
}
