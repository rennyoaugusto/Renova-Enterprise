# SISTEMA PILAR — MÓDULO DE VALIDAÇÃO DE VENDAS
### Estrutura Completa v2.0

---

## 1. OBJETIVO DO MÓDULO

Gerenciar o processo completo de validação técnica das vendas realizadas pelo time comercial antes do início da implantação.

**Garantias do módulo:**
- A solução vendida é tecnicamente viável
- Os custos estão corretos e validados
- Existe rastreabilidade de todas as decisões
- O processo possui controle por etapas
- O projeto só avança para implantação após validação completa
- Existe visibilidade de margem e rentabilidade
- Todos os envolvidos são notificados nas transições

> Nesta fase o registro representa uma **oportunidade em validação**, não um cliente ativo.

---

## 2. PAPÉIS E PERMISSÕES (RBAC)

### 2.1 Papéis do módulo

| Papel | Descrição |
|---|---|
| **Vendedor** | Profissional que realizou a venda |
| **Analista Técnico** | Responsável pela validação técnica |
| **Coordenador de Engenharia** | Gestor da equipe técnica |
| **Comercial** | Recebe a proposta ajustada e negocia com cliente |
| **Administrador** | Configura SLAs, etapas e permissões |

### 2.2 Matriz de permissões

| Ação | Vendedor | Analista | Coordenador | Comercial | Admin |
|---|---|---|---|---|---|
| Registrar nova venda | ✅ | ✅ | ✅ | ❌ | ✅ |
| Visualizar validação | ✅ (próprias) | ✅ (atribuídas) | ✅ (todas) | ✅ (em aguardando) | ✅ |
| Avançar etapas (1→5) | ❌ | ✅ | ✅ | ❌ | ❌ |
| Solicitar revisão | ❌ | ❌ | ❌ | ✅ | ❌ |
| Aprovar p/ implantação | ❌ | ❌ | ✅ | ✅ | ❌ |
| Cancelar validação | ❌ | ✅ | ✅ | ❌ | ✅ |
| Configurar SLA/etapas | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. TELA PRINCIPAL — LISTAGEM DE VALIDAÇÕES

Listagem em cards ou tabela com as oportunidades em validação.

### 3.1 Campos exibidos por item

- Nome da oportunidade (cliente)
- Nome do vendedor
- Nome do analista técnico responsável
- Etapa atual do processo
- Status atual (badge colorido)
- Barra de progresso das etapas (%)
- Quantidade de revisões realizadas
- Valor total da venda
- Valor de mão de obra
- Valor recorrente (quando aplicável)
- **Margem calculada (%) — indicador visual**
- Data da última atualização
- **Indicador de SLA** (dentro/próximo/estourado)

### 3.2 Filtros disponíveis

- Analista técnico
- Vendedor
- Status da etapa
- Grupo do projeto
- Período (data de criação / última atualização)
- **Situação do SLA** (no prazo / atrasado)

### 3.3 Ordenação

- Por data de criação (padrão: mais recente)
- Por SLA (mais urgente primeiro)
- Por valor da venda
- Por etapa atual

---

## 4. AÇÃO: REGISTRAR NOVA VENDA

Botão "Registrar Venda" abre formulário de criação.

**Quem pode:** Vendedor, Analista Técnico, Coordenador ou Admin.

---

## 5. FORMULÁRIO DE REGISTRO DE VENDA

### 5.1 Dados básicos

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome do cliente | Texto livre | ✅ |
| Vendedor | Seleção de usuário | ✅ |
| Analista técnico | Seleção de usuário | ✅ |
| Tipo do projeto | Seleção única | ✅ |

**Tipos de projeto (campo unificado):**
- Portaria Remota
- Sistema Técnico
- Outros (exige descrição complementar)

> Este campo substitui tanto "Grupo do projeto" quanto "Classificação da obra" — é o mesmo dado, definido uma única vez no registro e herdado pelo módulo de implantação.

### 5.2 Modelo comercial

| Campo | Tipo | Obrigatório |
|---|---|---|
| Modelo | Seleção: Venda / Locação | ✅ |

### 5.3 Valores da proposta

**Se modelo = VENDA:**

| Campo | Tipo | Obrigatório |
|---|---|---|
| Valor de equipamentos | Monetário (R$) | ✅ |
| Valor de materiais | Monetário (R$) | ✅ |
| Valor de mão de obra | Monetário (R$) | ✅ |

> **Valor total da venda** = equipamentos + materiais + mão de obra (calculado automaticamente)

**Se modelo = LOCAÇÃO:**

| Campo | Tipo | Obrigatório |
|---|---|---|
| Prazo da locação | Numérico (meses) | ✅ |
| Valor mensal | Monetário (R$) | ✅ |
| Custo inicial | Monetário (R$) | ❌ (opcional) |

> **Valor total da locação** = (valor mensal × prazo) + custo inicial (calculado automaticamente)

### 5.4 Custo previsto da obra

| Campo | Tipo | Obrigatório |
|---|---|---|
| Custo previsto de equipamentos | Monetário (R$) | ✅ |
| Custo previsto de materiais | Monetário (R$) | ✅ |
| Custo previsto de mão de obra | Monetário (R$) | ✅ |

> **Custo total previsto** = soma dos três (calculado automaticamente)

### 5.5 Cálculo automático de margem

O sistema deve calcular e exibir em tempo real:

```
Margem (R$) = Valor Total da Venda − Custo Total Previsto
Margem (%)  = (Margem R$ / Valor Total da Venda) × 100
```

**Indicadores visuais:**
| Faixa | Cor | Comportamento |
|---|---|---|
| Margem ≥ 30% | 🟢 Verde | Saudável |
| Margem 15%–29% | 🟡 Amarelo | Atenção |
| Margem 1%–14% | 🟠 Laranja | Alerta — exige justificativa |
| Margem ≤ 0% | 🔴 Vermelho | **Bloqueio** — não permite salvar sem aprovação do Coordenador |

### 5.6 Anexos

| Anexo | Obrigatório | Formatos aceitos |
|---|---|---|
| Calculadora inicial | ✅ | .xlsx, .xls, .pdf |
| Proposta/orçamento do comercial | ✅ | .pdf, .docx |
| Outros documentos | ❌ | .pdf, .xlsx, .docx, .png, .jpg |

**Regras de anexos (aplicável a todo o módulo):**
- Tamanho máximo por arquivo: 25 MB
- Anexos não podem ser excluídos, apenas substituídos (manter histórico de versões)
- Cada substituição registra: usuário, data/hora e versão anterior

---

## 6. COMPORTAMENTO AO SALVAR

Ao salvar o registro o sistema deve:

1. Criar nova validação de venda com ID sequencial
2. Definir status como **"Em Validação"**
3. Definir etapa inicial como **"Reunião de KickOff"**
4. Registrar data e hora da criação
5. Registrar usuário responsável pela criação
6. Inicializar contador de revisões em **0**
7. Calcular e registrar margem inicial
8. **Disparar notificação** ao Analista Técnico atribuído
9. Iniciar contagem de SLA da etapa 1

---

## 7. STATUS DO PROCESSO

| Status | Descrição | Quem atua |
|---|---|---|
| **Em Validação** | Fluxo ativo, percorrendo etapas 1–5 | Analista Técnico |
| **Aguardando Comercial** | Enviado ao comercial após etapa 5 | Comercial |
| **Em Revisão** | Comercial solicitou ajustes, nova revisão aberta | Analista Técnico |
| **Aprovado** | Validação concluída, pronto para envio | Coordenador / Comercial |
| **Enviado p/ Implantação** | Registro de obra criado, validação encerrada | — |
| **Cancelado** | Validação cancelada | — |

### Diagrama de transição de status

```
[Em Validação] → (etapas 1→5) → [Aguardando Comercial]
                                        │
                      ┌─────────────────┼─────────────────┐
                      ▼                 ▼                 ▼
              [Em Revisão]         [Aprovado]        [Cancelado]
                   │                    │
                   ▼                    ▼
            [Em Validação]    [Enviado p/ Implantação]
              (volta p/ etapa)

* Cancelamento possível a partir de qualquer status exceto "Enviado p/ Implantação"
```

---

## 8. FLUXO DE ETAPAS DA VALIDAÇÃO

Fluxo sequencial obrigatório:

| # | Etapa | SLA Padrão |
|---|---|---|
| 1 | Reunião de KickOff | 2 dias úteis |
| 2 | Vistoria Técnica em Campo | 5 dias úteis |
| 3 | Elaboração de Projeto | 5 dias úteis |
| 4 | Revisão da Calculadora | 3 dias úteis |
| 5 | Envio ao Comercial | 2 dias úteis |

> SLAs são configuráveis pelo Administrador.

**Regra de avanço:** Cada etapa só pode ser concluída se todos os campos obrigatórios estiverem preenchidos. O sistema bloqueia avanço com campos pendentes.

---

## 9. DETALHAMENTO DAS ETAPAS

### 9.1 Reunião de KickOff

**Objetivo:** Alinhamento inicial com base na venda realizada.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Descrição / Ata da reunião | Texto longo | ✅ |
| O que foi vendido | Texto longo | ✅ |
| Pontos de atenção | Texto longo | ✅ |
| Premissas técnicas | Texto longo | ✅ |
| Data da reunião | Data | ✅ |
| Participantes | Multi-seleção de usuários | ❌ |

**Ao concluir:** avança para etapa 2, notifica Analista.

---

### 9.2 Vistoria Técnica em Campo

**Objetivo:** Validação física do cenário.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Observações técnicas | Texto longo | ✅ |
| Comentários gerais | Texto longo | ❌ |
| Fotos da vistoria | Anexos (imagem) | ✅ (mín. 1) |
| Data da vistoria | Data | ✅ |
| Resultado | Seleção: Viável / Viável com ressalvas / Inviável | ✅ |

**Se resultado = "Inviável":**
- Exige campo obrigatório: **Justificativa de inviabilidade**
- Habilita ação: **"Cancelar Validação"** (com motivo obrigatório)
- Ou permite retorno à etapa 1 para renegociação

**Ao concluir (Viável / com ressalvas):** avança para etapa 3.

---

### 9.3 Elaboração de Projeto

**Objetivo:** Construção da solução técnica.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Descrição técnica da solução | Texto longo | ✅ |
| Ajustes no escopo | Texto longo | ❌ |
| Comentários do analista | Texto longo | ❌ |
| Anexos de projeto | Arquivos | ❌ |

**Ao concluir:** avança para etapa 4.

---

### 9.4 Revisão da Calculadora

**Objetivo:** Validação e ajuste de custos.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Custo revisado de equipamentos | Monetário (R$) | ✅ |
| Custo revisado de materiais | Monetário (R$) | ✅ |
| Custo revisado de mão de obra | Monetário (R$) | ✅ |
| Justificativa de alterações | Texto longo | ✅ (se houve alteração) |
| Calculadora atualizada | Anexo (.xlsx) | ✅ |

**Comparação automática:**
O sistema deve exibir lado a lado:

| Item | Proposta Original | Custo Previsto | Custo Revisado | Variação (%) |
|---|---|---|---|---|
| Equipamentos | R$ X | R$ Y | R$ Z | +/- % |
| Materiais | R$ X | R$ Y | R$ Z | +/- % |
| Mão de obra | R$ X | R$ Y | R$ Z | +/- % |
| **Total** | **R$ X** | **R$ Y** | **R$ Z** | **+/- %** |

**Margem recalculada** com indicador visual atualizado.

**Ao concluir:** avança para etapa 5.

---

### 9.5 Envio ao Comercial

**Objetivo:** Retorno ao comercial com proposta ajustada.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Resumo técnico | Texto longo | ✅ |
| Justificativas de mudanças | Texto longo | ✅ (se houve alteração de custo) |
| Comentários adicionais | Texto longo | ❌ |
| Proposta revisada | Anexo (.pdf, .docx) | ✅ |

**Ao concluir:**
- Status muda para **"Aguardando Comercial"**
- Notificação enviada ao Comercial e ao Vendedor
- SLA da etapa é pausado (fora da engenharia)

---

## 10. FLUXO DE RETORNO — REVISÕES

### 10.1 Ação do Comercial: Solicitar Revisão

Quando o Comercial solicita ajustes:

1. Status muda para **"Em Revisão"**
2. Número da revisão incrementa automaticamente (Rev.01, Rev.02...)
3. Comercial deve informar:
   - Motivo da revisão (obrigatório)
   - Etapa de retorno: **3 (Projeto)** ou **4 (Calculadora)** — seleção obrigatória
   - Comentários adicionais (opcional)
4. Notificação enviada ao Analista Técnico
5. SLA reinicia a partir da etapa de retorno

> **Regra:** O retorno só é permitido para etapas 3 ou 4. Etapas 1 e 2 não são revisitáveis (já representam fatos consumados: reunião realizada e vistoria feita).

### 10.2 Registro de revisão

Cada revisão registra automaticamente:

| Campo | Descrição |
|---|---|
| Número da revisão | Incremental (Rev.01, Rev.02, Rev.03...) |
| Solicitante | Usuário que pediu a revisão |
| Data e hora | Timestamp automático |
| Motivo | Texto do comercial |
| Etapa de retorno | Para onde o fluxo voltou |
| Alterações realizadas | Registradas pelo analista ao refazer as etapas |

### 10.3 Regras de revisão

- Revisões anteriores são **somente leitura** (imutáveis)
- O sistema mantém **histórico completo** de todas as revisões
- Quantidade máxima de revisões é configurável (padrão: 5)
- Ao atingir o limite, o sistema exige **aprovação do Coordenador** para nova revisão

---

## 11. CANCELAMENTO DE VALIDAÇÃO

### 11.1 Quem pode cancelar
- Analista Técnico (próprias validações)
- Coordenador de Engenharia (qualquer validação)
- Administrador

### 11.2 Campos obrigatórios ao cancelar

| Campo | Tipo | Obrigatório |
|---|---|---|
| Motivo do cancelamento | Seleção: Inviabilidade técnica / Desistência do cliente / Custo inviável / Outro | ✅ |
| Justificativa detalhada | Texto longo | ✅ |

### 11.3 Comportamento

- Status muda para **"Cancelado"**
- Registro permanece visível para consulta (somente leitura)
- Notificação enviada a Vendedor, Comercial e Coordenador
- **Não pode ser revertido** — se necessário, criar nova validação

---

## 12. APROVAÇÃO E ENVIO PARA IMPLANTAÇÃO

### 12.1 Ação: Aprovar

Disponível quando status = "Aguardando Comercial".

**Quem pode aprovar:** Coordenador de Engenharia ou Comercial.

Ao aprovar, status muda para **"Aprovado"**.

### 12.2 Ação: Enviar para Implantação

Disponível quando status = "Aprovado".

**Anexos obrigatórios:**

| Anexo | Formato |
|---|---|
| Calculadora final | .xlsx |
| Pedido interno (C.I) | .pdf, .docx |

### 12.3 Comportamento ao enviar

1. Status muda para **"Enviado p/ Implantação"**
2. Validação é **encerrada** (somente leitura)
3. Cria automaticamente um **registro de obra** no módulo de implantação contendo:
   - Todos os dados do cliente e da proposta
   - Tipo do projeto (herdado)
   - Custos revisados (última versão)
   - Calculadora final e C.I como anexos
   - Referência à validação de origem
4. Notificação enviada a todos os envolvidos
5. Histórico completo permanece disponível para consulta

---

## 13. SISTEMA DE NOTIFICAÇÕES

| Evento | Destinatários | Canal |
|---|---|---|
| Nova venda registrada | Analista Técnico | Sistema + E-mail |
| Etapa avançada | Analista, Vendedor | Sistema |
| Vistoria marcada como "Inviável" | Vendedor, Coordenador | Sistema + E-mail |
| Enviado ao Comercial (etapa 5) | Comercial, Vendedor | Sistema + E-mail |
| Revisão solicitada | Analista Técnico | Sistema + E-mail |
| Margem ≤ 0% detectada | Coordenador | Sistema + E-mail |
| SLA próximo do vencimento (80%) | Analista, Coordenador | Sistema |
| SLA estourado | Analista, Coordenador | Sistema + E-mail |
| Validação cancelada | Vendedor, Comercial, Coordenador | Sistema + E-mail |
| Aprovado para implantação | Todos os envolvidos | Sistema + E-mail |
| Enviado para implantação | Todos os envolvidos | Sistema + E-mail |

---

## 14. SLA E CONFIGURAÇÕES

Configurável pelo Administrador:

| Configuração | Padrão | Editável |
|---|---|---|
| SLA por etapa | Conforme seção 8 | ✅ |
| Quantidade máxima de revisões | 5 | ✅ |
| Margem mínima aceitável (%) | 15% | ✅ |
| Margem de bloqueio (%) | 0% | ✅ |
| Formatos de anexo permitidos | pdf, xlsx, docx, png, jpg | ✅ |
| Tamanho máximo de anexo (MB) | 25 | ✅ |
| Inclusão/remoção de etapas | — | ✅ |

---

## 15. MÉTRICAS E INDICADORES

O sistema deve gerar dados para dashboards:

**Operacionais:**
- Tempo médio por etapa
- Tempo médio total de validação
- Tempo médio por analista
- Quantidade de revisões por venda
- Taxa de retrabalho (revisões / total de validações)
- Gargalos do processo (etapa com maior tempo)
- % de validações dentro do SLA

**Financeiros:**
- Margem média das validações aprovadas
- Volume total em validação (R$)
- Variação média entre custo previsto e custo revisado

**Funil:**
- Total de validações por status
- Taxa de cancelamento
- Taxa de aprovação
- Tempo médio entre registro e implantação

---

## 16. REGRAS GERAIS DE AUDITORIA

- Toda ação no sistema registra: usuário, data/hora, ação realizada
- Campos alterados registram: valor anterior e valor novo
- Registros finalizados (Enviado p/ Implantação ou Cancelado) são **imutáveis**
- Log de auditoria acessível por Coordenador e Admin

---

## 17. RESUMO DO FLUXO COMPLETO

```
VENDEDOR/ANALISTA registra venda
        │
        ▼
  [Em Validação]
        │
   ┌────┴────────────────────────────────────────┐
   │  Etapa 1: Reunião de KickOff                │
   │  Etapa 2: Vistoria Técnica ──→ Inviável? ──→ [Cancelado]
   │  Etapa 3: Elaboração de Projeto              │
   │  Etapa 4: Revisão da Calculadora             │
   │  Etapa 5: Envio ao Comercial                 │
   └────┬────────────────────────────────────────┘
        │
        ▼
  [Aguardando Comercial]
        │
   ┌────┼──────────────────┐
   │    │                  │
   ▼    ▼                  ▼
Revisão  Aprovação     Cancelamento
   │        │
   ▼        ▼
[Em Revisão] → volta p/ etapa 3 ou 4
            [Aprovado]
                │
                ▼
      [Enviado p/ Implantação]
                │
                ▼
        Cria Registro de Obra
        (Módulo de Implantação)
```

---

*Documento pronto para servir de base para: Arquitetura Técnica → Modelagem de Dados → Roadmap de Sprints.*
