"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ChevronRight, Monitor, Moon, Sun, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { useTheme } from "@/components/shared/theme-provider"
import { buildAuthCallbackRecoveryUrl } from "@/lib/app-url"
import { ROLE_LABELS } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/types/usuario"

type AccountPanelProps = {
  userName: string
  userEmail: string
  role: UserRole | null
}

function usernameFromName(fullName: string) {
  const chunks = fullName.trim().split(/\s+/).filter(Boolean)
  const first = chunks[0] ?? ""
  const last = chunks.length > 1 ? chunks[chunks.length - 1] : ""

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")

  const normalizedFirst = normalize(first)
  const normalizedLast = normalize(last)

  if (!normalizedFirst && !normalizedLast) return ""
  if (!normalizedLast) return normalizedFirst
  return `${normalizedFirst}.${normalizedLast}`
}

export function AccountPanel({ userName, userEmail, role }: AccountPanelProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"geral" | "conta" | "sobre">("conta")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) {
      return "?"
    }
    if (parts.length === 1) {
      return parts[0]!.slice(0, 2).toUpperCase()
    }
    const first = parts[0]!
    const last = parts[parts.length - 1]!
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }, [userName])

  const username = useMemo(
    () => usernameFromName(userName) || userEmail.split("@")[0] || "",
    [userEmail, userName]
  )

  async function handleResetPassword() {
    setFeedback(null)
    setIsSendingReset(true)

    try {
      const redirectTo = buildAuthCallbackRecoveryUrl()
      if (!redirectTo) {
        setFeedback("Configure NEXT_PUBLIC_APP_URL no ambiente para enviar o link de redefinição.")
        return
      }
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, { redirectTo })

      if (error) {
        setFeedback("Não foi possível enviar o e-mail de redefinição.")
        return
      }

      setFeedback("E-mail de redefinição enviado com sucesso.")
    } finally {
      setIsSendingReset(false)
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))/0.72] px-3 py-3 transition hover:bg-[hsl(var(--background-soft))]"
        onClick={() => {
          setActiveTab("conta")
          setFeedback(null)
          setOpen(true)
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))/0.12] text-sm font-semibold text-[hsl(var(--primary))]">
          {initials}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="break-words text-sm font-semibold leading-snug text-[hsl(var(--foreground))]">
            {userName}
          </p>
          <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
            Minha conta
          </p>
        </div>
        <ChevronRight size={18} className="text-[hsl(var(--muted))]" />
      </button>

      {open ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-panel-title"
            className="surface-card-strong relative grid h-[min(72vh,640px)] w-full max-w-5xl overflow-hidden p-0 md:grid-cols-[220px,1fr]"
            onClick={(e) => e.stopPropagation()}
          >
            <aside className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-soft))] p-4 md:border-b-0 md:border-r md:overflow-y-auto">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Configurações</h2>
              <div className="mt-4 space-y-1">
                {[
                  { id: "conta" as const, label: "Conta" },
                  { id: "geral" as const, label: "Geral" },
                  { id: "sobre" as const, label: "Sobre" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id)
                      if (tab.id !== "conta") {
                        setFeedback(null)
                      }
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-[hsl(var(--background-elevated))] text-[hsl(var(--foreground))] shadow-sm"
                        : "text-[hsl(var(--muted))] hover:bg-[hsl(var(--background-elevated))/0.6]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </aside>

            <section className="relative flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4 md:px-6">
                <h3
                  id="account-panel-title"
                  className="text-lg font-semibold text-[hsl(var(--foreground))]"
                >
                  {activeTab === "geral" ? "Geral" : activeTab === "conta" ? "Conta" : "Sobre"}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-[hsl(var(--muted))] transition hover:bg-[hsl(var(--background-soft))] hover:text-[hsl(var(--foreground))]"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
                {activeTab === "geral" ? (
                  <div className="space-y-4">
                    <div className="surface-card p-4">
                      <p className="text-lg font-semibold text-[hsl(var(--foreground))]">Aparência</p>
                      <p className="text-sm text-[hsl(var(--muted))]">Tema da interface</p>
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background-soft))] p-1.5">
                        {[
                          { id: "light" as const, label: "Claro", icon: Sun },
                          { id: "system" as const, label: "Sistema", icon: Monitor },
                          { id: "dark" as const, label: "Escuro", icon: Moon }
                        ].map((item) => {
                          const Icon = item.icon
                          const isActive = theme === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setTheme(item.id)}
                              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                isActive
                                  ? "bg-[hsl(var(--background-elevated))] text-[hsl(var(--primary))]"
                                  : "text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                              }`}
                            >
                              <Icon size={15} />
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "conta" ? (
                  <div className="flex w-full max-w-md flex-col items-stretch space-y-6 text-left">
                    <div className="flex gap-4 items-start">
                      <div
                        className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(217,91%,52%)] to-[hsl(217,91%,38%)] text-xl font-bold tracking-tight text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.15)]"
                        aria-hidden
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-base font-semibold leading-snug text-[hsl(var(--foreground))]">
                          {userName.trim() || "Usuário"}
                        </p>
                        <p className="mt-1 break-all text-sm text-[hsl(var(--muted))]">{userEmail}</p>
                        <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--fg-subtle))]">
                          <span className="font-medium text-[hsl(var(--muted))]">
                            {role ? ROLE_LABELS[role] : "Perfil não definido"}
                          </span>
                          {username ? (
                            <>
                              <span className="mx-1.5 text-[hsl(var(--border))]">·</span>
                              <span>@{username}</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-[hsl(var(--muted))]">
                      Os dados da conta são gerenciados pelo administrador. Para alterar nome ou e-mail, solicite ao
                      gestor do sistema.
                    </p>

                    {feedback ? (
                      <div
                        className={
                          feedback.includes("sucesso")
                            ? "alert-success text-sm"
                            : "alert-error text-sm"
                        }
                      >
                        {feedback}
                      </div>
                    ) : null}

                    <div className="flex w-full flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => void handleResetPassword()}
                        disabled={isSendingReset}
                        className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] px-2 py-3.5 text-center text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--background-soft))] disabled:opacity-60"
                      >
                        {isSendingReset ? "Enviando..." : "Redefinir senha"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                        className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.09)] px-2 py-3.5 text-center text-sm font-semibold text-[hsl(var(--danger))] transition hover:bg-[hsl(var(--danger)/0.16)] disabled:opacity-60"
                      >
                        {isLoggingOut ? "Saindo..." : "Sair da conta"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {activeTab === "sobre" ? (
                  <div className="flex max-w-md flex-col items-start gap-5 text-left">
                    <div className="relative h-12 w-[11rem] shrink-0 sm:h-14 sm:w-[13rem]">
                      <Image
                        src="/brand/renova-black.png"
                        alt="Renova"
                        fill
                        className="object-contain object-left dark:hidden"
                        sizes="(max-width: 640px) 200px, 240px"
                        priority={false}
                      />
                      <Image
                        src="/brand/renova-white.png"
                        alt="Renova"
                        fill
                        className="hidden object-contain object-left dark:block"
                        sizes="(max-width: 640px) 200px, 240px"
                        priority={false}
                      />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                        Renova Enterprise Management System
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted))]">
                        Plataforma corporativa para validação comercial, governança de processos e gestão por perfis.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  )
}
