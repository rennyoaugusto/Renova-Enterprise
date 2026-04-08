"use client"

import { useMemo, useState } from "react"
import { ChevronRight, KeyRound, LogOut, Monitor, Moon, Sun, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { useTheme } from "@/components/shared/theme-provider"
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
  const [activeTab, setActiveTab] = useState<"geral" | "conta" | "sobre">("geral")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const initials = useMemo(
    () =>
      userName
        .split(" ")
        .slice(0, 2)
        .map((name) => name[0])
        .join("")
        .toUpperCase(),
    [userName]
  )
  const username = useMemo(() => usernameFromName(userName) || userEmail.split("@")[0] || "", [userEmail, userName])

  async function handleResetPassword() {
    setFeedback(null)
    setIsSendingReset(true)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/primeiro-acesso`
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
          setActiveTab("geral")
          setOpen(true)
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))/0.12] text-sm font-semibold text-[hsl(var(--primary))]">
          {initials}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">{userName}</p>
          <p className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--muted))]">Minha conta</p>
        </div>
        <ChevronRight size={18} className="text-[hsl(var(--muted))]" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="surface-card-strong relative grid h-[72vh] w-full max-w-5xl overflow-hidden p-0 md:h-[72vh] md:grid-cols-[240px,1fr]">
            <aside className="border-r border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))/0.45] p-5 md:overflow-y-auto">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Configurações</h2>
              <div className="mt-6 space-y-1">
                {[
                  { id: "geral" as const, label: "Geral" },
                  { id: "conta" as const, label: "Conta" },
                  { id: "sobre" as const, label: "Sobre" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-[hsl(var(--background-soft))] text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted))] hover:bg-[hsl(var(--background-soft))/0.7]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </aside>

            <section className="overflow-y-auto p-6 md:p-7">
              <div className="mb-6 flex items-start justify-between">
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                  {activeTab === "geral" ? "Geral" : activeTab === "conta" ? "Conta" : "Sobre"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="premium-button-secondary absolute right-4 top-4 p-2"
                aria-label="Fechar modal"
              >
                <X size={16} />
              </button>

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
                <div className="space-y-4">
                  <p className="section-eyebrow">Dados da conta</p>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                      Nome completo
                    </label>
                    <input value={userName} readOnly className="premium-input font-semibold text-[hsl(var(--foreground))]" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                        E-mail
                      </label>
                      <input value={userEmail} readOnly className="premium-input font-semibold text-[hsl(var(--foreground))]" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                        Usuário
                      </label>
                      <input value={username} readOnly className="premium-input font-semibold text-[hsl(var(--foreground))]" />
                    </div>
                  </div>
                  <p className="section-eyebrow">Perfil e permissões</p>
                  <p className="text-sm text-[hsl(var(--muted))]">
                    {role ? ROLE_LABELS[role] : "Sem perfil definido para esta conta."}
                  </p>
                  {feedback ? (
                    <div className="alert-success">{feedback}</div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isSendingReset}
                      className="premium-button-secondary inline-flex items-center gap-2"
                    >
                      <KeyRound size={15} />
                      {isSendingReset ? "Enviando..." : "Redefinir senha"}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="premium-button inline-flex items-center gap-2"
                    >
                      <LogOut size={15} />
                      {isLoggingOut ? "Saindo..." : "Sair"}
                    </button>
                  </div>
                </div>
              ) : null}

              {activeTab === "sobre" ? (
                <div className="surface-card p-4">
                  <p className="text-base font-semibold text-[hsl(var(--foreground))]">Sistema PILAR</p>
                  <p className="mt-2 text-sm text-[hsl(var(--muted))]">
                    Painel de validação comercial com controle de acesso por perfil, auditoria e fluxos de
                    aprovação.
                  </p>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}
    </>
  )
}
