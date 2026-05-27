# Redesign Visual + Mobile — Kanban Escritório

**Data:** 2026-05-27
**Projeto:** kanban-escritorio
**Status:** Aprovado

---

## Visão Geral

Refinamento visual do sistema kanban existente e implementação de layout responsivo para mobile. Nenhuma funcionalidade nova — apenas melhoria de aparência e usabilidade em telas pequenas.

---

## 1. Tipografia

**Fonte:** `Outfit` (Google Fonts), pesos 400, 500, 600 e 700.

- Adicionar import no `index.html` via Google Fonts
- Aplicar `font-family: 'Outfit', sans-serif` no `body` em `index.css`, substituindo o sans-serif padrão do Tailwind
- Adicionar `fontFamily` no `tailwind.config.js`: `sans: ['Outfit', 'sans-serif']`

---

## 2. Fundo do Board

**Cor:** `bg-slate-100` (`#f1f5f9`) no container principal do board.

- Em `BoardPage.jsx`, o wrapper externo (área atrás das colunas) recebe `bg-slate-100`
- O board deve ocupar 100% da altura restante (`flex-1 overflow-hidden`)

---

## 3. TopBar — virar azul escura

A TopBar deixa de ser branca e passa a ter o fundo `bg-brand-900` (`#1F497D`) com texto branco.

**Mudanças em `TopBar.jsx`:**
- Container: `bg-brand-900 text-white border-b-0`
- Abas de workspace ativas: `bg-white/20 text-white` | inativas: `text-white/60 hover:text-white/90`
- Input de busca: `bg-white/15 text-white placeholder:text-white/50 border-0 focus:ring-white/30`
- Avatar/inicial: `bg-white/20 text-white`
- Dropdown do menu: mantém fundo branco com texto escuro (sem mudança)

---

## 4. FilterBar — integrada ao board

A FilterBar deixa de ser branca e passa a usar o mesmo fundo `bg-slate-100` do board, criando a separação visual: **azul = navegação**, **cinza = conteúdo**.

**Mudanças em `FilterBar.jsx`:**
- Container: `bg-slate-100 border-b border-slate-200 px-4 py-2`
- Pills inativos: `bg-white text-gray-500 border border-gray-200 hover:bg-gray-50`
- Pills ativos: `bg-brand-900 text-white border-0` (sem mudança)

---

## 5. Cabeçalhos das Colunas

Os cabeçalhos saem de dentro do card branco e ficam **acima da caixa**, com ponto colorido maior e label bold.

**Mudanças em `Column.jsx`:**
- O cabeçalho (`div` com nome + badge) sai do interior do container branco
- Estrutura nova: cabeçalho solto → abaixo vem o container branco com os cards
- Ponto colorido: `w-2.5 h-2.5 rounded-full` (era menor)
- Label: `text-sm font-bold text-slate-800`
- Badge de contagem: `bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 text-xs font-semibold ml-auto`
- Cor do ponto por coluna (mapeamento por nome exato da coluna no Firestore):
  - `"A Fazer"`: `bg-slate-400`
  - `"Em Andamento"`: `bg-blue-500`
  - `"Aguardando Revisão"`: `bg-amber-400`
  - `"Concluído"`: `bg-emerald-500`
  - Qualquer outro nome: `bg-slate-400` (fallback)

A coluna "Aguardando Revisão" mantém o fundo azul claro (`bg-blue-50`) no container dos cards.

---

## 6. Mobile — Abas no Topo

Em telas pequenas (`< sm`, ou seja, `< 640px`), o board deixa de exibir todas as colunas lado a lado e passa a mostrar **uma coluna por vez**, com navegação por abas no topo.

### 6a. Strip de abas (novo componente `ColumnTabs.jsx`)

- Renderizado apenas no mobile (`sm:hidden`)
- Container: `bg-white border-b border-gray-100 flex overflow-x-auto`
- Cada aba: nome abreviado da coluna + badge com contagem de tarefas visíveis (após filtro)
  - Abreviações: "A Fazer", "Andamento", "Revisão", "Concluído"
- Aba ativa: `text-brand-900 border-b-2 border-brand-900 font-bold`
- Aba inativa: `text-gray-400`
- Sem scroll indicator adicional — o overflow nativo do browser é suficiente

### 6b. Comportamento do Board no mobile

- Desktop (`sm:`): layout atual — `flex flex-row overflow-x-auto` com todas as colunas visíveis
- Mobile: renderiza apenas a coluna cujo `id === activeColumnId` (renderização condicional, não CSS `hidden`)
- O estado `activeColumnId` fica em `BoardPage.jsx` e é passado como prop para `Board.jsx` e `ColumnTabs.jsx`
- Valor inicial: primeira coluna da lista

### 6c. Largura das colunas no mobile

- Mobile: coluna ocupa `w-full` (largura total da tela)
- Desktop: mantém `w-[260px] min-w-[260px]` atual

### 6d. FilterBar no mobile

- No mobile, os pills do FilterBar ficam em scroll horizontal (`overflow-x-auto`) se necessário
- Nenhuma pill é removida — todas ficam disponíveis, rolando se necessário

---

## Fora do Escopo

- Logo/brand mark (não muda)
- Cores do sistema de prioridade (vermelho urgente permanece)
- TaskPanel (não muda)
- AdminPage (não muda)
- Qualquer funcionalidade nova
