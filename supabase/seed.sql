-- Seed do primeiro super admin.
-- Executar após criação do usuário no Auth.

UPDATE profiles
SET
  nome = 'Meykson Leite',
  papel = 'super_admin',
  ativo = true,
  atualizado_em = now()
WHERE email = 'meyksonleite@gmail.com';
