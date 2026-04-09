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

/** Imagem de fundo: coloque o arquivo em public/brand/login-background.jpg (veja comentário no layout abaixo). */
const LOGIN_BG_URL = "/brand/login-background.jpg"

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
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Fundo base + imagem (opcional até você adicionar o arquivo em public/brand/) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[hsl(var(--background))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.38] dark:opacity-[0.28]"
        style={{ backgroundImage: `url('${LOGIN_BG_URL}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--background))]/55 to-[hsl(var(--background))]"
        aria-hidden
      />

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      {/* Bloco central: marca + login lado a lado (sem esticar na largura da tela) */}
      <div className="relative z-10 flex w-full max-w-[960px] flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-12 xl:gap-14">
        <section className="w-full max-w-md text-center lg:flex-1 lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-4">
            <Image
              src="/brand/renova-icon.png"
              alt="Renova"
              width={96}
              height={96}
              className="rounded-3xl shadow-md ring-1 ring-[hsl(var(--primary)/0.2)]"
              priority
            />
            <div>
              <p className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">Renova</p>
              <p className="text-sm text-[hsl(var(--muted))]">Enterprise Management System</p>
            </div>
          </div>

          <h2 className="mt-8 text-2xl font-semibold leading-snug tracking-tight text-[hsl(var(--foreground))] lg:mt-10 xl:text-3xl">
            Gestão corporativa e validação comercial em um só lugar.
          </h2>
          <ul className="mt-6 space-y-3 text-left text-sm leading-relaxed text-[hsl(var(--muted))]">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
              Fluxo de validações por etapas, com SLA e papéis definidos.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary-strong))]" />
              Transparência entre vendedor, analista, comercial e coordenação.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
              Ambiente seguro, com convites e controle de acesso por perfil.
            </li>
          </ul>
        </section>

        <section className="w-full max-w-[420px] shrink-0">
          <div className="auth-glass-card w-full">
            <div className="px-8 py-9 sm:px-10 sm:py-10">
              <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-[1.65rem]">
                Acessar o sistema
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted))]">
                Use seu <strong className="font-medium text-[hsl(var(--foreground))]">e-mail corporativo</strong> e senha.
                Convites usam senha provisória até você definir uma nova no primeiro acesso.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    className="login-auth-input"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-sm text-[hsl(var(--danger))]">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))]" htmlFor="password">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="login-auth-input pr-12"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[hsl(var(--muted))] transition hover:bg-[hsl(var(--foreground)/0.06)] hover:text-[hsl(var(--foreground))] dark:hover:bg-[hsl(0_0%_100%/0.06)]"
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

                <button type="submit" disabled={isSubmitting} className="login-auth-submit">
                  {isSubmitting ? "Entrando..." : "Entrar"}
                  {!isSubmitting && <ArrowRight size={17} strokeWidth={2.25} />}
                </button>
              </form>
            </div>

            <div className="border-t border-[hsl(var(--border))] px-8 py-4 sm:px-10">
              <Link
                href="/redefinir-senha"
                className="text-sm font-semibold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary-strong))]"
              >
                Esqueci minha senha!
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
