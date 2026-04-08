-- 00018_fix_handle_new_user_resilient.sql
-- Evita que falhas de perfil bloqueiem criação de usuário no Auth.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_nome TEXT;
BEGIN
  profile_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email, 'Usuário');

  BEGIN
    INSERT INTO profiles (id, nome, email)
    VALUES (NEW.id, profile_nome, NEW.email)
    ON CONFLICT (id) DO UPDATE
      SET
        nome = EXCLUDED.nome,
        email = EXCLUDED.email,
        atualizado_em = now();
  EXCEPTION
    WHEN unique_violation THEN
      -- Caso já exista perfil com mesmo e-mail (cenário legado), reaponta para o novo id.
      UPDATE profiles
      SET
        id = NEW.id,
        nome = profile_nome,
        atualizado_em = now()
      WHERE email = NEW.email;
    WHEN OTHERS THEN
      -- Não interrompe criação do usuário no Auth por falha no espelho em profiles.
      RAISE WARNING 'handle_new_user falhou para %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
