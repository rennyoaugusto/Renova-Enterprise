-- 00014_create_remaining_core_tables.sql
-- Backfill das tabelas pendentes que estavam em placeholders (00008, 00009, 00010)

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID NOT NULL REFERENCES profiles(id),
  tipo VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  referencia_tipo VARCHAR(50),
  referencia_id UUID,
  lida BOOLEAN NOT NULL DEFAULT false,
  lida_em TIMESTAMPTZ,
  enviar_email BOOLEAN NOT NULL DEFAULT false,
  email_enviado BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_destinatario ON notificacoes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notif_lida ON notificacoes(destinatario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notif_criado_em ON notificacoes(criado_em DESC);

CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  descricao TEXT,
  atualizado_por UUID REFERENCES profiles(id),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('sla_kickoff', '2', 'SLA da etapa KickOff em dias úteis'),
  ('sla_vistoria', '5', 'SLA da etapa Vistoria em dias úteis'),
  ('sla_projeto', '5', 'SLA da etapa Projeto em dias úteis'),
  ('sla_calculadora', '3', 'SLA da etapa Calculadora em dias úteis'),
  ('sla_envio_comercial', '2', 'SLA da etapa Envio ao Comercial em dias úteis'),
  ('max_revisoes', '5', 'Quantidade máxima de revisões por validação'),
  ('margem_minima', '15', 'Margem mínima aceitável em %'),
  ('margem_bloqueio', '0', 'Margem que bloqueia salvamento em %'),
  ('anexo_tamanho_max_mb', '25', 'Tamanho máximo de anexo em MB'),
  ('anexo_formatos', '["pdf","xlsx","xls","docx","png","jpg","jpeg"]', 'Formatos de anexo permitidos')
ON CONFLICT (chave) DO NOTHING;

CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id),
  nome_cliente VARCHAR(255) NOT NULL,
  tipo_projeto tipo_projeto NOT NULL,
  tipo_projeto_descricao TEXT,
  custo_final_equipamentos DECIMAL(12,2),
  custo_final_materiais DECIMAL(12,2),
  custo_final_mao_obra DECIMAL(12,2),
  custo_final_total DECIMAL(12,2),
  status VARCHAR(50) NOT NULL DEFAULT 'aguardando_inicio',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obras_validacao ON obras(validacao_id);

DROP TRIGGER IF EXISTS set_obras_updated_at ON obras;
CREATE TRIGGER set_obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notificações: ver próprias" ON notificacoes;
CREATE POLICY "Notificações: ver próprias"
  ON notificacoes FOR SELECT
  USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS "Notificações: atualizar próprias" ON notificacoes;
CREATE POLICY "Notificações: atualizar próprias"
  ON notificacoes FOR UPDATE
  USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS "Configurações: todos leem" ON configuracoes;
CREATE POLICY "Configurações: todos leem"
  ON configuracoes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Configurações: admin edita" ON configuracoes;
CREATE POLICY "Configurações: admin edita"
  ON configuracoes FOR UPDATE
  USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Obras: admin e coordenador veem" ON obras;
CREATE POLICY "Obras: admin e coordenador veem"
  ON obras FOR SELECT
  USING (is_admin());
