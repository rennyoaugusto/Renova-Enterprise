"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FolderKanban, LayoutDashboard, Settings2, Users2 } from "lucide-react"

type NavItemProps = {
  href: string
  label: string
}

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/validacoes": FolderKanban,
  "/usuarios": Users2,
  "/configuracoes": Settings2,
  "/metricas": BarChart3
}

export function NavItem({ href, label }: NavItemProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)
  const Icon = iconMap[href as keyof typeof iconMap] ?? LayoutDashboard

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.9375rem] font-medium transition-all ${
        active
          ? "text-[hsl(var(--primary))]"
          : "text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
      }`}
      style={
        active
          ? {
              background: "hsl(var(--primary) / 0.08)",
              border: "1px solid hsl(var(--primary) / 0.12)"
            }
          : { border: "1px solid transparent" }
      }
    >
      <Icon size={16} className="flex-shrink-0" />
      <span>{label}</span>
    </Link>
  )
}
