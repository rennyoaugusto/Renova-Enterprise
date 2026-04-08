-- 00007_create_log.sql
-- Fase 3: auditoria de ações do fluxo de validação

CREATE TABLE IF NOT EXISTS validacao_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  acao VARCHAR(100) NOT NULL,
  detalhes JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_log_validacao ON validacao_log(validacao_id);
CREATE INDEX IF NOT EXISTS idx_log_usuario ON validacao_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_criado_em ON validacao_log(criado_em DESC);
