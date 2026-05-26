# Design: Sistema Kanban — Escritório / Docência

**Data:** 2026-05-26  
**Projeto:** kanban-escritorio  
**Status:** Aprovado

---

## Visão Geral

Sistema web privado de gerenciamento de tarefas no estilo Kanban, para uso entre advogado e estagiário (e futuramente até 5 usuários). Cobre dois contextos de trabalho — Advocacia e Docência — em abas separadas. Substitui o fluxo de e-mails por um espaço compartilhado com tarefas, comentários e anexos.

---

## Arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Hospedagem | GitHub Pages (deploy via GitHub Actions) |
| Autenticação | Firebase Auth — login com Google |
| Banco de dados | Firestore (tempo real) |
| Armazenamento de arquivos | Firebase Storage |
| Repositório | GitHub |

Não há servidor próprio. O Firebase roda inteiramente no navegador via SDK. O plano gratuito do Firebase (Spark) é suficiente para até 5 usuários.

---

## Autenticação e Controle de Acesso

- Login exclusivo via conta Google (botão "Entrar com Google")
- Lista de e-mails autorizados gerenciada pelo advogado (Firestore)
- Usuários não autorizados veem tela de acesso negado
- Máximo previsto: 5 usuários

---

## Workspaces

Dois workspaces independentes, alternados por abas no topo:

- **⚖️ Advocacia** — tarefas de casos e clientes
- **🎓 Docência** — tarefas acadêmicas e de ensino

Cada workspace tem suas próprias colunas e tarefas. Não há compartilhamento de dados entre workspaces.

---

## Layout

**Estilo C — Minimalista** (inspirado em Linear / Height):

- Barra superior ultrafina: logo à esquerda, abas Advocacia/Docência, busca, avatar do usuário
- O board Kanban ocupa quase 100% da tela
- Visual limpo e moderno, adequado para escritório de advocacia

---

## Kanban Board

### Colunas

Customizáveis (nome, cor, ordem). Pré-preenchidas por padrão:

1. **A Fazer** — tarefas ainda não iniciadas
2. **Em Andamento** — tarefas em execução
3. **Aguardando Revisão** — estagiário conclui e move aqui; advogado revisa e aprova
4. **Concluído** — aprovadas pelo advogado

A coluna "Aguardando Revisão" recebe destaque visual (fundo azul claro). Um aviso aparece no topo do board quando há cartões nessa coluna.

### Interação

- Drag-and-drop para mover cartões entre colunas
- Filtros rápidos: Todos / Minhas tarefas / Do estagiário / Urgente
- Busca por cliente, processo ou título

---

## Cartão de Tarefa

Ao clicar num cartão, abre um painel lateral com todos os detalhes.

### Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| Título | Texto curto | Sim |
| Prioridade | Alta / Média / Baixa | Sim |
| Prazo | Data | Sim |
| Responsável | Usuário do sistema | Sim |
| Cliente | Texto | Sim |
| Parte Contrária | Texto | Não |
| Nº do Processo | Texto | Não |
| Descrição | Texto longo | Não |

### Comentários

- Histórico de comentários em ordem cronológica
- Qualquer usuário autorizado pode comentar
- Usado para comunicação entre advogado e estagiário sobre a tarefa

### Anexos

- Upload de arquivos diretamente no cartão (PDF, DOCX, imagens)
- Armazenados no Firebase Storage
- Exibidos como lista de anexos com nome e botão de download

---

## Gerenciamento de Usuários

- Acessível apenas pelo advogado (e-mail admin pré-configurado: arturapv@gmail.com)
- Tela simples para adicionar e remover e-mails autorizados
- Alterações têm efeito imediato (Firestore em tempo real)

---

## Modelo de Dados (Firestore)

```
/users/{userId}
  email, displayName, photoURL, role (admin | member)

/authorizedEmails/{email}
  addedBy, addedAt

/workspaces/{workspaceId}          # "advocacia" | "docencia"
  /columns/{columnId}
    name, color, order

  /tasks/{taskId}
    title, description
    priority (alta | media | baixa)
    deadline (timestamp)
    assignedTo (userId)
    client, opposingParty, processNumber
    columnId, order
    createdBy, createdAt, updatedAt
    attachments: [{ name, url, size, uploadedAt }]

    /comments/{commentId}
      text, authorId, authorName, createdAt
```

---

## Fora do Escopo (versão inicial)

- Notificações por e-mail ou push
- Chat geral (comunicação ocorre nos comentários das tarefas)
- Relatórios ou dashboards
- Integração com sistemas jurídicos externos
- App mobile nativo

---

## Critérios de Sucesso

- Advogado e estagiário conseguem criar, mover e comentar tarefas sem necessidade de suporte
- O fluxo "estagiário entrega → advogado revisa" funciona via coluna "Aguardando Revisão"
- Arquivos podem ser anexados e baixados diretamente nos cartões
- Acesso restrito a e-mails autorizados
