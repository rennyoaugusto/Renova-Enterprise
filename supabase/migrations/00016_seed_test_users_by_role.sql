-- 00016_seed_test_users_by_role.sql
-- Seed temporário de usuários de teste por papel.
-- Credencial padrão para todos: Teste@123456

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  default_password TEXT := 'Teste@123456';
  entry RECORD;
  target_user_id UUID;
BEGIN
  FOR entry IN
    SELECT *
    FROM (
      VALUES
        ('super_admin'::user_role, 'Teste Super Admin', 'teste.superadmin@pilar.local', 'teste.superadmin'),
        ('coordenador'::user_role, 'Teste Coordenador', 'teste.coordenador@pilar.local', 'teste.coordenador'),
        ('analista'::user_role, 'Teste Analista', 'teste.analista@pilar.local', 'teste.analista'),
        ('vendedor'::user_role, 'Teste Vendedor', 'teste.vendedor@pilar.local', 'teste.vendedor'),
        ('comercial'::user_role, 'Teste Comercial', 'teste.comercial@pilar.local', 'teste.comercial')
    ) AS t(papel, nome, email, username)
  LOOP
    SELECT id INTO target_user_id FROM auth.users WHERE email = entry.email LIMIT 1;

    IF target_user_id IS NULL THEN
      target_user_id := gen_random_uuid();

      INSERT INTO auth.users (
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        target_user_id,
        'authenticated',
        'authenticated',
        entry.email,
        crypt(default_password, gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('nome', entry.nome, 'username', entry.username),
        now(),
        now()
      );

      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        target_user_id,
        jsonb_build_object('sub', target_user_id::text, 'email', entry.email),
        'email',
        target_user_id::text,
        now(),
        now(),
        now()
      )
      ON CONFLICT (provider, provider_id) DO NOTHING;
    END IF;

    INSERT INTO profiles (id, nome, email, papel, ativo)
    VALUES (target_user_id, entry.nome, entry.email, entry.papel, true)
    ON CONFLICT (id) DO UPDATE
      SET
        nome = EXCLUDED.nome,
        email = EXCLUDED.email,
        papel = EXCLUDED.papel,
        ativo = true,
        atualizado_em = now();
  END LOOP;
END
$$;
