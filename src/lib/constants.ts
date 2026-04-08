import type { UserRole } from "@/types/usuario"

export const USER_ROLES = [
  "super_admin",
  "coordenador",
  "analista",
  "vendedor",
  "comercial"
] as const

export const ADMIN_ROLES: UserRole[] = ["super_admin", "coordenador"]

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  coordenador: "Coordenador",
  analista: "Analista",
  vendedor: "Vendedor",
  comercial: "Comercial"
}
