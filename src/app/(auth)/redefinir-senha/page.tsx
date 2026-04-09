"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MailCheck } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { buildAuthCallbackRecoveryUrl } from "@/lib/app-url"
import { createClient } from "@/lib/supabase/client"
import { resetPasswordRequestSchema, type ResetPasswordRequestInput } from "@/lib/validations"

export default function RedefinirSenhaPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { email: "" }
  })

  async function onSubmit(values: ResetPasswordRequestInput) {
    setServerError(null)
    setSuccessMessage(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setServerError("Configure as variáveis do Supabase em .env.local para continuar.")
      return
    }

    const redirectTo = buildAuthCallbackRecoveryUrl()
    if (!redirectTo) {
      setServerError(
        "URL do app não configurada. Defina NEXT_PUBLIC_APP_URL no Vercel (ex.: https://pilar-system-8ywy.vercel.app) e inclua /api/auth/callback nas Redirect URLs do Supabase."
      )
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo })

    if (error) {
      setServerError("Não foi possível enviar o link de redefinição.")
      return
    }

    setSuccessMessage("Se o e-mail existir, enviamos um link para redefinir sua senha.")
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
          <p className="text-xs text-[hsl(var(--muted))]">Recuperação de senha</p>
        </div>
      </div>

      {/* Card */}
      <div className="surface-card-strong w-full max-w-sm">
        <div className="p-7">

          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[hsl(var(--accent))]"
              style={{ background: "hsl(var(--accent) / 0.1)" }}
            >
              <MailCheck size={17} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">Redefinir senha</h1>
              <p className="text-xs text-[hsl(var(--muted))]">Enviaremos um link para seu e-mail.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[hsl(var(--foreground))]" htmlFor="email">
                E-mail corporativo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                className="premium-input"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-[hsl(var(--danger))]">{errors.email.message}</p>
              ) : null}
            </div>

            {serverError ? <div className="alert-error">{serverError}</div> : null}
            {successMessage ? <div className="alert-success">{successMessage}</div> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="premium-button w-full"
            >
              {isSubmitting ? "Enviando..." : "Enviar link"}
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
