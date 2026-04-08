-- 00011_setup_rls.sql
-- Fase 1A + Fase 3: RLS de perfis e módulo de validação

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_revisoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT papel FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('super_admin', 'coordenador');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION can_view_validacao(target_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM validacoes v
    WHERE v.id = target_id
      AND (
        is_admin()
        OR v.analista_id = auth.uid()
        OR v.vendedor_id = auth.uid()
        OR (
          get_user_role() = 'comercial'
          AND v.status IN ('aguardando_comercial', 'aprovado', 'em_revisao')
        )
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Profiles: ver próprio perfil" ON profiles;
CREATE POLICY "Profiles: ver próprio perfil"
  ON profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: admin vê todos" ON profiles;
CREATE POLICY "Profiles: admin vê todos"
  ON profiles FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Profiles: admin edita" ON profiles;
CREATE POLICY "Profiles: admin edita"
  ON profiles FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Validações: admin vê todas" ON validacoes;
CREATE POLICY "Validações: admin vê todas"
  ON validacoes FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Validações: analista vê atribuídas" ON validacoes;
CREATE POLICY "Validações: analista vê atribuídas"
  ON validacoes FOR SELECT
  USING (analista_id = auth.uid());

DROP POLICY IF EXISTS "Validações: vendedor vê próprias" ON validacoes;
CREATE POLICY "Validações: vendedor vê próprias"
  ON validacoes FOR SELECT
  USING (vendedor_id = auth.uid());

DROP POLICY IF EXISTS "Validações: comercial vê em aguardando" ON validacoes;
CREATE POLICY "Validações: comercial vê em aguardando"
  ON validacoes FOR SELECT
  USING (
    get_user_role() = 'comercial'
    AND status IN ('aguardando_comercial', 'aprovado', 'em_revisao')
  );

DROP POLICY IF EXISTS "Validações: inserir (vendedor, analista, admin)" ON validacoes;
CREATE POLICY "Validações: inserir (vendedor, analista, admin)"
  ON validacoes FOR INSERT
  WITH CHECK (get_user_role() IN ('super_admin', 'coordenador', 'analista', 'vendedor'));

DROP POLICY IF EXISTS "Validações: atualizar (analista atribuído ou admin)" ON validacoes;
CREATE POLICY "Validações: atualizar (analista atribuído ou admin)"
  ON validacoes FOR UPDATE
  USING (analista_id = auth.uid() OR is_admin())
  WITH CHECK (analista_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Etapas: ver se pode ver validação" ON validacao_etapas;
CREATE POLICY "Etapas: ver se pode ver validação"
  ON validacao_etapas FOR SELECT
  USING (can_view_validacao(validacao_id));

DROP POLICY IF EXISTS "Etapas: inserir (analista ou admin)" ON validacao_etapas;
CREATE POLICY "Etapas: inserir (analista ou admin)"
  ON validacao_etapas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
        AND (v.analista_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Etapas: atualizar (analista ou admin)" ON validacao_etapas;
CREATE POLICY "Etapas: atualizar (analista ou admin)"
  ON validacao_etapas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
        AND (v.analista_id = auth.uid() OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
        AND (v.analista_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Revisões: visualização pela validação" ON validacao_revisoes;
CREATE POLICY "Revisões: visualização pela validação"
  ON validacao_revisoes FOR SELECT
  USING (can_view_validacao(validacao_id));

DROP POLICY IF EXISTS "Revisões: comercial solicita" ON validacao_revisoes;
CREATE POLICY "Revisões: comercial solicita"
  ON validacao_revisoes FOR INSERT
  WITH CHECK (
    get_user_role() = 'comercial'
    AND EXISTS (
      SELECT 1
      FROM validacoes v
      WHERE v.id = validacao_id
        AND v.status = 'aguardando_comercial'
    )
  );

DROP POLICY IF EXISTS "Revisões: admin/coordenador gerenciam" ON validacao_revisoes;
CREATE POLICY "Revisões: admin/coordenador gerenciam"
  ON validacao_revisoes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Anexos: visualização pela validação" ON validacao_anexos;
CREATE POLICY "Anexos: visualização pela validação"
  ON validacao_anexos FOR SELECT
  USING (can_view_validacao(validacao_id));

DROP POLICY IF EXISTS "Anexos: escrita (analista/admin)" ON validacao_anexos;
CREATE POLICY "Anexos: escrita (analista/admin)"
  ON validacao_anexos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
        AND (v.analista_id = auth.uid() OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
        AND (v.analista_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Log: admin e coordenador veem" ON validacao_log;
CREATE POLICY "Log: admin e coordenador veem"
  ON validacao_log FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Log: sistema insere" ON validacao_log;
CREATE POLICY "Log: sistema insere"
  ON validacao_log FOR INSERT
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('validacoes-anexos', 'validacoes-anexos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anexos: leitura" ON storage.objects;
CREATE POLICY "Anexos: leitura"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'validacoes-anexos'
    AND EXISTS (
      SELECT 1
      FROM validacoes v
      WHERE v.id::text = (storage.foldername(name))[1]
        AND (
          is_admin()
          OR v.analista_id = auth.uid()
          OR v.vendedor_id = auth.uid()
          OR (
            get_user_role() = 'comercial'
            AND v.status IN ('aguardando_comercial', 'aprovado', 'em_revisao')
          )
        )
    )
  );

DROP POLICY IF EXISTS "Anexos: upload" ON storage.objects;
CREATE POLICY "Anexos: upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'validacoes-anexos'
    AND EXISTS (
      SELECT 1
      FROM validacoes v
      WHERE v.id::text = (storage.foldername(name))[1]
        AND (v.analista_id = auth.uid() OR is_admin())
    )
  );
