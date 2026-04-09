import Image from "next/image"

import { AccountPanel } from "@/components/layout/account-panel"
import { NavItem } from "@/components/layout/nav-item"
import { SYSTEM_NAV_ITEMS } from "@/lib/navigation"
import type { UserRole } from "@/types/usuario"

type SidebarProps = {
  role: UserRole | null
  userName: string
  userEmail: string
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const navItems = SYSTEM_NAV_ITEMS.filter((item) => (role ? item.roles.includes(role) : false))

  return (
    <aside
      className="hidden h-screen w-[272px] flex-shrink-0 flex-col md:flex"
      style={{
        background: "hsl(var(--background-elevated))",
        borderRight: "1px solid hsl(var(--border))"
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <Image
          src="/brand/renova-icon.png"
          alt="Renova logo"
          width={34}
          height={34}
          className="rounded-lg"
        />
        <div className="min-w-0">
          <p className="text-[0.9375rem] font-semibold leading-tight" style={{ color: "hsl(var(--foreground))" }}>
            Renova
          </p>
          <p className="mt-0.5 text-xs leading-snug" style={{ color: "hsl(var(--muted))" }}>
            Enterprise Management System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3">
        <p
          className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          Navegação
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} />
          ))}
        </div>
      </nav>

      {/* Footer account */}
      <div
        className="px-3 py-3"
        style={{ borderTop: "1px solid hsl(var(--border))" }}
      >
        <AccountPanel userName={userName} userEmail={userEmail} role={role} />
        <p className="mt-2 text-[11px]" style={{ color: "hsl(var(--muted))" }}>
          MK Solutions &middot; v1.0
        </p>
      </div>
    </aside>
  )
}
