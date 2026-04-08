"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

type NotificationItem = {
  id: string
  titulo: string
  mensagem: string | null
  lida: boolean
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const response = await fetch("/api/notificacoes?limit=6", { cache: "no-store" })
    const body = await response.json().catch(() => ({}))
    if (response.ok) {
      setItems((body.data ?? []) as NotificationItem[])
      setUnreadCount(Number(body.unread_count ?? 0))
    }
    setLoading(false)
  }

  async function markAllAsRead() {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true, lida: true })
    })
    await load()
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--background-soft))]"
        onClick={() => {
          setOpen((prev) => !prev)
          if (!open) {
            void load()
          }
        }}
        aria-label="Notificações"
      >
        <Bell size={16} />
        {unreadCount > 0 ? (
          <span
            className="absolute -right-1 -top-1 rounded-full px-1.5 text-[10px] font-semibold text-white"
            style={{ background: "hsl(var(--danger))" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-elevated))] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Notificações</p>
            <button type="button" className="text-xs text-[hsl(var(--muted))] hover:underline" onClick={() => void markAllAsRead()}>
              Marcar todas como lidas
            </button>
          </div>
          {loading ? (
            <p className="text-xs text-[hsl(var(--muted))]">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted))]">Sem notificações.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-[hsl(var(--border))] p-2">
                  <p className="text-xs font-semibold">{item.titulo}</p>
                  {item.mensagem ? <p className="mt-1 text-xs text-[hsl(var(--muted))]">{item.mensagem}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
