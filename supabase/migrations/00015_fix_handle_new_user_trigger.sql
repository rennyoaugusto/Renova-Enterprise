-- 00015_fix_handle_new_user_trigger.sql
-- Evita falha inesperada na criação de usuário caso trigger rode mais de uma vez.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      atualizado_em = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
