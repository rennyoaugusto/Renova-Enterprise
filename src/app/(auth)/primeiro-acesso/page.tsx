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

const AUTH_BG_URL = "/brand/login-background.jpg"

export default function PrimeiroAcessoPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

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

  useEffect(() => {
    let cancelled = false
    async function check() {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!cancelled) {
        if (!user) {
          router.replace("/login")
          return
        }
        setSessionChecked(true)
      }
    }
    void check()
    return () => {
      cancelled = true
    }
  }, [router])

  async function onSubmit(values: DefinePasswordInput) {
    setServerError(null)

    if (!ready) {
      setServerError("Configure as variáveis do Supabase em .env.local para continuar.")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: values.password,
      data: { primeiro_acesso: false }
    })

    if (error) {
      setServerError("Não foi possível definir a senha. Entre novamente com e-mail e senha provisória.")
      return
    }

    router.push("/dashboard")
  }

  if (!sessionChecked) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
        <p className="text-sm text-[hsl(var(--muted))]">Carregando...</p>
      </main>
    )
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
          <p className="text-xs text-[hsl(var(--muted))]">Primeiro acesso — defina sua senha</p>
        </div>
      </div>

      <div className="auth-glass-card relative z-10 w-full max-w-sm">
        <div className="px-7 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
              <LockKeyhole size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Definir senha</h1>
              <p className="text-xs leading-relaxed text-[hsl(var(--muted))]">
                Crie uma senha forte. Nos próximos acessos você usará apenas ela com seu e-mail.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="password">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="login-auth-input"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="login-auth-input"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-[hsl(var(--danger))]">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            {serverError ? <div className="alert-error text-sm">{serverError}</div> : null}

            <button type="submit" disabled={isSubmitting} className="login-auth-submit">
              {isSubmitting ? "Salvando..." : "Definir senha e entrar"}
              {!isSubmitting && <ArrowRight size={17} strokeWidth={2.25} />}
            </button>
          </form>
        </div>

        <div className="border-t border-[hsl(var(--border))] px-7 py-4 sm:px-8">
          <Link
            href="/login"
            className="text-xs font-medium text-[hsl(var(--muted))] transition hover:text-[hsl(var(--foreground))]"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  )
}
