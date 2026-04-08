# SISTEMA PILAR — ROADMAP DE IMPLANTAÇÃO
### Página 01: Módulo de Validação de Vendas
### Versão: 1.0 | Atualizado em: ___/___/______

---

## STACK DEFINIDA

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR, API Routes, deploy nativo Vercel |
| **UI** | Tailwind CSS + shadcn/ui | Componentes prontos, consistência visual |
| **Backend** | Next.js API Routes + Supabase | Sem necessidade de back separado |
| **Banco de Dados** | Supabase (PostgreSQL) | Auth, RLS, Storage, Realtime integrados |
| **Autenticação** | Supabase Auth | Magic link / e-mail+senha, convites |
| **Storage** | Supabase Storage | Anexos e documentos |
| **Deploy** | Vercel | CI/CD automático via Git |
| **Repositório** | GitHub | Versionamento, integração Vercel |
| **IDE** | Cursor (VSCode) | AI-assisted development |

---

## LEGENDA DE STATUS

| Emoji | Status |
|---|---|
| ⬜ | Não iniciado |
| 🔵 | Em andamento |
| 🟡 | Em Q/A (validação) |
| ✅ | Concluído e validado |
| 🔴 | Bloqueado |

---

## FASE 0 — SETUP DO PROJETO

> Objetivo: Ambiente de desenvolvimento pronto, repositório configurado, Supabase conectado.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 0.1 | Criar repositório no GitHub | 🟡 | Dev | — |
| 0.2 | Inicializar projeto Next.js 14+ (App Router, TypeScript) | 🟡 | Dev | — |
| 0.3 | Configurar Tailwind CSS + shadcn/ui | 🟡 | Dev | — |
| 0.4 | Conectar Supabase ao projeto (env vars) | 🟡 | Dev | — |
| 0.5 | Configurar Supabase CLI local (migrations, seed) | 🟡 | Dev | — |
| 0.6 | Configurar deploy na Vercel (conectar ao GitHub) | 🔴 | Dev | — |
| 0.7 | Criar estrutura de pastas padrão do projeto | 🟡 | Dev | — |
| 0.8 | Configurar ESLint + Prettier | 🟡 | Dev | — |
| 0.9 | **Validação Q/A: build funcional, deploy de teste na Vercel** | 🔴 | — | Q/A |

> 0.6 adiado por solicitação do Q/A para seguir com setup local.
> 0.9 bloqueado até concluir deploy de teste na Vercel.


---

## FASE 1 — AUTENTICAÇÃO E CONTROLE DE USUÁRIOS

> Objetivo: SuperAdmin consegue convidar usuários, definir papéis e os usuários conseguem fazer login.

### 1A — Modelagem de Banco (Auth & RBAC)

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 1A.1 | Criar tabela `profiles` (id, nome, email, avatar, papel, ativo, criado_em) | 🟡 | Dev | — |
| 1A.2 | Criar enum `user_role` (super_admin, coordenador, analista, vendedor, comercial) | 🟡 | Dev | — |
| 1A.3 | Criar trigger: ao criar user no Supabase Auth → cria registro em `profiles` | 🟡 | Dev | — |
| 1A.4 | Configurar RLS em `profiles` (cada um vê o seu; admin vê todos) | 🟡 | Dev | — |
| 1A.5 | **Validação Q/A: testar criação de user e RLS via Supabase dashboard** | 🟡 | — | Q/A |

### 1B — Telas de Autenticação

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 1B.1 | Tela de Login (e-mail + senha) | 🟡 | Dev | — |
| 1B.2 | Tela de redefinição de senha | 🟡 | Dev | — |
| 1B.3 | Tela de primeiro acesso (definir senha após convite) | 🟡 | Dev | — |
| 1B.4 | Middleware de proteção de rotas (redireciona se não autenticado) | 🟡 | Dev | — |
| 1B.5 | Lógica de sessão (Supabase Auth helpers para Next.js) | 🟡 | Dev | — |
| 1B.6 | **Validação Q/A: fluxo completo login → sessão → logout → rota protegida** | 🟡 | — | Q/A |

> 1A.5 validado via Supabase cloud (policies de profiles conferidas no dashboard).
> 1B.6 validado para navegação protegida, login e logout no ambiente configurado.
> 1C.8 validado após ajuste de envio de convite por e-mail e redirect de primeiro acesso.

### 1C — Gestão de Usuários (Painel SuperAdmin)

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 1C.1 | Tela de listagem de usuários (nome, email, papel, status) | 🟡 | Dev | — |
| 1C.2 | Ação: Convidar usuário (envia e-mail com link de primeiro acesso) | 🟡 | Dev | — |
| 1C.3 | Ação: Editar papel do usuário | 🟡 | Dev | — |
| 1C.4 | Ação: Ativar / Desativar usuário | 🟡 | Dev | — |
| 1C.5 | Filtros: por papel, por status (ativo/inativo) | 🟡 | Dev | — |
| 1C.6 | Restrição: apenas super_admin e coordenador acessam esta tela | 🟡 | Dev | — |
| 1C.7 | Criar seed do primeiro SuperAdmin (você) | 🟡 | Dev | — |
| 1C.8 | **Validação Q/A: convidar usuário → primeiro acesso → login → papel correto** | 🟡 | — | Q/A |

---

## FASE 2 — LAYOUT E NAVEGAÇÃO BASE

> Objetivo: Estrutura visual do sistema pronta (sidebar, header, navegação por papel).

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 2.1 | Layout principal (sidebar + header + área de conteúdo) | 🟡 | Dev | — |
| 2.2 | Sidebar com navegação (itens variam conforme papel do usuário) | 🟡 | Dev | — |
| 2.3 | Header com nome do usuário, papel e logout | 🟡 | Dev | — |
| 2.4 | Página inicial / Dashboard placeholder | 🟡 | Dev | — |
| 2.5 | Componente de loading e empty states | 🟡 | Dev | — |
| 2.6 | **Validação Q/A: navegação funcional, itens do menu corretos por papel** | 🔴 | — | Q/A |

> 2.6 aguardando validação manual dos menus por papel (super_admin, coordenador, analista, vendedor, comercial).

---

## FASE 3 — MODELAGEM DE BANCO: MÓDULO DE VALIDAÇÃO

> Objetivo: Todas as tabelas do módulo de validação criadas com RLS.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 3.1 | Criar enum `tipo_projeto` (portaria_remota, sistema_tecnico, outros) | 🟡 | Dev | — |
| 3.2 | Criar enum `modelo_comercial` (venda, locacao) | 🟡 | Dev | — |
| 3.3 | Criar enum `status_validacao` (em_validacao, aguardando_comercial, em_revisao, aprovado, enviado_implantacao, cancelado) | 🟡 | Dev | — |
| 3.4 | Criar enum `etapa_validacao` (kickoff, vistoria, projeto, calculadora, envio_comercial) | 🟡 | Dev | — |
| 3.5 | Criar tabela `validacoes` (tabela principal) | 🟡 | Dev | — |
| 3.6 | Criar tabela `validacao_etapas` (registro de cada etapa concluída) | 🟡 | Dev | — |
| 3.7 | Criar tabela `validacao_revisoes` (histórico de revisões) | 🟡 | Dev | — |
| 3.8 | Criar tabela `validacao_anexos` (arquivos com versionamento) | 🟡 | Dev | — |
| 3.9 | Criar tabela `validacao_log` (auditoria de ações) | 🟡 | Dev | — |
| 3.10 | Configurar RLS em todas as tabelas conforme matriz de permissões | 🟡 | Dev | — |
| 3.11 | Criar Supabase Storage bucket `validacoes-anexos` com policies | 🟡 | Dev | — |
| 3.12 | **Validação Q/A: inserir dados de teste, verificar RLS por papel** | 🟡 | — | Q/A |

---

## FASE 4 — TELA PRINCIPAL: LISTAGEM DE VALIDAÇÕES

> Objetivo: Tela de listagem funcional com filtros e indicadores.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 4.1 | Tela de listagem (cards ou tabela, responsiva) | 🟡 | Dev | — |
| 4.2 | Exibir todos os campos definidos na seção 3.1 da estrutura | 🟡 | Dev | — |
| 4.3 | Badge de status com cores | 🟡 | Dev | — |
| 4.4 | Barra de progresso das etapas | 🟡 | Dev | — |
| 4.5 | Indicador visual de margem (verde/amarelo/laranja/vermelho) | 🟡 | Dev | — |
| 4.6 | Indicador de SLA (dentro/próximo/estourado) | 🟡 | Dev | — |
| 4.7 | Filtros: analista, vendedor, status, grupo, período, SLA | 🟡 | Dev | — |
| 4.8 | Ordenação: data, SLA, valor, etapa | 🟡 | Dev | — |
| 4.9 | Botão "Registrar Venda" (visível conforme permissão) | 🟡 | Dev | — |
| 4.10 | **Validação Q/A: listagem com dados, filtros, permissões por papel** | 🟡 | — | Q/A |

---

## FASE 5 — FORMULÁRIO: REGISTRAR NOVA VENDA

> Objetivo: Formulário completo de registro de venda funcional.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 5.1 | Formulário de dados básicos (cliente, vendedor, analista, tipo) | 🟡 | Dev | — |
| 5.2 | Seleção de modelo comercial (venda/locação) com campos condicionais | 🟡 | Dev | — |
| 5.3 | Campos de valores da proposta (dinâmico conforme modelo) | 🟡 | Dev | — |
| 5.4 | Campos de custo previsto da obra | 🟡 | Dev | — |
| 5.5 | Cálculo automático de margem em tempo real | 🟡 | Dev | — |
| 5.6 | Indicador visual de margem (faixas de cor) | 🟡 | Dev | — |
| 5.7 | Bloqueio de salvamento se margem ≤ 0% (sem aprovação coordenador) | 🟡 | Dev | — |
| 5.8 | Upload de anexos (calculadora + proposta) com validação de formato/tamanho | 🟡 | Dev | — |
| 5.9 | Validação de campos obrigatórios | 🟡 | Dev | — |
| 5.10 | Lógica de salvamento (criar validação, status inicial, notificação) | 🟡 | Dev | — |
| 5.11 | **Validação Q/A: criar venda completa, verificar dados salvos, margem, anexos** | 🟡 | — | Q/A |

---

## FASE 6 — FLUXO DE ETAPAS (1→5)

> Objetivo: Fluxo sequencial das 5 etapas funcional com todos os campos.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 6.1 | Tela de detalhe da validação (visão geral + etapas) | 🟡 | Dev | — |
| 6.2 | Componente de timeline/stepper visual das etapas | 🟡 | Dev | — |
| 6.3 | Etapa 1 — Reunião de KickOff (formulário + campos obrigatórios) | 🟡 | Dev | — |
| 6.4 | Etapa 2 — Vistoria Técnica (formulário + upload fotos + resultado) | 🟡 | Dev | — |
| 6.5 | Lógica de inviabilidade na etapa 2 (justificativa + opção cancelar) | 🟡 | Dev | — |
| 6.6 | Etapa 3 — Elaboração de Projeto (formulário + anexos) | 🟡 | Dev | — |
| 6.7 | Etapa 4 — Revisão da Calculadora (custos revisados + comparação automática) | 🟡 | Dev | — |
| 6.8 | Etapa 5 — Envio ao Comercial (resumo + proposta revisada) | 🟡 | Dev | — |
| 6.9 | Lógica de avanço de etapa (validação de campos obrigatórios antes de avançar) | 🟡 | Dev | — |
| 6.10 | Controle de SLA por etapa (contagem + alertas visuais) | 🟡 | Dev | — |
| 6.11 | Registro em `validacao_log` a cada ação | 🟡 | Dev | — |
| 6.12 | **Validação Q/A: percorrer fluxo completo 1→5, testar bloqueios, SLA** | 🟡 | — | Q/A |

---

## FASE 7 — REVISÕES E RETORNO DO COMERCIAL

> Objetivo: Sistema de revisões funcional com histórico imutável.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 7.1 | Ação do Comercial: "Solicitar Revisão" (motivo + etapa de retorno) | 🟡 | Dev | — |
| 7.2 | Criação automática de revisão incremental (Rev.01, Rev.02...) | 🟡 | Dev | — |
| 7.3 | Retorno do fluxo para etapa 3 ou 4 | 🟡 | Dev | — |
| 7.4 | Histórico de revisões (timeline, somente leitura para anteriores) | 🟡 | Dev | — |
| 7.5 | Bloqueio ao atingir limite de revisões (exige aprovação coordenador) | 🟡 | Dev | — |
| 7.6 | **Validação Q/A: fluxo completo de revisão, imutabilidade, limites** | 🟡 | — | Q/A |

---

## FASE 8 — APROVAÇÃO, CANCELAMENTO E ENVIO PARA IMPLANTAÇÃO

> Objetivo: Encerramento do ciclo de validação.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 8.1 | Ação: Aprovar validação (Coordenador/Comercial) | 🟡 | Dev | — |
| 8.2 | Ação: Cancelar validação (motivo + justificativa obrigatórios) | 🟡 | Dev | — |
| 8.3 | Ação: Enviar para Implantação (anexos obrigatórios: calculadora + C.I) | 🟡 | Dev | — |
| 8.4 | Criação automática de registro de obra (placeholder para módulo futuro) | 🟡 | Dev | — |
| 8.5 | Registro vira somente leitura após envio ou cancelamento | 🟡 | Dev | — |
| 8.6 | **Validação Q/A: testar aprovação, cancelamento, envio, imutabilidade** | 🟡 | — | Q/A |

---

## FASE 9 — NOTIFICAÇÕES

> Objetivo: Todos os eventos críticos geram notificações.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 9.1 | Sistema de notificações in-app (sino no header + listagem) | 🟡 | Dev | — |
| 9.2 | Notificações por e-mail (via Supabase Edge Functions ou Resend) | ⬜ | Dev | — |
| 9.3 | Implementar os 11 eventos de notificação da estrutura | 🟡 | Dev | — |
| 9.4 | Marcar como lida / limpar notificações | 🟡 | Dev | — |
| 9.5 | **Validação Q/A: receber notificações em cada evento, e-mail chegando** | 🟡 | — | Q/A |

---

## FASE 10 — CONFIGURAÇÕES E SLA (Painel Admin)

> Objetivo: SuperAdmin configura SLAs, limites e regras.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 10.1 | Tela de configurações (SLA por etapa, limites, margem) | 🟡 | Dev | — |
| 10.2 | Tabela `configuracoes` no banco (chave/valor) | 🟡 | Dev | — |
| 10.3 | Sistema lê configurações em tempo real (sem hardcode) | 🟡 | Dev | — |
| 10.4 | **Validação Q/A: alterar config e verificar reflexo imediato no sistema** | 🟡 | — | Q/A |

---

## FASE 11 — MÉTRICAS E DASHBOARD

> Objetivo: Indicadores operacionais e financeiros visíveis.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 11.1 | Dashboard com métricas operacionais (tempo por etapa, gargalos) | 🟡 | Dev | — |
| 11.2 | Métricas financeiras (margem média, volume em validação) | 🟡 | Dev | — |
| 11.3 | Funil de validações (por status) | 🟡 | Dev | — |
| 11.4 | Filtros por período e analista | 🟡 | Dev | — |
| 11.5 | **Validação Q/A: dados corretos, filtros funcionais** | 🟡 | — | Q/A |

---

## FASE 12 — TESTES FINAIS E DEPLOY

> Objetivo: Sistema validado ponta a ponta em produção.

| # | Tarefa | Status | Responsável | Q/A |
|---|---|---|---|---|
| 12.1 | Teste E2E: fluxo completo (login → criar venda → etapas → aprovar → implantar) | ⬜ | — | Q/A |
| 12.2 | Teste de permissões: cada papel só acessa o que deve | ⬜ | — | Q/A |
| 12.3 | Teste de edge cases: margem negativa, SLA estourado, limite de revisões | ⬜ | — | Q/A |
| 12.4 | Teste de responsividade (desktop + mobile) | ⬜ | — | Q/A |
| 12.5 | Revisão de segurança: RLS, validações server-side, sanitização | ⬜ | — | Q/A |
| 12.6 | Configurar variáveis de ambiente na Vercel (produção) | ⬜ | Dev | — |
| 12.7 | Deploy final em produção | ⬜ | Dev | — |
| 12.8 | Seed de dados: criar SuperAdmin (você) em produção | ⬜ | Dev | — |
| 12.9 | **Validação Q/A final: smoke test em produção** | ⬜ | — | Q/A |

---

## RESUMO DE FASES

| Fase | Descrição | Tarefas | Pré-requisito |
|---|---|---|---|
| 0 | Setup do Projeto | 9 | — |
| 1 | Autenticação e Usuários | 19 | Fase 0 |
| 2 | Layout e Navegação | 6 | Fase 1 |
| 3 | Modelagem: Módulo Validação | 12 | Fase 1 |
| 4 | Listagem de Validações | 10 | Fases 2 + 3 |
| 5 | Formulário: Registrar Venda | 11 | Fase 4 |
| 6 | Fluxo de Etapas (1→5) | 12 | Fase 5 |
| 7 | Revisões e Retorno | 6 | Fase 6 |
| 8 | Aprovação e Implantação | 6 | Fase 7 |
| 9 | Notificações | 5 | Fase 8 |
| 10 | Configurações e SLA | 4 | Fase 3 |
| 11 | Métricas e Dashboard | 5 | Fase 8 |
| 12 | Testes Finais e Deploy | 9 | Todas |

**Total: 114 tarefas | 12 fases | 14 pontos de Q/A**

---

## COMO USAR ESTE ROADMAP

1. Ao iniciar uma tarefa, mude o status para 🔵
2. Ao finalizar o dev, mude para 🟡 e solicite Q/A
3. Q/A valida e muda para ✅ ou devolve com observações
4. Só avance de fase quando todos os itens da fase estiverem ✅
5. Se algo estiver bloqueado, marque 🔴 e registre o motivo

---

*Próximo passo: iniciar Fase 0 no Cursor.*
