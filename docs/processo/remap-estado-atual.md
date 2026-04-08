# Remap do Estado Atual

## Fase 0

- Setup inicial do projeto concluido localmente.
- Projeto Next.js com TypeScript, Tailwind, ESLint e Prettier configurado.
- Estrutura principal de pastas criada.
- Conexao base com Supabase configurada por `.env.local`.
- Pendencias:
  - `0.6` deploy Vercel
  - `0.9` validacao final com deploy

## Fase 1

### 1A - Auth e RBAC base

- SQL de `user_role`, `profiles`, trigger de criacao de perfil e RLS de `profiles` preparado e validado via Supabase cloud.
- Script manual documentado em `docs/processo/sql-fase-1A-manual.md`.

### 1B - Autenticacao

- Login implementado.
- Redefinicao de senha implementada.
- Primeiro acesso implementado.
- Callback de auth implementado.
- Middleware de protecao de rotas implementado.
- Logout implementado.

### 1C - Gestao de usuarios

- Listagem de usuarios implementada.
- Convite de usuarios implementado.
- Alteracao de papel implementada.
- Ativar/desativar implementado.
- Filtros por papel e status implementados.
- Restricao de acesso da tela implementada.
- Seed do primeiro super admin preparada.

## Fase 2

- Layout principal com sidebar e header implementado.
- Navegacao por papel implementada.
- Dashboard placeholder implementado.
- Componentes base de empty state/loading/page header implementados.
- Restricoes diretas em rotas administrativas reforcadas em:
  - `usuarios`
  - `configuracoes`
  - `metricas`

## Inconsistencias corrigidas neste remap

- Padronizacao visual das paginas placeholder do sistema.
- Correcoes de restricao por papel em rotas administrativas.
- Consolidacao do status atual em documentacao de processo.

## Pendencias atuais

- Validacao manual do item `2.6` no roadmap.
- Fase 3 ainda nao iniciada.
