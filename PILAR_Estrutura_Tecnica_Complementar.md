# SISTEMA PILAR — ESTRUTURA TÉCNICA COMPLEMENTAR
### Estrutura de Pastas + Modelagem SQL + Storage + Regras de Negócio
### Versão: 1.0

---

## 1. ESTRUTURA DE PASTAS DO PROJETO (Next.js 14 — App Router)

```
pilar-system/
├── .env.local                          # Variáveis de ambiente (Supabase URL, keys)
├── .env.example                        # Template das variáveis (sem valores reais)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── docs/                               # Documentação do projeto
│   ├── ESTRUTURA_COMPLETA_v2.md        # Fluxo do módulo de validação
│   ├── ROADMAP.md                      # Roadmap de implantação
│   └── ESTRUTURA_TECNICA.md            # Este documento
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── src/
│   ├── app/                            # App Router (páginas e rotas)
│   │   ├── layout.tsx                  # Layout raiz (providers, fontes)
│   │   ├── page.tsx                    # Redirect → /dashboard ou /login
│   │   │
│   │   ├── (auth)/                     # Grupo: rotas públicas (sem sidebar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── primeiro-acesso/
│   │   │   │   └── page.tsx
│   │   │   └── redefinir-senha/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (sistema)/                  # Grupo: rotas protegidas (com sidebar)
│   │   │   ├── layout.tsx              # Layout com sidebar + header + auth guard
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── validacoes/             # Módulo de Validação de Vendas
│   │   │   │   ├── page.tsx            # Listagem de validações
│   │   │   │   ├── nova/
│   │   │   │   │   └── page.tsx        # Formulário: registrar nova venda
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Detalhe da validação (etapas)
│   │   │   │       ├── etapas/
│   │   │   │       │   └── [etapa]/
│   │   │   │       │       └── page.tsx  # Formulário de cada etapa
│   │   │   │       └── revisoes/
│   │   │   │           └── page.tsx    # Histórico de revisões
│   │   │   │
│   │   │   ├── usuarios/               # Gestão de Usuários (Admin)
│   │   │   │   ├── page.tsx            # Listagem
│   │   │   │   └── convidar/
│   │   │   │       └── page.tsx        # Formulário de convite
│   │   │   │
│   │   │   ├── configuracoes/          # Configurações (Admin)
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── metricas/              # Dashboard de métricas
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                        # API Routes (server-side)
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       └── route.ts        # Callback do Supabase Auth
│   │       ├── validacoes/
│   │       │   ├── route.ts            # GET (listar) + POST (criar)
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts        # GET (detalhe) + PATCH (atualizar)
│   │       │   │   ├── avancar-etapa/
│   │       │   │   │   └── route.ts    # POST
│   │       │   │   ├── solicitar-revisao/
│   │       │   │   │   └── route.ts    # POST
│   │       │   │   ├── aprovar/
│   │       │   │   │   └── route.ts    # POST
│   │       │   │   ├── cancelar/
│   │       │   │   │   └── route.ts    # POST
│   │       │   │   └── enviar-implantacao/
│   │       │   │       └── route.ts    # POST
│   │       │   └── upload/
│   │       │       └── route.ts        # POST (upload de anexos)
│   │       ├── usuarios/
│   │       │   ├── route.ts            # GET + POST (convidar)
│   │       │   └── [id]/
│   │       │       └── route.ts        # PATCH (editar papel/status)
│   │       ├── notificacoes/
│   │       │   └── route.ts            # GET + PATCH (marcar como lida)
│   │       └── configuracoes/
│   │           └── route.ts            # GET + PATCH
│   │
│   ├── components/                     # Componentes reutilizáveis
│   │   ├── ui/                         # shadcn/ui (gerados via CLI)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── nav-item.tsx
│   │   │   └── user-menu.tsx
│   │   │
│   │   ├── validacoes/
│   │   │   ├── validacao-card.tsx       # Card na listagem
│   │   │   ├── validacao-filtros.tsx    # Barra de filtros
│   │   │   ├── validacao-form.tsx       # Formulário de registro
│   │   │   ├── etapa-stepper.tsx        # Timeline visual das etapas
│   │   │   ├── etapa-form.tsx           # Formulário genérico de etapa
│   │   │   ├── margem-indicator.tsx     # Indicador visual de margem
│   │   │   ├── sla-badge.tsx            # Badge de SLA
│   │   │   ├── comparacao-custos.tsx    # Tabela comparativa (etapa 4)
│   │   │   ├── revisao-timeline.tsx     # Histórico de revisões
│   │   │   └── anexo-upload.tsx         # Componente de upload
│   │   │
│   │   ├── usuarios/
│   │   │   ├── usuario-table.tsx
│   │   │   └── convite-form.tsx
│   │   │
│   │   └── shared/
│   │       ├── loading.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── notificacao-bell.tsx
│   │       └── page-header.tsx
│   │
│   ├── lib/                            # Utilitários e configurações
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase client (browser)
│   │   │   ├── server.ts               # Supabase client (server-side)
│   │   │   └── admin.ts                # Supabase service role (admin ops)
│   │   │
│   │   ├── utils.ts                    # Funções utilitárias gerais
│   │   ├── constants.ts                # Constantes (etapas, status, papéis)
│   │   ├── validations.ts              # Schemas de validação (zod)
│   │   └── format.ts                   # Formatação (moeda, data, %)
│   │
│   ├── hooks/                          # Custom hooks
│   │   ├── use-auth.ts                 # Estado de autenticação
│   │   ├── use-user.ts                 # Dados do perfil do usuário
│   │   ├── use-permissions.ts          # Verificação de permissões
│   │   └── use-notifications.ts        # Polling/realtime de notificações
│   │
│   ├── types/                          # TypeScript types
│   │   ├── database.ts                 # Types gerados pelo Supabase CLI
│   │   ├── validacao.ts                # Types do módulo de validação
│   │   ├── usuario.ts                  # Types de usuário/perfil
│   │   └── notificacao.ts              # Types de notificação
│   │
│   └── middleware.ts                   # Middleware Next.js (proteção de rotas)
│
└── supabase/                           # Supabase local config
    ├── config.toml
    ├── seed.sql                        # Seed do SuperAdmin + dados iniciais
    └── migrations/
        ├── 00001_create_enums.sql
        ├── 00002_create_profiles.sql
        ├── 00003_create_validacoes.sql
        ├── 00004_create_etapas.sql
        ├── 00005_create_revisoes.sql
        ├── 00006_create_anexos.sql
        ├── 00007_create_log.sql
        ├── 00008_create_notificacoes.sql
        ├── 00009_create_configuracoes.sql
        ├── 00010_create_obras.sql
        ├── 00011_setup_rls.sql
        ├── 00012_create_triggers.sql
        └── 00013_create_functions.sql
```

---

## 2. VARIÁVEIS DE AMBIENTE

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sistema PILAR

# E-mail (opcional — se usar Resend para notificações)
RESEND_API_KEY=sua_resend_key
```

---

## 3. MODELAGEM SQL COMPLETA

### 3.1 Enums

```sql
-- 00001_create_enums.sql

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'coordenador',
  'analista',
  'vendedor',
  'comercial'
);

CREATE TYPE tipo_projeto AS ENUM (
  'portaria_remota',
  'sistema_tecnico',
  'outros'
);

CREATE TYPE modelo_comercial AS ENUM (
  'venda',
  'locacao'
);

CREATE TYPE status_validacao AS ENUM (
  'em_validacao',
  'aguardando_comercial',
  'em_revisao',
  'aprovado',
  'enviado_implantacao',
  'cancelado'
);

CREATE TYPE etapa_validacao AS ENUM (
  'kickoff',
  'vistoria',
  'projeto',
  'calculadora',
  'envio_comercial'
);

CREATE TYPE resultado_vistoria AS ENUM (
  'viavel',
  'viavel_com_ressalvas',
  'inviavel'
);

CREATE TYPE motivo_cancelamento AS ENUM (
  'inviabilidade_tecnica',
  'desistencia_cliente',
  'custo_inviavel',
  'outro'
);
```

### 3.2 Tabela de Perfis (profiles)

```sql
-- 00002_create_profiles.sql

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url TEXT,
  papel user_role NOT NULL DEFAULT 'vendedor',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: criar perfil automaticamente ao criar user no Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Index
CREATE INDEX idx_profiles_papel ON profiles(papel);
CREATE INDEX idx_profiles_ativo ON profiles(ativo);
```

### 3.3 Tabela Principal: Validações

```sql
-- 00003_create_validacoes.sql

CREATE TABLE validacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados básicos
  nome_cliente VARCHAR(255) NOT NULL,
  tipo_projeto tipo_projeto NOT NULL,
  tipo_projeto_descricao TEXT,                    -- obrigatório se tipo = 'outros'

  -- Pessoas
  vendedor_id UUID NOT NULL REFERENCES profiles(id),
  analista_id UUID NOT NULL REFERENCES profiles(id),
  criado_por UUID NOT NULL REFERENCES profiles(id),

  -- Modelo comercial
  modelo_comercial modelo_comercial NOT NULL,

  -- Valores proposta (modelo VENDA)
  venda_valor_equipamentos DECIMAL(12,2),
  venda_valor_materiais DECIMAL(12,2),
  venda_valor_mao_obra DECIMAL(12,2),
  venda_valor_total DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(venda_valor_equipamentos, 0) +
    COALESCE(venda_valor_materiais, 0) +
    COALESCE(venda_valor_mao_obra, 0)
  ) STORED,

  -- Valores proposta (modelo LOCAÇÃO)
  locacao_prazo_meses INTEGER,
  locacao_valor_mensal DECIMAL(12,2),
  locacao_custo_inicial DECIMAL(12,2) DEFAULT 0,
  locacao_valor_total DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(locacao_valor_mensal, 0) * COALESCE(locacao_prazo_meses, 0) +
    COALESCE(locacao_custo_inicial, 0)
  ) STORED,

  -- Custo previsto
  custo_prev_equipamentos DECIMAL(12,2) NOT NULL,
  custo_prev_materiais DECIMAL(12,2) NOT NULL,
  custo_prev_mao_obra DECIMAL(12,2) NOT NULL,
  custo_prev_total DECIMAL(12,2) GENERATED ALWAYS AS (
    custo_prev_equipamentos + custo_prev_materiais + custo_prev_mao_obra
  ) STORED,

  -- Custo revisado (atualizado na etapa 4)
  custo_rev_equipamentos DECIMAL(12,2),
  custo_rev_materiais DECIMAL(12,2),
  custo_rev_mao_obra DECIMAL(12,2),
  custo_rev_total DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(custo_rev_equipamentos, 0) +
    COALESCE(custo_rev_materiais, 0) +
    COALESCE(custo_rev_mao_obra, 0)
  ) STORED,

  -- Status e controle
  status status_validacao NOT NULL DEFAULT 'em_validacao',
  etapa_atual etapa_validacao NOT NULL DEFAULT 'kickoff',
  numero_revisoes INTEGER NOT NULL DEFAULT 0,

  -- Cancelamento
  motivo_cancelamento motivo_cancelamento,
  justificativa_cancelamento TEXT,
  cancelado_por UUID REFERENCES profiles(id),
  cancelado_em TIMESTAMPTZ,

  -- Aprovação
  aprovado_por UUID REFERENCES profiles(id),
  aprovado_em TIMESTAMPTZ,

  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_validacoes_status ON validacoes(status);
CREATE INDEX idx_validacoes_etapa ON validacoes(etapa_atual);
CREATE INDEX idx_validacoes_vendedor ON validacoes(vendedor_id);
CREATE INDEX idx_validacoes_analista ON validacoes(analista_id);
CREATE INDEX idx_validacoes_criado_em ON validacoes(criado_em DESC);

-- Trigger: atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_validacoes_updated_at
  BEFORE UPDATE ON validacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3.4 Tabela de Etapas

```sql
-- 00004_create_etapas.sql

CREATE TABLE validacao_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  etapa etapa_validacao NOT NULL,
  revisao_numero INTEGER NOT NULL DEFAULT 0,       -- 0 = original, 1+ = revisão

  -- Campos comuns
  concluida BOOLEAN NOT NULL DEFAULT false,
  concluida_em TIMESTAMPTZ,
  concluida_por UUID REFERENCES profiles(id),

  -- Etapa 1: KickOff
  kickoff_ata TEXT,
  kickoff_vendido TEXT,
  kickoff_pontos_atencao TEXT,
  kickoff_premissas TEXT,
  kickoff_data_reuniao DATE,
  kickoff_participantes UUID[],

  -- Etapa 2: Vistoria
  vistoria_observacoes TEXT,
  vistoria_comentarios TEXT,
  vistoria_data DATE,
  vistoria_resultado resultado_vistoria,
  vistoria_justificativa_inviavel TEXT,

  -- Etapa 3: Projeto
  projeto_descricao_tecnica TEXT,
  projeto_ajustes_escopo TEXT,
  projeto_comentarios TEXT,

  -- Etapa 4: Calculadora
  calc_custo_equipamentos DECIMAL(12,2),
  calc_custo_materiais DECIMAL(12,2),
  calc_custo_mao_obra DECIMAL(12,2),
  calc_justificativa TEXT,

  -- Etapa 5: Envio ao Comercial
  envio_resumo_tecnico TEXT,
  envio_justificativas TEXT,
  envio_comentarios TEXT,

  -- SLA
  sla_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  sla_limite TIMESTAMPTZ,

  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_etapas_validacao ON validacao_etapas(validacao_id);
CREATE INDEX idx_etapas_etapa ON validacao_etapas(etapa);
CREATE INDEX idx_etapas_revisao ON validacao_etapas(revisao_numero);

CREATE TRIGGER set_etapas_updated_at
  BEFORE UPDATE ON validacao_etapas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3.5 Tabela de Revisões

```sql
-- 00005_create_revisoes.sql

CREATE TABLE validacao_revisoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,                          -- Rev.01, Rev.02...
  solicitante_id UUID NOT NULL REFERENCES profiles(id),
  motivo TEXT NOT NULL,
  etapa_retorno etapa_validacao NOT NULL,            -- projeto ou calculadora
  comentarios TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_revisoes_validacao ON validacao_revisoes(validacao_id);
CREATE UNIQUE INDEX idx_revisoes_numero ON validacao_revisoes(validacao_id, numero);
```

### 3.6 Tabela de Anexos

```sql
-- 00006_create_anexos.sql

CREATE TABLE validacao_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  etapa etapa_validacao,                            -- NULL = anexo do registro inicial
  revisao_numero INTEGER NOT NULL DEFAULT 0,

  -- Arquivo
  nome_original VARCHAR(255) NOT NULL,
  nome_storage VARCHAR(255) NOT NULL,               -- path no Supabase Storage
  tipo_arquivo VARCHAR(50) NOT NULL,                 -- extensão
  tamanho_bytes BIGINT NOT NULL,
  categoria VARCHAR(100),                            -- calculadora, proposta, foto, ci, etc.

  -- Versionamento
  versao INTEGER NOT NULL DEFAULT 1,
  substituido_por UUID REFERENCES validacao_anexos(id),

  -- Metadata
  enviado_por UUID NOT NULL REFERENCES profiles(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_anexos_validacao ON validacao_anexos(validacao_id);
CREATE INDEX idx_anexos_etapa ON validacao_anexos(etapa);
CREATE INDEX idx_anexos_categoria ON validacao_anexos(categoria);
```

### 3.7 Tabela de Log (Auditoria)

```sql
-- 00007_create_log.sql

CREATE TABLE validacao_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  acao VARCHAR(100) NOT NULL,                        -- criacao, avancar_etapa, solicitar_revisao, etc.
  detalhes JSONB,                                    -- { campo: "status", anterior: "x", novo: "y" }
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_log_validacao ON validacao_log(validacao_id);
CREATE INDEX idx_log_usuario ON validacao_log(usuario_id);
CREATE INDEX idx_log_criado_em ON validacao_log(criado_em DESC);
```

### 3.8 Tabela de Notificações

```sql
-- 00008_create_notificacoes.sql

CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID NOT NULL REFERENCES profiles(id),
  tipo VARCHAR(100) NOT NULL,                        -- nova_venda, etapa_avancada, sla_alerta, etc.
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  referencia_tipo VARCHAR(50),                       -- validacao, usuario, etc.
  referencia_id UUID,                                -- ID do registro relacionado
  lida BOOLEAN NOT NULL DEFAULT false,
  lida_em TIMESTAMPTZ,
  enviar_email BOOLEAN NOT NULL DEFAULT false,
  email_enviado BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_destinatario ON notificacoes(destinatario_id);
CREATE INDEX idx_notif_lida ON notificacoes(destinatario_id, lida);
CREATE INDEX idx_notif_criado_em ON notificacoes(criado_em DESC);
```

### 3.9 Tabela de Configurações

```sql
-- 00009_create_configuracoes.sql

CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  descricao TEXT,
  atualizado_por UUID REFERENCES profiles(id),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed das configurações padrão
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
  ('anexo_formatos', '["pdf","xlsx","xls","docx","png","jpg","jpeg"]', 'Formatos de anexo permitidos');
```

### 3.10 Tabela de Obras (Placeholder para módulo futuro)

```sql
-- 00010_create_obras.sql

CREATE TABLE obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validacao_id UUID NOT NULL REFERENCES validacoes(id),
  nome_cliente VARCHAR(255) NOT NULL,
  tipo_projeto tipo_projeto NOT NULL,
  tipo_projeto_descricao TEXT,

  -- Custos finais (copiados da validação)
  custo_final_equipamentos DECIMAL(12,2),
  custo_final_materiais DECIMAL(12,2),
  custo_final_mao_obra DECIMAL(12,2),
  custo_final_total DECIMAL(12,2),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'aguardando_inicio',

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obras_validacao ON obras(validacao_id);

CREATE TRIGGER set_obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 4. ROW LEVEL SECURITY (RLS)

```sql
-- 00011_setup_rls.sql

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_revisoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: pegar papel do usuário logado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT papel FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função auxiliar: verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('super_admin', 'coordenador');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==========================================
-- PROFILES
-- ==========================================
CREATE POLICY "Profiles: ver próprio perfil"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Profiles: admin vê todos"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Profiles: admin edita"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ==========================================
-- VALIDAÇÕES
-- ==========================================
CREATE POLICY "Validações: admin vê todas"
  ON validacoes FOR SELECT
  USING (is_admin());

CREATE POLICY "Validações: analista vê atribuídas"
  ON validacoes FOR SELECT
  USING (analista_id = auth.uid());

CREATE POLICY "Validações: vendedor vê próprias"
  ON validacoes FOR SELECT
  USING (vendedor_id = auth.uid());

CREATE POLICY "Validações: comercial vê em aguardando"
  ON validacoes FOR SELECT
  USING (
    get_user_role() = 'comercial'
    AND status IN ('aguardando_comercial', 'aprovado')
  );

CREATE POLICY "Validações: inserir (vendedor, analista, admin)"
  ON validacoes FOR INSERT
  WITH CHECK (
    get_user_role() IN ('super_admin', 'coordenador', 'analista', 'vendedor')
  );

CREATE POLICY "Validações: atualizar (analista atribuído ou admin)"
  ON validacoes FOR UPDATE
  USING (
    analista_id = auth.uid() OR is_admin()
  );

-- ==========================================
-- ETAPAS
-- ==========================================
CREATE POLICY "Etapas: ver se pode ver validação"
  ON validacao_etapas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
      AND (v.analista_id = auth.uid() OR v.vendedor_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Etapas: inserir/atualizar (analista ou admin)"
  ON validacao_etapas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id = validacao_id
      AND (v.analista_id = auth.uid() OR is_admin())
    )
  );

-- ==========================================
-- NOTIFICAÇÕES
-- ==========================================
CREATE POLICY "Notificações: ver próprias"
  ON notificacoes FOR SELECT
  USING (destinatario_id = auth.uid());

CREATE POLICY "Notificações: atualizar próprias"
  ON notificacoes FOR UPDATE
  USING (destinatario_id = auth.uid());

-- ==========================================
-- CONFIGURAÇÕES
-- ==========================================
CREATE POLICY "Configurações: todos leem"
  ON configuracoes FOR SELECT
  USING (true);

CREATE POLICY "Configurações: admin edita"
  ON configuracoes FOR UPDATE
  USING (get_user_role() = 'super_admin');

-- ==========================================
-- LOG
-- ==========================================
CREATE POLICY "Log: admin e coordenador veem"
  ON validacao_log FOR SELECT
  USING (is_admin());

CREATE POLICY "Log: sistema insere"
  ON validacao_log FOR INSERT
  WITH CHECK (true);
```

---

## 5. SUPABASE STORAGE

### Bucket: `validacoes-anexos`

```
Estrutura de pastas no Storage:
validacoes-anexos/
  └── {validacao_id}/
      ├── registro/              # Anexos do registro inicial
      │   ├── calculadora_v1.xlsx
      │   └── proposta_v1.pdf
      ├── kickoff/
      ├── vistoria/
      │   ├── foto_01.jpg
      │   └── foto_02.jpg
      ├── projeto/
      ├── calculadora/
      │   └── calculadora_revisada_v1.xlsx
      └── envio_comercial/
          └── proposta_revisada_v1.pdf
```

### Policies do Storage

```sql
-- Leitura: quem pode ver a validação pode ver os anexos
CREATE POLICY "Anexos: leitura"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'validacoes-anexos'
    AND EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id::text = (storage.foldername(name))[1]
      AND (v.analista_id = auth.uid() OR v.vendedor_id = auth.uid() OR is_admin())
    )
  );

-- Upload: analista atribuído ou admin
CREATE POLICY "Anexos: upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'validacoes-anexos'
    AND EXISTS (
      SELECT 1 FROM validacoes v
      WHERE v.id::text = (storage.foldername(name))[1]
      AND (v.analista_id = auth.uid() OR is_admin())
    )
  );
```

---

## 6. SEED DO SUPERADMIN

```sql
-- seed.sql

-- Executar APÓS criar o primeiro usuário via Supabase Auth (dashboard ou API)
-- Substituir o UUID pelo ID real do usuário criado

UPDATE profiles
SET
  nome = 'Seu Nome',
  papel = 'super_admin',
  ativo = true
WHERE email = 'seu_email@dominio.com';
```

---

## 7. DEPENDÊNCIAS DO PROJETO (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.400.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "supabase": "^1.200.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 8. COMANDOS ÚTEIS

```bash
# Inicializar projeto
npx create-next-app@latest pilar-system --typescript --tailwind --eslint --app --src-dir

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar dependências
npm install @supabase/supabase-js @supabase/ssr zod date-fns react-hook-form @hookform/resolvers lucide-react

# Supabase CLI
npx supabase init
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF

# Gerar types do banco
npx supabase gen types typescript --linked > src/types/database.ts

# Rodar migrations
npx supabase db push

# Deploy
git push origin main   # Vercel faz deploy automático
```

---

*Este documento é complementar ao Roadmap e à Estrutura Completa v2. Os três juntos formam a base para iniciar o desenvolvimento no Cursor.*
