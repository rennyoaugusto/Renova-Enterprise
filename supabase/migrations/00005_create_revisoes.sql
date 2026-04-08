-- 00005_create_revisoes.sql
-- Fase 3: histórico de revisões

CREATE TABLE IF NOT EXISTS validacao_revisoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  solicitante_id UUID NOT NULL REFERENCES profiles(id),
  motivo TEXT NOT NULL,
  etapa_retorno etapa_validacao NOT NULL,
  comentarios TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revisoes_validacao ON validacao_revisoes(validacao_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_revisoes_numero ON validacao_revisoes(validacao_id, numero);
