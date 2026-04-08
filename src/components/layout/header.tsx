import { NotificationBell } from "@/components/layout/notification-bell"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function Header() {
  return (
    <header
      className="flex h-14 flex-shrink-0 items-center justify-between px-5"
      style={{
        background: "hsl(var(--background-elevated))",
        borderBottom: "1px solid hsl(var(--border))"
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="hidden h-5 w-px md:block"
          style={{ background: "hsl(var(--border))" }}
          aria-hidden="true"
        />
        <div>
          <p
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--muted))" }}
          >
            Sistema PILAR
          </p>
          <p
            className="text-sm font-semibold leading-tight"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Painel de gestão
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
