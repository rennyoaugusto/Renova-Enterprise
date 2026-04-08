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
      className="hidden h-screen w-[224px] flex-shrink-0 flex-col md:flex"
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
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
            boxShadow: "0 4px 12px hsl(var(--primary) / 0.3)"
          }}
        >
          P
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none" style={{ color: "hsl(var(--foreground))" }}>
            PILAR
          </p>
          <p className="mt-0.5 text-[11px] leading-none" style={{ color: "hsl(var(--muted))" }}>
            Sistema operacional
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3">
        <p
          className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
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
        <p className="mt-2 text-[10px]" style={{ color: "hsl(var(--muted))" }}>
          MK Solutions &middot; v1.0
        </p>
      </div>
    </aside>
  )
}
