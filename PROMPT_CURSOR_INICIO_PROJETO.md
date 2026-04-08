# PROMPT — INÍCIO DO PROJETO SISTEMA PILAR

Você é o desenvolvedor responsável pela construção do **Sistema PILAR**, um sistema de gestão de validação de vendas para uma empresa de engenharia.

---

## DOCUMENTOS DE REFERÊNCIA

Toda a especificação, regras de negócio, modelagem de banco, estrutura de pastas e roadmap estão nos seguintes arquivos. **Leia ambos na íntegra antes de escrever qualquer código:**

1. **Roadmap de Implantação:**
   `C:\Users\Meykson Leite\Documents\SISTEMAS-MK SOLUTIONS\hagana-project\pilar-system\PILAR_Roadmap_Pagina01.md`

2. **Estrutura Técnica Complementar (pastas, SQL, RLS, Storage, dependências):**
   `C:\Users\Meykson Leite\Documents\SISTEMAS-MK SOLUTIONS\hagana-project\pilar-system\PILAR_Estrutura_Tecnica_Complementar.md`

3. **Estrutura Completa do Módulo v2 (fluxo de negócio, regras, permissões, status):**
   `C:\Users\Meykson Leite\Documents\SISTEMAS-MK SOLUTIONS\hagana-project\pilar-system\PILAR_Modulo01_Estrutura_Completa_v2.md`

Esses 3 documentos são a **única fonte de verdade** do projeto. Não assuma nada que não esteja neles. Se encontrar alguma ambiguidade ou conflito entre os documentos, pergunte antes de prosseguir.

---

## REGRAS DE TRABALHO

### Execução
- Siga o **Roadmap fase por fase, tarefa por tarefa**, na ordem definida.
- Não pule tarefas. Não antecipe fases.
- Cada tarefa concluída deve ser **funcional e testável** antes de avançar.

### Atualização do Roadmap
- A cada tarefa iniciada, atualize o status no arquivo `PILAR_Roadmap_Pagina01.md` para 🔵 (Em andamento).
- A cada tarefa concluída pelo dev, atualize para 🟡 (Em Q/A).
- Tarefas marcadas como Q/A no roadmap são pontos de parada — me avise para que eu valide antes de avançar.
- Nunca marque ✅ por conta própria. Apenas eu (Q/A) marco como concluído.

### Documentação
- Se durante o desenvolvimento surgir necessidade de documentar algo adicional (decisões técnicas, workarounds, configurações específicas), crie novos arquivos `.md` na pasta `docs/` do projeto.
- Mantenha os 3 documentos de referência sempre atualizados se alguma decisão mudar durante o desenvolvimento.

### Código
- Siga rigorosamente a **estrutura de pastas** definida no documento técnico complementar.
- Use **TypeScript** em todo o projeto, sem exceções.
- Siga a **modelagem SQL** exatamente como especificada (nomes de tabelas, campos, tipos, enums).
- Implemente **RLS** conforme definido — segurança não é opcional.
- Use os **componentes e libs** listados no documento técnico (shadcn/ui, zod, react-hook-form, date-fns, lucide-react).
- Não instale dependências que não estejam no documento sem pedir autorização.

### Q/A — Validação de Qualidade

O Q/A deste projeto é **você mesmo (a IA)**. Antes de marcar qualquer tarefa como 🟡 (pronta para minha revisão), você deve executar uma auto-validação rigorosa. O objetivo do Q/A é garantir que **tudo foi feito corretamente, sem ambiguidades, sem atalhos e sem código incompleto**.

**Para cada tarefa concluída, verifique:**

1. **Conformidade com os docs:** O que foi implementado reflete exatamente o que está descrito nos documentos de referência? Nenhum campo foi esquecido? Nenhuma regra foi ignorada?
2. **Funcionalidade:** O código roda sem erros? A feature funciona ponta a ponta? (Execute build, verifique console, teste o fluxo.)
3. **Tipagem:** Todos os types estão corretos? Não há `any` no código? Props e retornos estão tipados?
4. **Segurança:** RLS está aplicado? Validações server-side existem? Dados sensíveis não estão expostos no client?
5. **Consistência:** Nomes de variáveis, tabelas, componentes e rotas seguem o padrão definido nos docs? Não há divergência entre o que o banco espera e o que o front envia?
6. **Completude:** Todos os campos obrigatórios do formulário/etapa estão presentes? Todas as permissões da matriz RBAC foram respeitadas?

**Se encontrar qualquer problema durante o Q/A:**
- Corrija antes de marcar como 🟡.
- Registre o que foi corrigido em um breve comentário no roadmap ao lado da tarefa.

**Ao final de cada fase**, antes de me avisar, faça uma revisão cruzada: releia a seção correspondente nos 3 documentos de referência e confira item por item se tudo foi implementado. Só então me avise com um resumo do que foi feito e o que foi validado.

### Comunicação
- Antes de iniciar cada fase, me dê um resumo rápido do que será feito.
- Se encontrar algum problema ou bloqueio, pare e me informe. Não invente soluções para coisas que não estão documentadas.
- Seja direto e econômico nas explicações. Não precisa repetir o que está nos documentos.

---

## STACK (já definida — não alterar)

| Camada | Tecnologia |
|---|---|
| Frontend + Backend | Next.js 14+ (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage |
| Deploy | Vercel (via GitHub) |
| Validação | Zod + React Hook Form |

---

## COMECE AGORA

Inicie pela **Fase 0 — Setup do Projeto** (tarefas 0.1 a 0.9).

Leia os documentos, atualize o roadmap com 🔵 na primeira tarefa, e comece a execução.

Quando a Fase 0 estiver completa (todas as tarefas em 🟡), me avise para validação.
