"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { type LoginInput, loginSchema } from "@/lib/validations"

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  async function onSubmit(values: LoginInput) {
    setServerError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setServerError("Configure as variáveis do Supabase em .env.local para continuar.")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })

    if (error) {
      setServerError("E-mail ou senha incorretos. Tente novamente.")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="auth-surface relative flex min-h-screen flex-col items-center justify-center px-4 py-12">

      {/* Theme toggle */}
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
          style={{
            background: "hsl(var(--primary))",
            boxShadow: "0 8px 28px hsl(var(--primary) / 0.4)"
          }}
        >
          <span className="text-xl font-bold tracking-tight">P</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Sistema PILAR</p>
          <p className="text-xs text-[hsl(var(--muted))]">Validação e governança comercial</p>
        </div>
      </div>

      {/* Card */}
      <div className="surface-card-strong w-full max-w-sm">
        <div className="p-7">
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Acessar o sistema</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted))]">Entre com suas credenciais corporativas.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[hsl(var(--foreground))]" htmlFor="email">
                E-mail
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

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[hsl(var(--foreground))]" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="premium-input"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>
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
              {isSubmitting ? "Entrando..." : "Entrar"}
              {!isSubmitting && <ArrowRight size={15} />}
            </button>

          </form>
        </div>

        <div
          className="flex items-center justify-between px-7 py-4 text-xs text-[hsl(var(--muted))]"
          style={{ borderTop: "1px solid hsl(var(--border))" }}
        >
          <Link
            href="/redefinir-senha"
            className="transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Esqueci a senha
          </Link>
          <Link
            href="/primeiro-acesso"
            className="transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Primeiro acesso
          </Link>
        </div>
      </div>

    </main>
  )
}
