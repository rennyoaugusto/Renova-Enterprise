import { z } from "zod"
import { USER_ROLES } from "@/lib/constants"

const TIPO_PROJETO = ["portaria_remota", "sistema_tecnico", "outros"] as const
const MODELO_COMERCIAL = ["venda", "locacao"] as const

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
})

export type LoginInput = z.infer<typeof loginSchema>

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Informe um e-mail válido")
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>

export const definePasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "A confirmação deve ter pelo menos 6 caracteres")
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais"
  })

export type DefinePasswordInput = z.infer<typeof definePasswordSchema>

export const inviteUserSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  username: z
    .string()
    .min(3, "Informe o usuário")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou underscore"),
  email: z.string().email("Informe um e-mail válido"),
  papel: z.enum(USER_ROLES)
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>

export const updateUserSchema = z.object({
  nome: z.string().min(3, "Nome inválido").optional(),
  email: z.string().email("E-mail inválido").optional(),
  username: z
    .string()
    .min(3, "Usuário inválido")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou underscore")
    .optional(),
  papel: z.enum(USER_ROLES).optional(),
  ativo: z.boolean().optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const createValidacaoSchema = z
  .object({
    nome_cliente: z.string().min(3, "Informe o nome do cliente"),
    vendedor_id: z.string().uuid("Vendedor inválido"),
    analista_id: z.string().uuid("Analista inválido"),
    tipo_projeto: z.enum(TIPO_PROJETO),
    tipo_projeto_descricao: z.string().optional(),
    modelo_comercial: z.enum(MODELO_COMERCIAL),
    venda_valor_equipamentos: z.number().nonnegative().optional(),
    venda_valor_materiais: z.number().nonnegative().optional(),
    venda_valor_mao_obra: z.number().nonnegative().optional(),
    locacao_prazo_meses: z.number().int().positive().optional(),
    locacao_valor_mensal: z.number().nonnegative().optional(),
    locacao_custo_inicial: z.number().nonnegative().optional(),
    custo_prev_equipamentos: z.number().nonnegative(),
    custo_prev_materiais: z.number().nonnegative(),
    custo_prev_mao_obra: z.number().nonnegative(),
    justificativa_margem: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.tipo_projeto === "outros" && !data.tipo_projeto_descricao?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipo_projeto_descricao"],
        message: "Descrição complementar é obrigatória para tipo Outros"
      })
    }

    if (data.modelo_comercial === "venda") {
      if (typeof data.venda_valor_equipamentos !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["venda_valor_equipamentos"],
          message: "Informe o valor de equipamentos"
        })
      }
      if (typeof data.venda_valor_materiais !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["venda_valor_materiais"],
          message: "Informe o valor de materiais"
        })
      }
      if (typeof data.venda_valor_mao_obra !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["venda_valor_mao_obra"],
          message: "Informe o valor de mão de obra"
        })
      }
    }

    if (data.modelo_comercial === "locacao") {
      if (typeof data.locacao_prazo_meses !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["locacao_prazo_meses"],
          message: "Informe o prazo da locação"
        })
      }
      if (typeof data.locacao_valor_mensal !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["locacao_valor_mensal"],
          message: "Informe o valor mensal da locação"
        })
      }
    }
  })

export type CreateValidacaoInput = z.infer<typeof createValidacaoSchema>
