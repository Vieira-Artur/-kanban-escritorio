# Design: Responsável Editável + @mention com E-mail

**Data:** 2026-05-28  
**Projeto:** kanban-escritorio  
**Status:** Aprovado

---

## Visão Geral

Duas melhorias relacionadas ao fluxo de atribuição e comunicação entre advogado e estagiário:

1. **Responsável editável** — o campo `assignedTo` no painel de tarefa passa a ser um select com os usuários reais do sistema, carregados do Firestore.
2. **@mention em comentários** — ao digitar "@" no campo de comentário, chips com os usuários aparecem abaixo do campo; clicar insere `@Nome` no texto. Ao enviar, um e-mail é disparado para cada pessoa mencionada via EmailJS.

---

## Arquitetura

### Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `src/hooks/useUsers.js` | `onSnapshot` em `/users`, retorna lista de usuários em tempo real |
| `src/utils/emailService.js` | Encapsula `emailjs.send()` — recebe dados estruturados, dispara e-mail |
| `.env` | Chaves do EmailJS (não commitado) |
| `.env.example` | Template com nomes das variáveis (commitado) |

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/components/TaskPanel.jsx` | Campo `assignedTo` vira `<select>` com dados de `useUsers` |
| `src/components/CommentSection.jsx` | Detecta "@", exibe chips, parseia menções ao enviar, chama emailService |
| `src/components/TaskCard.jsx` | Exibe nome/avatar do responsável no rodapé do cartão |

---

## Modelo de Dados

Nenhuma mudança no Firestore. A coleção `/users/{uid}` já armazena `email` e `displayName`, que são suficientes para o dropdown e para o envio de e-mail.

---

## Hook `useUsers`

```js
// src/hooks/useUsers.js
// onSnapshot em /users, retorna [{ uid, displayName, email, photoURL }]
```

Segue o mesmo padrão de `useBoard` — subscription em tempo real, lista atualiza automaticamente quando um novo usuário faz login pela primeira vez.

---

## Campo Responsável (TaskPanel)

- Carrega `useUsers()` no `TaskPanel`
- Renderiza `<select>` no lugar do campo atual (que era invisível, defaultando para `currentUser.uid`)
- Cada `<option>` mostra o `displayName` do usuário, com `value = uid`
- Dropdown estilizado: avatar circular com iniciais + nome, checkmark na seleção atual
- O campo permanece obrigatório

### Exibição no TaskCard

- Rodapé do cartão: avatar circular (iniciais ou foto) + nome do responsável
- `BoardPage` chama `useUsers()` e passa o array `users` como prop para `Board` → `Column` → `TaskCard`
- `TaskCard` recebe `users` e resolve `task.assignedTo` (uid) para o nome/foto do responsável

---

## @mention em Comentários (CommentSection)

### Comportamento de digitação

1. Usuário digita "@" em qualquer posição do texto
2. Chips aparecem abaixo do campo com todos os usuários do sistema
3. Clicar num chip insere `@DisplayName` no texto na posição do cursor e fecha os chips
4. Os chips somem quando não há "@" ativo no texto (usuário apaga o "@" ou seleciona um nome)

### Exibição pós-envio

- Comentários exibem `@Nome` com fundo azul claro (`bg-blue-100 text-blue-700 rounded px-1`) — regex simples na renderização

### Detecção de menções para e-mail

- `CommentSection` mantém um `Set<uid>` (`mentionedUids`) que cresce cada vez que um chip é clicado
- O `Set` é limpo quando o texto é enviado ou apagado completamente
- Ao submeter, itera `mentionedUids`, resolve cada uid para `{ email, displayName }` via lista de usuários, e chama `emailService.sendMention()` para cada um
- Não usa regex sobre o texto — a fonte da verdade é o `Set` de chips clicados, que é determinístico e funciona com nomes com espaço

---

## EmailService (`emailService.js`)

```js
// Parâmetros:
// { toEmail, toName, fromName, taskTitle, commentText, appUrl }
emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
```

**Template do e-mail (a configurar no EmailJS):**

> **Assunto:** `{{fromName}} mencionou você em "{{taskTitle}}"`
>
> Olá, {{toName}}.
>
> **{{fromName}}** mencionou você num comentário da tarefa **{{taskTitle}}**:
>
> > {{commentText}}
>
> Acesse o Kanban: {{appUrl}}

### Variáveis de ambiente

```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

O `.env` não é commitado. Um `.env.example` com as chaves vazias é commitado como referência.

---

## Setup (uma vez, pelo advogado)

1. Criar conta gratuita em [emailjs.com](https://www.emailjs.com) (200 e-mails/mês — gratuito)
2. Adicionar serviço de e-mail (Gmail funciona)
3. Criar template com as variáveis acima
4. Copiar Service ID, Template ID e Public Key para `.env`
5. Fazer deploy normalmente — as variáveis são embutidas no bundle pelo Vite

---

## Fora do Escopo

- Notificações push / browser notifications
- Menção por e-mail parcial (apenas `@NomeCompleto` conforme exibido no sistema)
- Histórico de menções ou painel de notificações
- E-mail para mudança de responsável (só @mention em comentários dispara e-mail)

---

## Critérios de Sucesso

- O campo Responsável exibe todos os usuários autenticados e salva corretamente no Firestore
- Digitar "@" nos comentários exibe os chips; clicar insere o nome no texto
- Ao enviar um comentário com @mention, o usuário mencionado recebe e-mail com nome do autor, título da tarefa e texto do comentário
- Quando o estagiário fizer o primeiro login, aparece automaticamente no dropdown e nos chips — sem alterar código
