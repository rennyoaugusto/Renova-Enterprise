"use client"

import { useEffect, useMemo, useState } from "react"
import { PencilLine, Search, Trash2, X } from "lucide-react"

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

export function UsuarioTable() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"todos" | UserRole>("todos")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos")
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadUsers() {
    setLoading(true)
    setError(null)

    const response = await fetch("/api/usuarios", { cache: "no-store" })
    const body = await response.json()

    if (!response.ok) {
      setError(body.error ?? "Falha ao carregar usuários")
      setLoading(false)
      return
    }

    setUsers(body.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  function openEditModal(user: Usuario) {
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
      await loadUsers()
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteUser() {
    if (!editingUser) return
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/usuarios/${editingUser.id}`, {
        method: "DELETE"
      })
      const body = await response.json()

      if (!response.ok) {
        setError(getApiErrorMessage(body, "Falha ao excluir usuário"))
        return
      }

      setEditingUser(null)
      await loadUsers()
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
      <section className="surface-card p-6">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Pesquisar usuário</label>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome, e-mail ou perfil..."
                className="premium-input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Filtrar por papel</label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as "todos" | UserRole)}
              className="premium-input"
            >
              <option value="todos">Todos</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted))]">Filtrar por status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="premium-input"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="alert-error mb-4">{error}</div>
        ) : null}

        {loading ? (
          <Loading label="Carregando usuários..." rows={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium text-[hsl(var(--foreground))]">{user.nome}</td>
                    <td className="text-[hsl(var(--muted))]">{usernameFromName(user.nome, user.email)}</td>
                    <td className="text-[hsl(var(--muted))]">{user.email}</td>
                    <td>
                      <span className="tag tag-primary">{ROLE_LABELS[user.papel]}</span>
                    </td>
                    <td>
                      <span className={user.ativo ? "tag tag-success" : "tag"}>
                        {user.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="premium-button-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
                      >
                        <PencilLine size={14} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-[hsl(var(--muted))]">
                Nenhum usuário encontrado para o filtro selecionado.
              </p>
            ) : null}
          </div>
        )}
      </section>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="surface-card-strong w-full max-w-3xl p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="section-eyebrow">Gestão de usuários</p>
                <h3 className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))]">Editar usuário</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="premium-button-secondary p-2"
                aria-label="Fechar modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Nome completo</label>
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
                <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Nome de usuário</label>
                <input
                  className="premium-input"
                  value={editingUser.username}
                  onChange={(event) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, username: event.target.value.trim().toLowerCase() } : prev
                    )
                  }
                />
                <p className="mt-1 text-xs text-[hsl(var(--muted))]">Padrão recomendado: nome.sobrenome</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">E-mail</label>
                <input
                  className="premium-input"
                  type="email"
                  value={editingUser.email}
                  onChange={(event) =>
                    setEditingUser((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">Papel</label>
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
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                  <input
                    type="checkbox"
                    checked={editingUser.ativo}
                    onChange={(event) =>
                      setEditingUser((prev) => (prev ? { ...prev, ativo: event.target.checked } : prev))
                    }
                  />
                  Conta ativa
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => void deleteUser()}
                disabled={isDeleting}
                className="btn-danger inline-flex items-center gap-2 disabled:opacity-70"
              >
                <Trash2 size={15} />
                {isDeleting ? "Excluindo..." : "Excluir usuário"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="premium-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void saveEditedUser()}
                  disabled={isSaving}
                  className="premium-button disabled:opacity-70"
                >
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
