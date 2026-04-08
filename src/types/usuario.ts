export type UserRole = "super_admin" | "coordenador" | "analista" | "vendedor" | "comercial"

export type Usuario = {
  id: string
  nome: string
  email: string
  papel: UserRole
  ativo: boolean
  criado_em: string
}
