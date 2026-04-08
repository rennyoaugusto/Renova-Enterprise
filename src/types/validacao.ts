export const STATUS_VALIDACAO = [
  "em_validacao",
  "aguardando_comercial",
  "em_revisao",
  "aprovado",
  "enviado_implantacao",
  "cancelado"
] as const

export const ETAPA_VALIDACAO = ["kickoff", "vistoria", "projeto", "calculadora", "envio_comercial"] as const

export type StatusValidacao = (typeof STATUS_VALIDACAO)[number]
export type EtapaValidacao = (typeof ETAPA_VALIDACAO)[number]

export type ValidacaoListItem = {
  id: string
  nome_cliente: string
  tipo_projeto: string
  modelo_comercial: string
  status: StatusValidacao
  etapa_atual: EtapaValidacao
  numero_revisoes: number
  venda_valor_mao_obra: number | null
  locacao_valor_mensal: number | null
  venda_valor_total: number | null
  locacao_valor_total: number | null
  custo_prev_total: number | null
  custo_rev_total: number | null
  atualizado_em: string
  vendedor_id: string
  analista_id: string
  vendedor_nome: string | null
  analista_nome: string | null
}

export type ValidacaoEtapa = {
  id: string
  validacao_id: string
  etapa: EtapaValidacao
  revisao_numero: number
  concluida: boolean
  concluida_em: string | null
  concluida_por: string | null
  kickoff_ata: string | null
  kickoff_vendido: string | null
  kickoff_pontos_atencao: string | null
  kickoff_premissas: string | null
  kickoff_data_reuniao: string | null
  vistoria_observacoes: string | null
  vistoria_comentarios: string | null
  vistoria_data: string | null
  vistoria_resultado: "viavel" | "viavel_com_ressalvas" | "inviavel" | null
  vistoria_justificativa_inviavel: string | null
  projeto_descricao_tecnica: string | null
  projeto_ajustes_escopo: string | null
  projeto_comentarios: string | null
  calc_custo_equipamentos: number | null
  calc_custo_materiais: number | null
  calc_custo_mao_obra: number | null
  calc_justificativa: string | null
  envio_resumo_tecnico: string | null
  envio_justificativas: string | null
  envio_comentarios: string | null
  sla_inicio: string
  sla_limite: string | null
}

export type ValidacaoDetalhe = {
  id: string
  nome_cliente: string
  tipo_projeto: string
  tipo_projeto_descricao: string | null
  modelo_comercial: string
  status: StatusValidacao
  etapa_atual: EtapaValidacao
  numero_revisoes: number
  venda_valor_total: number | null
  locacao_valor_total: number | null
  custo_prev_total: number | null
  custo_rev_total: number | null
  vendedor_nome: string | null
  analista_nome: string | null
  criado_em: string
  atualizado_em: string
  etapas: ValidacaoEtapa[]
}
