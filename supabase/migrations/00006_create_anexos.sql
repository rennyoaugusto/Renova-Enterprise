-- 00006_create_anexos.sql
-- Fase 3: anexos de validação com versionamento

CREATE TABLE IF NOT EXISTS validacao_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  etapa etapa_validacao,
  revisao_numero INTEGER NOT NULL DEFAULT 0,
  nome_original VARCHAR(255) NOT NULL,
  nome_storage VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(50) NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  categoria VARCHAR(100),
  versao INTEGER NOT NULL DEFAULT 1,
  substituido_por UUID REFERENCES validacao_anexos(id),
  enviado_por UUID NOT NULL REFERENCES profiles(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anexos_validacao ON validacao_anexos(validacao_id);
CREATE INDEX IF NOT EXISTS idx_anexos_etapa ON validacao_anexos(etapa);
CREATE INDEX IF NOT EXISTS idx_anexos_categoria ON validacao_anexos(categoria);
