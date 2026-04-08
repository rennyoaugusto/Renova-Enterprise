-- 00003_create_validacoes.sql
-- Fase 3: tabela principal do módulo de validação

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS validacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_cliente VARCHAR(255) NOT NULL,
  tipo_projeto tipo_projeto NOT NULL,
  tipo_projeto_descricao TEXT,
  vendedor_id UUID NOT NULL REFERENCES profiles(id),
  analista_id UUID NOT NULL REFERENCES profiles(id),
  criado_por UUID NOT NULL REFERENCES profiles(id),
  modelo_comercial modelo_comercial NOT NULL,
  venda_valor_equipamentos DECIMAL(12,2),
  venda_valor_materiais DECIMAL(12,2),
  venda_valor_mao_obra DECIMAL(12,2),
  venda_valor_total DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(venda_valor_equipamentos, 0) +
    COALESCE(venda_valor_materiais, 0) +
    COALESCE(venda_valor_mao_obra, 0)
  ) STORED,
  locacao_prazo_meses INTEGER,
  locacao_valor_mensal DECIMAL(12,2),
  locacao_custo_inicial DECIMAL(12,2) DEFAULT 0,
  locacao_valor_total DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(locacao_valor_mensal, 0) * COALESCE(locacao_prazo_meses, 0) +
    COALESCE(locacao_custo_inicial, 0)
  ) STORED,
  custo_prev_equipamentos DECIMAL(12,2) NOT NULL,
  custo_prev_materiais DECIMAL(12,2) NOT NULL,
  custo_prev_mao_obra DECIMAL(12,2) NOT NULL,
  custo_prev_total DECIMAL(12,2) GENERATED ALWAYS AS (
    custo_prev_equipamentos + custo_prev_materiais + custo_prev_mao_obra
  ) STORED,
  custo_rev_equipamentos DECIMAL(12,2),
  custo_rev_materiais DECIMAL(12,2),
  custo_rev_mao_obra DECIMAL(12,2),
  custo_rev_total DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(custo_rev_equipamentos, 0) +
    COALESCE(custo_rev_materiais, 0) +
    COALESCE(custo_rev_mao_obra, 0)
  ) STORED,
  status status_validacao NOT NULL DEFAULT 'em_validacao',
  etapa_atual etapa_validacao NOT NULL DEFAULT 'kickoff',
  numero_revisoes INTEGER NOT NULL DEFAULT 0,
  motivo_cancelamento motivo_cancelamento,
  justificativa_cancelamento TEXT,
  cancelado_por UUID REFERENCES profiles(id),
  cancelado_em TIMESTAMPTZ,
  aprovado_por UUID REFERENCES profiles(id),
  aprovado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_tipo_projeto_outros
    CHECK (tipo_projeto <> 'outros' OR tipo_projeto_descricao IS NOT NULL),
  CONSTRAINT chk_cancelamento_completo
    CHECK (
      (status <> 'cancelado') OR
      (motivo_cancelamento IS NOT NULL AND justificativa_cancelamento IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_validacoes_status ON validacoes(status);
CREATE INDEX IF NOT EXISTS idx_validacoes_etapa ON validacoes(etapa_atual);
CREATE INDEX IF NOT EXISTS idx_validacoes_vendedor ON validacoes(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_analista ON validacoes(analista_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_criado_em ON validacoes(criado_em DESC);

DROP TRIGGER IF EXISTS set_validacoes_updated_at ON validacoes;
CREATE TRIGGER set_validacoes_updated_at
  BEFORE UPDATE ON validacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
