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

const AUTH_BG_URL = "/brand/login-background.jpg"

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
        "URL do app não configurada. Defina NEXT_PUBLIC_APP_URL e inclua /api/auth/callback nas Redirect URLs do Supabase."
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[hsl(var(--background))]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.38] dark:opacity-[0.28]"
        style={{ backgroundImage: `url('${AUTH_BG_URL}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--background))]/55 to-[hsl(var(--background))]"
        aria-hidden
      />

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <Image src="/brand/renova-icon.png" alt="Renova" width={56} height={56} className="rounded-2xl shadow-md" priority />
        <div className="text-center">
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Renova Enterprise Management System</p>
          <p className="text-xs text-[hsl(var(--muted))]">Recuperação de senha</p>
        </div>
      </div>

      <div className="auth-glass-card relative z-10 w-full max-w-sm">
        <div className="px-7 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
              <MailCheck size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Redefinir senha</h1>
              <p className="text-xs leading-relaxed text-[hsl(var(--muted))]">
                O e-mail com o link é enviado pelo Supabase (autenticação do projeto).
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="email">
                E-mail corporativo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                className="login-auth-input"
                {...register("email")}
              />
              {errors.email ? <p className="text-xs text-[hsl(var(--danger))]">{errors.email.message}</p> : null}
            </div>

            {serverError ? <div className="alert-error text-sm">{serverError}</div> : null}
            {successMessage ? <div className="alert-success text-sm">{successMessage}</div> : null}

            <button type="submit" disabled={isSubmitting} className="login-auth-submit">
              {isSubmitting ? "Enviando..." : "Enviar link"}
              {!isSubmitting && <ArrowRight size={17} strokeWidth={2.25} />}
            </button>
          </form>
        </div>

        <div className="border-t border-[hsl(var(--border))] px-7 py-4 sm:px-8">
          <Link
            href="/login"
            className="text-xs font-medium text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary-strong))]"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  )
}
