-- 00001_create_enums.sql
-- Fase 1A + Fase 3: enums base de RBAC e módulo de validação

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'super_admin',
      'coordenador',
      'analista',
      'vendedor',
      'comercial'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_projeto') THEN
    CREATE TYPE tipo_projeto AS ENUM (
      'portaria_remota',
      'sistema_tecnico',
      'outros'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modelo_comercial') THEN
    CREATE TYPE modelo_comercial AS ENUM (
      'venda',
      'locacao'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_validacao') THEN
    CREATE TYPE status_validacao AS ENUM (
      'em_validacao',
      'aguardando_comercial',
      'em_revisao',
      'aprovado',
      'enviado_implantacao',
      'cancelado'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'etapa_validacao') THEN
    CREATE TYPE etapa_validacao AS ENUM (
      'kickoff',
      'vistoria',
      'projeto',
      'calculadora',
      'envio_comercial'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resultado_vistoria') THEN
    CREATE TYPE resultado_vistoria AS ENUM (
      'viavel',
      'viavel_com_ressalvas',
      'inviavel'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'motivo_cancelamento') THEN
    CREATE TYPE motivo_cancelamento AS ENUM (
      'inviabilidade_tecnica',
      'desistencia_cliente',
      'custo_inviavel',
      'outro'
    );
  END IF;
END;
$$;
