import type { UserRole } from "@/types/usuario"

export type NavItemConfig = {
  label: string
  href: string
  roles: UserRole[]
}

export const SYSTEM_NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["super_admin", "coordenador", "analista", "vendedor", "comercial"]
  },
  {
    label: "Validações",
    href: "/validacoes",
    roles: ["super_admin", "coordenador", "analista", "vendedor", "comercial"]
  },
  {
    label: "Usuários",
    href: "/usuarios",
    roles: ["super_admin", "coordenador"]
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    roles: ["super_admin"]
  },
  {
    label: "Métricas",
    href: "/metricas",
    roles: ["super_admin", "coordenador"]
  }
]
