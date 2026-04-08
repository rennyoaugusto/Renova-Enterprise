-- 00004_create_etapas.sql
-- Fase 3: registro de cada etapa da validação

CREATE TABLE IF NOT EXISTS validacao_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  etapa etapa_validacao NOT NULL,
  revisao_numero INTEGER NOT NULL DEFAULT 0,
  concluida BOOLEAN NOT NULL DEFAULT false,
  concluida_em TIMESTAMPTZ,
  concluida_por UUID REFERENCES profiles(id),
  kickoff_ata TEXT,
  kickoff_vendido TEXT,
  kickoff_pontos_atencao TEXT,
  kickoff_premissas TEXT,
  kickoff_data_reuniao DATE,
  kickoff_participantes UUID[],
  vistoria_observacoes TEXT,
  vistoria_comentarios TEXT,
  vistoria_data DATE,
  vistoria_resultado resultado_vistoria,
  vistoria_justificativa_inviavel TEXT,
  projeto_descricao_tecnica TEXT,
  projeto_ajustes_escopo TEXT,
  projeto_comentarios TEXT,
  calc_custo_equipamentos DECIMAL(12,2),
  calc_custo_materiais DECIMAL(12,2),
  calc_custo_mao_obra DECIMAL(12,2),
  calc_justificativa TEXT,
  envio_resumo_tecnico TEXT,
  envio_justificativas TEXT,
  envio_comentarios TEXT,
  sla_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  sla_limite TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_etapas_validacao ON validacao_etapas(validacao_id);
CREATE INDEX IF NOT EXISTS idx_etapas_etapa ON validacao_etapas(etapa);
CREATE INDEX IF NOT EXISTS idx_etapas_revisao ON validacao_etapas(revisao_numero);

DROP TRIGGER IF EXISTS set_etapas_updated_at ON validacao_etapas;
CREATE TRIGGER set_etapas_updated_at
  BEFORE UPDATE ON validacao_etapas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
