"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { KeyRound, PencilLine, RefreshCw, Search, Trash2, UserPlus, Users, X } from "lucide-react"

import { ROLE_LABELS, USER_ROLES } from "@/lib/constants"
import { Loading } from "@/components/shared/loading"
import type { UserRole, Usuario } from "@/types/usuario"

type StatusFilter = "todos" | "ativo" | "inativo"
type EditingUser = Usuario & {
  nomeCompleto: string
  username: string
  originalName: string
  originalEmail: string
  originalRole: UserRole
  originalAtivo: boolean
  originalUsername: string
}

function splitName(fullName: string) {
  const chunks = fullName.trim().split(/\s+/)
  const firstName = chunks[0] ?? ""
  const lastName = chunks.slice(1).join(" ") || ""
  return { firstName, lastName }
}

function usernameFromEmail(email: string) {
  return email.split("@")[0] ?? ""
}

function usernameFromName(fullName: string, fallbackEmail: string) {
  const { firstName, lastName } = splitName(fullName)
  return buildUsername(firstName, lastName) || usernameFromEmail(fallbackEmail)
}

function slugifyPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function buildUsername(firstName: string, lastName: string) {
  const first = slugifyPart(firstName)
  const last = slugifyPart(lastName)
  if (!first && !last) return ""
  if (!last) return first
  return `${first}.${last}`
}

function initialsFromName(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.charAt(0) ?? "?"
  const last = parts.length > 1 ? parts[parts.length - 1] : ""
  const b = last ? last.charAt(0) : ""
  return (a + b).toUpperCase()
}

function formatCadastro(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: ptBR })
  } catch {
    return "—"
  }
}

function getApiErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "object" && body && "error" in body) {
    const maybeError = (body as { error?: unknown }).error
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError
    }
    if (
      typeof maybeError === "object" &&
      maybeError &&
      "fieldErrors" in maybeError &&
      typeof (maybeError as { fieldErrors?: unknown }).fieldErrors === "object"
    ) {
      const entries = Object.entries(
        ((maybeError as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {}) as Record<
          string,
          string[]
        >
      )
      const firstFieldError = entries.flatMap(([, messages]) => messages ?? [])[0]
      if (firstFieldError) {
        return firstFieldError
      }
    }
  }
  return fallback
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="surface-card flex flex-col gap-0.5 rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--muted))]">
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums tracking-tight text-[hsl(var(--foreground))]">
        {value}
      </span>
      {hint ? <span className="text-xs text-[hsl(var(--muted))]">{hint}</span> : null}
    </div>
  )
}

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativo", label: "Ativos" },
  { id: "inativo", label: "Inativos" }
]

export function UsuarioTable() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"todos" | UserRole>("todos")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos")
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function loadUsers(mode: "initial" | "refresh" = "initial") {
    const isRefresh = mode === "refresh"
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch("/api/usuarios", { cache: "no-store" })
      const body = await response.json()

      if (!response.ok) {
        setError(body.error ?? "Falha ao carregar usuários")
        return
      }

      setUsers(body.data ?? [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadUsers("initial")
  }, [])

  useEffect(() => {
    if (!editingUser) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setEditingUser(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [editingUser])

  const stats = useMemo(() => {
    const total = users.length
    const ativos = users.filter((u) => u.ativo).length
    const inativos = total - ativos
    return { total, ativos, inativos }
  }, [users])

  function openEditModal(user: Usuario) {
    setSuccessMessage(null)
    setEditingUser({
      ...user,
      nomeCompleto: user.nome,
      username: usernameFromName(user.nome, user.email),
      originalName: user.nome,
      originalEmail: user.email,
      originalRole: user.papel,
      originalAtivo: user.ativo,
      originalUsername: usernameFromName(user.nome, user.email)
    })
  }

  async function saveEditedUser() {
    if (!editingUser) return
    setIsSaving(true)
    setError(null)

    try {
      const fullName = editingUser.nomeCompleto.trim()
      const payload: Record<string, unknown> = {}

      if (fullName && fullName !== editingUser.originalName) {
        payload.nome = fullName
      }
      if (editingUser.email !== editingUser.originalEmail) {
        payload.email = editingUser.email
      }
      if (editingUser.username !== editingUser.originalUsername) {
        payload.username = editingUser.username
      }
      if (editingUser.papel !== editingUser.originalRole) {
        payload.papel = editingUser.papel
      }
      if (editingUser.ativo !== editingUser.originalAtivo) {
        payload.ativo = editingUser.ativo
      }

      if (Object.keys(payload).length === 0) {
        setEditingUser(null)
        return
      }

      const response = await fetch(`/api/usuarios/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const body = await response.json()

      if (!response.ok) {
        setError(getApiErrorMessage(body, "Falha ao salvar usuário"))
        return
      }

      setEditingUser(null)
      await loadUsers("refresh")
    } finally {
      setIsSaving(false)
    }
  }

  async function sendPasswordResetForUser() {
    if (!editingUser) return
    setIsSendingReset(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/usuarios/${editingUser.id}/enviar-redefinicao-senha`, {
        method: "POST"
      })
      const body = await response.json()

      if (!response.ok) {
        const hint = typeof body.hint === "string" ? ` ${body.hint}` : ""
        setError(getApiErrorMessage(body, "Falha ao enviar redefinição de senha") + hint)
        return
      }

      setSuccessMessage(typeof body.message === "string" ? body.message : "E-mail de redefinição enviado.")
    } finally {
      setIsSendingReset(false)
    }
  }

  async function deleteUser() {
    if (!editingUser) return
    setIsDeleting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/usuarios/${editingUser.id}`, {
        method: "DELETE"
      })
      const body = await response.json()

      if (!response.ok) {
        setError(getApiErrorMessage(body, "Falha ao excluir usuário"))
        return
      }

      let msg: string | null = null
      if (typeof body.message === "string" && body.message.trim()) {
        msg =
          typeof body.warning === "string" && body.warning.trim()
            ? `${body.message.trim()} (${body.warning.trim()})`
            : body.message.trim()
      } else if (body.mode === "removido") {
        msg =
          typeof body.message === "string" && body.message.trim()
            ? body.message.trim()
            : "Usuário removido do sistema."
      }
      setSuccessMessage(msg)

      setEditingUser(null)
      await loadUsers("refresh")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchable = `${user.nome} ${user.email} ${user.papel}`.toLowerCase()
      const searchMatch = searchable.includes(search.toLowerCase())
      const roleMatch = roleFilter === "todos" || user.papel === roleFilter
      const statusMatch =
        statusFilter === "todos" ||
        (statusFilter === "ativo" && user.ativo) ||
        (statusFilter === "inativo" && !user.ativo)

      return searchMatch && roleMatch && statusMatch
    })
  }, [users, search, roleFilter, statusFilter])

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total" value={stats.total} hint="Usuários cadastrados" />
        <StatCard label="Ativos" value={stats.ativos} hint="Podem acessar o sistema" />
        <StatCard label="Inativos" value={stats.inativos} hint="Sem acesso ou desligados" />
      </div>

      <section className="surface-card overflow-hidden rounded-xl">
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-soft))] px-4 py-4 sm:px-5">
          {/* Grid: mesma altura de rótulo em todas as colunas + controles alinhados na base */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(11rem,0.55fr)_auto_auto] lg:items-end lg:gap-5">
            <div className="min-w-0">
              <label
                className="mb-1.5 block min-h-[1rem] text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]"
                htmlFor="usuarios-search"
              >
                Pesquisar
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))]"
                />
                <input
                  id="usuarios-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome, e-mail ou perfil..."
                  className="premium-input h-[42px] pl-10"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                className="mb-1.5 block min-h-[1rem] text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]"
                htmlFor="usuarios-papel"
              >
                Papel
              </label>
              <select
                id="usuarios-papel"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as "todos" | UserRole)}
                className="premium-input h-[42px]"
              >
                <option value="todos">Todos os papéis</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <span className="mb-1.5 block min-h-[1rem] text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                Status
              </span>
              <div
                className="inline-flex h-[42px] items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] p-0.5 shadow-sm"
                role="group"
                aria-label="Filtrar por status"
              >
                {STATUS_OPTIONS.map((opt) => {
                  const active = statusFilter === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatusFilter(opt.id)}
                      className={`h-[calc(100%-4px)] rounded-md px-3 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                          : "text-[hsl(var(--muted))] hover:bg-[hsl(var(--background-soft))] hover:text-[hsl(var(--foreground))]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col lg:w-auto">
              <span className="mb-1.5 block min-h-[1rem] text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                Lista
              </span>
              <button
                type="button"
                onClick={() => void loadUsers("refresh")}
                disabled={loading || refreshing}
                className="premium-button-secondary inline-flex h-[42px] shrink-0 items-center justify-center gap-2 px-4 disabled:opacity-60"
                title="Atualizar lista"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {error ? (
            <div className="alert-error mb-4">{error}</div>
          ) : null}

          {successMessage ? (
            <div className="alert-success mb-4">{successMessage}</div>
          ) : null}

          {loading ? (
            <Loading label="Carregando usuários..." rows={4} />
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <Users size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {users.length === 0
                    ? "Nenhum usuário cadastrado"
                    : "Nenhum resultado para os filtros"}
                </p>
                <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted))]">
                  {users.length === 0
                    ? "Envie um convite para começar a montar a equipe no sistema."
                    : "Ajuste a pesquisa ou os filtros para ver outros usuários."}
                </p>
              </div>
              {users.length === 0 ? (
                <Link
                  href="/usuarios/convidar"
                  className="premium-button inline-flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Convidar usuário
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="data-table min-w-[640px] sm:min-w-0">
                <thead>
                  <tr>
                    <th className="pl-4 sm:pl-0">Conta</th>
                    <th className="hidden md:table-cell">Login sugerido</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th className="hidden lg:table-cell">Cadastro</th>
                    <th className="pr-4 text-right sm:pr-0">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group">
                      <td className="pl-4 sm:pl-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-xs font-semibold text-[hsl(var(--primary-strong))]"
                            aria-hidden
                          >
                            {initialsFromName(user.nome)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-[hsl(var(--foreground))]">
                              {user.nome}
                            </div>
                            <div className="truncate text-xs text-[hsl(var(--muted))]">{user.email}</div>
                            <div className="truncate text-[0.65rem] text-[hsl(var(--fg-subtle))] md:hidden">
                              {usernameFromName(user.nome, user.email)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden max-w-[10rem] truncate text-[hsl(var(--muted))] md:table-cell">
                        {usernameFromName(user.nome, user.email)}
                      </td>
                      <td>
                        <span className="tag tag-primary whitespace-nowrap">{ROLE_LABELS[user.papel]}</span>
                      </td>
                      <td>
                        <span className={user.ativo ? "tag tag-success" : "tag"}>
                          {user.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap text-[hsl(var(--muted))] lg:table-cell">
                        {formatCadastro(user.criado_em)}
                      </td>
                      <td className="pr-4 text-right sm:pr-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="premium-button-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs opacity-90 transition-opacity group-hover:opacity-100"
                        >
                          <PencilLine size={14} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {editingUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditingUser(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="surface-card-strong flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col overflow-hidden shadow-xl"
          >
            {/* Cabeçalho */}
            <div className="relative border-b border-[hsl(var(--border))] bg-[hsl(var(--background-soft))] px-5 py-5 sm:px-6">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="premium-button-secondary absolute right-4 top-4 p-2 sm:right-5 sm:top-5"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
              <div className="flex flex-col gap-4 pr-12 sm:flex-row sm:items-center sm:gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.14)] text-base font-bold text-[hsl(var(--primary-strong))]"
                  aria-hidden
                >
                  {initialsFromName(editingUser.nomeCompleto)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
                    Editar usuário
                  </p>
                  <h3
                    id="edit-user-title"
                    className="mt-1 break-words text-xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-2xl"
                  >
                    {editingUser.nomeCompleto.trim() || "Sem nome"}
                  </h3>
                  <p className="mt-1 break-all text-sm text-[hsl(var(--muted))]">{editingUser.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="tag tag-primary text-xs">{ROLE_LABELS[editingUser.papel]}</span>
                    <span className={editingUser.ativo ? "tag tag-success text-xs" : "tag text-xs"}>
                      {editingUser.ativo ? "Conta ativa" : "Conta inativa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corpo rolável */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-6">
                <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] p-4 sm:p-5">
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Dados cadastrais</h4>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted))]">Nome, login sugerido e e-mail de acesso.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                        Nome completo
                      </label>
                      <input
                        className="premium-input"
                        value={editingUser.nomeCompleto}
                        onChange={(event) =>
                          setEditingUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  nomeCompleto: event.target.value,
                                  username: usernameFromName(event.target.value, prev.email) || prev.username
                                }
                              : prev
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                        Nome de usuário
                      </label>
                      <input
                        className="premium-input"
                        value={editingUser.username}
                        onChange={(event) =>
                          setEditingUser((prev) =>
                            prev ? { ...prev, username: event.target.value.trim().toLowerCase() } : prev
                          )
                        }
                      />
                      <p className="mt-1.5 text-xs text-[hsl(var(--muted))]">Sugestão: nome.sobrenome</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                        E-mail
                      </label>
                      <input
                        className="premium-input"
                        type="email"
                        value={editingUser.email}
                        onChange={(event) =>
                          setEditingUser((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] p-4 sm:p-5">
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Acesso ao sistema</h4>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted))]">Perfil e se a conta pode entrar na plataforma.</p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                        Papel
                      </label>
                      <select
                        className="premium-input"
                        value={editingUser.papel}
                        onChange={(event) =>
                          setEditingUser((prev) =>
                            prev ? { ...prev, papel: event.target.value as UserRole } : prev
                          )
                        }
                      >
                        {USER_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 sm:min-w-[200px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                        checked={editingUser.ativo}
                        onChange={(event) =>
                          setEditingUser((prev) => (prev ? { ...prev, ativo: event.target.checked } : prev))
                        }
                      />
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">Conta ativa</span>
                    </label>
                  </div>
                </section>

                <section className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background-soft))] p-4 sm:p-5">
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Senha</h4>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted))]">
                    Envia um e-mail com link seguro para o usuário definir uma nova senha (requer Resend configurado no
                    servidor).
                  </p>
                  <button
                    type="button"
                    onClick={() => void sendPasswordResetForUser()}
                    disabled={isSendingReset}
                    className="premium-button-secondary mt-3 inline-flex items-center gap-2 disabled:opacity-70"
                  >
                    <KeyRound size={16} />
                    {isSendingReset ? "Enviando e-mail..." : "Enviar redefinição de senha"}
                  </button>
                </section>
              </div>
            </div>

            {/* Rodapé ações */}
            <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => void deleteUser()}
                  disabled={isDeleting}
                  className="btn-danger order-2 inline-flex items-center justify-center gap-2 sm:order-1 disabled:opacity-70"
                >
                  <Trash2 size={15} />
                  {isDeleting ? "Excluindo..." : "Excluir da base"}
                </button>
                <div className="order-1 flex flex-wrap justify-end gap-2 sm:order-2">
                  <button type="button" onClick={() => setEditingUser(null)} className="premium-button-secondary">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveEditedUser()}
                    disabled={isSaving}
                    className="premium-button min-w-[9rem] disabled:opacity-70"
                  >
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
