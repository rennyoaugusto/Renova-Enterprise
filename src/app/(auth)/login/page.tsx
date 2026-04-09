"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { type LoginInput, loginSchema } from "@/lib/validations"

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="auth-surface relative min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,440px)]">
      <div className="absolute right-4 top-4 z-10 lg:right-6 lg:top-6">
        <ThemeToggle />
      </div>

      {/* Coluna marca + contexto */}
      <div className="relative hidden flex-col justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] px-10 py-12 lg:flex lg:border-b-0 lg:border-r">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/renova-icon.png"
              alt="Renova"
              width={56}
              height={56}
              className="rounded-2xl shadow-sm"
              priority
            />
            <div>
              <p className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">Renova</p>
              <p className="text-sm text-[hsl(var(--muted))]">Enterprise Management System</p>
            </div>
          </div>

          <h2 className="mt-12 max-w-md text-2xl font-semibold leading-snug tracking-tight text-[hsl(var(--foreground))] xl:text-3xl">
            Gestão corporativa e validação comercial em um só lugar.
          </h2>
          <ul className="mt-8 max-w-md space-y-3 text-sm leading-relaxed text-[hsl(var(--muted))]">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
              Fluxo de validações por etapas, com SLA e papéis definidos.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
              Transparência entre vendedor, analista, comercial e coordenação.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
              Ambiente seguro, com convites e controle de acesso por perfil.
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-[hsl(var(--fg-subtle))]">MK Solutions · Renova</p>
      </div>

      {/* Coluna login */}
      <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <Image
              src="/brand/renova-icon.png"
              alt="Renova logo"
              width={52}
              height={52}
              className="rounded-2xl"
              priority
            />
            <div className="text-center">
              <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                Renova Enterprise Management System
              </p>
              <p className="text-sm text-[hsl(var(--muted))]">Gestão corporativa e validação comercial</p>
            </div>
          </div>

          <div className="surface-card-strong w-full">
            <div className="p-7 sm:p-8">
              <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] sm:text-2xl">Acessar o sistema</h1>
              <p className="mt-1.5 text-sm text-[hsl(var(--muted))]">Entre com suas credenciais corporativas.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="email">
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
                    <p className="text-sm text-[hsl(var(--danger))]">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="password">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="premium-input pr-11"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[hsl(var(--muted))] transition hover:bg-[hsl(var(--background-soft))] hover:text-[hsl(var(--foreground))]"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-sm text-[hsl(var(--danger))]">{errors.password.message}</p>
                  ) : null}
                </div>

                {serverError ? <div className="alert-error">{serverError}</div> : null}

                <button type="submit" disabled={isSubmitting} className="premium-button w-full">
                  {isSubmitting ? "Entrando..." : "Entrar"}
                  {!isSubmitting && <ArrowRight size={15} />}
                </button>
              </form>
            </div>

            <div className="border-t border-[hsl(var(--border))] px-7 py-4 sm:px-8">
              <Link
                href="/redefinir-senha"
                className="text-sm font-medium text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary-strong))]"
              >
                Esqueci minha senha / Redefinir senha
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
