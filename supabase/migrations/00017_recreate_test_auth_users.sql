-- 00017_recreate_test_auth_users.sql
-- Recria usuários de teste com estrutura compatível com auth.users/auth.identities.
-- Senha padrão para todos: Teste@123456

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  entry RECORD;
  target_user_id UUID;
  pwd_hash TEXT := crypt('Teste@123456', gen_salt('bf'));
BEGIN
  FOR entry IN
    SELECT *
    FROM (
      VALUES
        ('super_admin'::user_role, 'Teste Super Admin', 'teste.superadmin@pilar.test', 'teste.superadmin'),
        ('coordenador'::user_role, 'Teste Coordenador', 'teste.coordenador@pilar.test', 'teste.coordenador'),
        ('analista'::user_role, 'Teste Analista', 'teste.analista@pilar.test', 'teste.analista'),
        ('vendedor'::user_role, 'Teste Vendedor', 'teste.vendedor@pilar.test', 'teste.vendedor'),
        ('comercial'::user_role, 'Teste Comercial', 'teste.comercial@pilar.test', 'teste.comercial')
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
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
      )
      VALUES (
        target_user_id,
        'authenticated',
        'authenticated',
        entry.email,
        pwd_hash,
        now(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nome', entry.nome, 'username', entry.username),
        false,
        now(),
        now(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL,
        false
      );
    ELSE
      UPDATE auth.users
      SET
        encrypted_password = pwd_hash,
        raw_user_meta_data = jsonb_build_object('nome', entry.nome, 'username', entry.username),
        updated_at = now(),
        email_confirmed_at = COALESCE(email_confirmed_at, now())
      WHERE id = target_user_id;
    END IF;

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
    ON CONFLICT (provider, provider_id) DO UPDATE
      SET
        identity_data = EXCLUDED.identity_data,
        updated_at = now();

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
