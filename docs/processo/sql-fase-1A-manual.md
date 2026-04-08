# SQL Manual — Fase 1A (Auth + RBAC base)

Use este script no **Supabase SQL Editor** para aplicar manualmente a Fase 1A.

## 1) Script principal

```sql
-- =====================================================
-- FASE 1A - PILAR
-- Enums + profiles + trigger + RLS de profiles
-- =====================================================

-- 1) Enum user_role
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
END
$$;

-- 2) Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url TEXT,
  papel user_role NOT NULL DEFAULT 'vendedor',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Função de update timestamp (usada na tabela profiles)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Trigger de updated_at em profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_profiles_updated_at'
  ) THEN
    CREATE TRIGGER set_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END
$$;

-- 5) Trigger para criar perfil ao criar usuário no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
END
$$;

-- 6) Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_profiles_papel ON public.profiles(papel);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);

-- 7) RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT papel FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('super_admin', 'coordenador');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Profiles: ver próprio perfil" ON public.profiles;
CREATE POLICY "Profiles: ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: admin vê todos" ON public.profiles;
CREATE POLICY "Profiles: admin vê todos"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Profiles: admin edita" ON public.profiles;
CREATE POLICY "Profiles: admin edita"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

## 2) Script de checagem rápida (Q/A de 1A.5)

```sql
-- Enum existe?
SELECT t.typname
FROM pg_type t
WHERE t.typname = 'user_role';

-- Tabela e colunas principais
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Trigger de criação automática
SELECT tgname
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Policies de profiles
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;
```

## 3) Ordem recomendada

1. Executar o script principal (bloco 1).
2. Criar um usuário de teste em Auth (dashboard).
3. Verificar se entrou em `public.profiles`.
4. Executar checagem rápida (bloco 2).
