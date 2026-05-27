# Redesign Visual + Mobile — Kanban Escritório

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar Outfit, fundo slate-100, TopBar azul escura, FilterBar integrada ao board, cabeçalhos de coluna bold acima da caixa, e navegação mobile por abas.

**Architecture:** Mudanças de estilo em componentes existentes (TopBar, FilterBar, Column, Board, BoardPage) + criação de `ColumnTabs.jsx` para navegação mobile. Estado `activeColumnId` fica em BoardPage e é passado para Board e ColumnTabs. Sem alteração de lógica de negócio.

**Tech Stack:** React, Tailwind CSS v3, Vite. Rodar testes com `npx vitest run` na raiz do projeto. Dev server: `npm run dev`.

---

### Task 1: Tipografia — fonte Outfit

**Files:**
- Modify: `index.html`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Adicionar Google Fonts no `index.html`**

Inserir as 3 linhas abaixo logo antes de `</head>` em `index.html`:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Kanban Escritório</title>
```

Resultado esperado de `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Kanban Escritório</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Registrar Outfit como fonte sans padrão no Tailwind**

Substituir o conteúdo de `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          700: '#1d4ed8',
          900: '#1F497D',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Verificar no browser**

Rodar `npm run dev`, abrir `http://localhost:5173`, inspecionar qualquer texto — deve mostrar `font-family: Outfit` no DevTools.

- [ ] **Step 4: Rodar testes**

```bash
npx vitest run
```

Esperado: todos passam (mudança é só visual).

- [ ] **Step 5: Commit**

```bash
git add index.html tailwind.config.js
git commit -m "style: adicionar fonte Outfit via Google Fonts"
```

---

### Task 2: TopBar — fundo azul escuro

**Files:**
- Modify: `src/components/TopBar.jsx`

- [ ] **Step 1: Substituir o conteúdo completo de `TopBar.jsx`**

```jsx
import { useState } from 'react'

export default function TopBar({ workspace, onWorkspaceChange, onSearch, user, isAdmin, onLogout, onAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="h-14 bg-brand-900 flex items-center px-5 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
          <span className="text-white text-sm font-extrabold">AV</span>
        </div>
        <span className="text-base font-bold text-white hidden sm:block">Artur Vieira</span>
      </div>

      {/* Workspace tabs */}
      <nav className="flex gap-1">
        {[
          { id: 'advocacia', label: '⚖️ Advocacia' },
          { id: 'docencia',  label: '🎓 Docência'  },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onWorkspaceChange(id)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              workspace === id
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <input
          type="search"
          placeholder="Buscar tarefa, cliente..."
          onChange={e => onSearch(e.target.value)}
          className="w-full text-sm px-3 py-1.5 bg-white/15 text-white placeholder:text-white/50 rounded-lg border-none outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>

      {/* Avatar + menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-8 h-8 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center overflow-hidden"
        >
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            : (user?.displayName?.[0] ?? '?')}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-50">
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">
              {user?.email}
            </div>
            {isAdmin && (
              <button
                onClick={() => { setMenuOpen(false); onAdmin() }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                ⚙️ Gerenciar usuários
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Rodar testes**

```bash
npx vitest run
```

Esperado: todos passam (testes verificam comportamento de click, não classes).

- [ ] **Step 3: Verificar no browser**

`npm run dev` — TopBar deve aparecer em azul escuro `#1F497D` com texto branco. Dropdown do usuário deve continuar branco.

- [ ] **Step 4: Commit**

```bash
git add src/components/TopBar.jsx
git commit -m "style: TopBar com fundo azul escuro e texto branco"
```

---

### Task 3: FilterBar + fundo do board

**Files:**
- Modify: `src/components/FilterBar.jsx`
- Modify: `src/pages/BoardPage.jsx`

- [ ] **Step 1: Substituir o conteúdo de `FilterBar.jsx`**

```jsx
export default function FilterBar({ filter, onFilterChange }) {
  const filters = [
    { id: 'all',    label: 'Todos' },
    { id: 'mine',   label: 'Minhas tarefas' },
    { id: 'intern', label: 'Do estagiário' },
    { id: 'urgent', label: '⚡ Urgente' },
  ]

  return (
    <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center gap-2 shrink-0">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
            filter === f.id
              ? 'bg-brand-900 text-white'
              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Mudar fundo do BoardPage de `bg-gray-50` para `bg-slate-100`**

Em `src/pages/BoardPage.jsx`, linha 32, trocar:

```jsx
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
```

por:

```jsx
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
```

- [ ] **Step 3: Verificar no browser**

FilterBar deve ter fundo cinza igual ao board. Pills inativos devem ser brancos com borda. A separação visual entre TopBar (azul) e FilterBar (cinza) deve ser clara.

- [ ] **Step 4: Rodar testes**

```bash
npx vitest run
```

Esperado: todos passam.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.jsx src/pages/BoardPage.jsx
git commit -m "style: FilterBar integrada ao fundo do board"
```

---

### Task 4: Cabeçalhos das colunas — bold acima da caixa

**Files:**
- Modify: `src/components/Column.jsx`

- [ ] **Step 1: Substituir o conteúdo completo de `Column.jsx`**

```jsx
import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard.jsx'

export default function Column({ column, tasks, onTaskClick, onAddTask, isReview = false }) {
  return (
    <div className="flex flex-col w-full sm:w-[260px] sm:min-w-[260px]">
      {/* Cabeçalho ACIMA da caixa branca */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-sm font-bold text-slate-800">{column.name}</span>
        <span className="ml-auto bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 text-xs font-semibold">
          {tasks.length}
        </span>
      </div>

      {/* Caixa branca = área droppable */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-2 shadow-sm transition-colors ${
              isReview
                ? 'bg-blue-50'
                : snapshot.isDraggingOver
                  ? 'bg-blue-50'
                  : 'bg-white'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
            ))}
            {provided.placeholder}

            <button
              onClick={() => onAddTask?.(column.id)}
              className="text-xs text-gray-400 hover:text-brand-700 py-2 text-center rounded-lg hover:bg-blue-50 transition-colors mt-1"
            >
              + Adicionar tarefa
            </button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
```

- [ ] **Step 2: Verificar no browser**

Cabeçalhos devem aparecer acima da caixa branca, não dentro dela. Coluna "Aguardando Revisão" deve ter fundo azul claro na caixa. Drag-and-drop deve continuar funcionando.

- [ ] **Step 3: Rodar testes**

```bash
npx vitest run
```

Esperado: todos passam.

- [ ] **Step 4: Commit**

```bash
git add src/components/Column.jsx
git commit -m "style: cabeçalhos de coluna bold acima da caixa branca"
```

---

### Task 5: Mobile — navegação por abas

**Files:**
- Create: `src/components/ColumnTabs.jsx`
- Modify: `src/pages/BoardPage.jsx`
- Modify: `src/components/Board.jsx`

- [ ] **Step 1: Criar `src/components/ColumnTabs.jsx`**

```jsx
const ABBREV = {
  'A Fazer': 'A Fazer',
  'Em Andamento': 'Andamento',
  'Aguardando Revisão': 'Revisão',
  'Concluído': 'Concluído',
}

export default function ColumnTabs({ columns, activeColumnId, onColumnChange, tasksForColumn }) {
  return (
    <div className="sm:hidden bg-white border-b border-gray-100 flex overflow-x-auto shrink-0">
      {columns.map(col => {
        const isActive = col.id === activeColumnId
        const count = tasksForColumn(col.id).length
        return (
          <button
            key={col.id}
            onClick={() => onColumnChange(col.id)}
            className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              isActive
                ? 'text-brand-900 border-brand-900'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {ABBREV[col.name] ?? col.name}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              isActive
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Modificar `Board.jsx` para aceitar `activeColumnId`**

Substituir o conteúdo completo de `src/components/Board.jsx`:

```jsx
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column.jsx'
import { moveTask } from '../utils/firestore.js'

export default function Board({ workspace, columns, tasksForColumn, onTaskClick, onAddTask, filter, searchQuery, currentUserId, activeColumnId }) {
  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    await moveTask(workspace, draggableId, destination.droppableId)
  }

  function getFilteredTasks(columnId) {
    let tasks = tasksForColumn(columnId)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.client?.toLowerCase().includes(q) ||
        t.processNumber?.toLowerCase().includes(q)
      )
    }

    if (filter === 'mine')   tasks = tasks.filter(t => !t.isIntern)
    if (filter === 'intern') tasks = tasks.filter(t => t.isIntern)
    if (filter === 'urgent') tasks = tasks.filter(t => t.priority === 'alta')

    return tasks
  }

  const REVIEW_COLUMN_NAME = 'Aguardando Revisão'

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4 sm:p-5 h-full">
        {columns.map(col => (
          <div
            key={col.id}
            className={col.id !== activeColumnId ? 'hidden sm:flex' : 'flex'}
          >
            <Column
              column={col}
              tasks={getFilteredTasks(col.id)}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              isReview={col.name === REVIEW_COLUMN_NAME}
            />
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
```

- [ ] **Step 3: Modificar `BoardPage.jsx` para adicionar estado mobile e ColumnTabs**

Substituir o conteúdo completo de `src/pages/BoardPage.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useBoard } from '../hooks/useBoard.js'
import TopBar from '../components/TopBar.jsx'
import Board from '../components/Board.jsx'
import FilterBar from '../components/FilterBar.jsx'
import TaskPanel from '../components/TaskPanel.jsx'
import ColumnTabs from '../components/ColumnTabs.jsx'

export default function BoardPage() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState('advocacia')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [creatingInColumn, setCreatingInColumn] = useState(null)
  const [activeColumnId, setActiveColumnId] = useState(null)

  const { columns, tasks, loading, tasksForColumn } = useBoard(workspace)

  const reviewColumn = columns.find(c => c.name === 'Aguardando Revisão')
  const reviewCount = reviewColumn ? tasksForColumn(reviewColumn.id).length : 0

  // Aba ativa padrão: primeira coluna quando carregadas
  const resolvedActiveColumnId = activeColumnId ?? columns[0]?.id

  function handleWorkspaceChange(ws) {
    setWorkspace(ws)
    setActiveColumnId(null)
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
      Carregando...
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      <TopBar
        workspace={workspace}
        onWorkspaceChange={handleWorkspaceChange}
        onSearch={setSearchQuery}
        user={user}
        isAdmin={isAdmin}
        onLogout={logout}
        onAdmin={() => navigate('/admin')}
      />

      {reviewCount > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-center gap-2 text-sm shrink-0">
          <span className="text-blue-600 font-semibold">
            💬 {reviewCount} {reviewCount === 1 ? 'tarefa aguarda' : 'tarefas aguardam'} sua revisão
          </span>
        </div>
      )}

      <FilterBar filter={filter} onFilterChange={setFilter} />

      <ColumnTabs
        columns={columns}
        activeColumnId={resolvedActiveColumnId}
        onColumnChange={setActiveColumnId}
        tasksForColumn={tasksForColumn}
      />

      <div className="flex-1 overflow-hidden">
        <Board
          workspace={workspace}
          columns={columns}
          tasksForColumn={tasksForColumn}
          onTaskClick={setSelectedTask}
          onAddTask={columnId => setCreatingInColumn(columnId)}
          filter={filter}
          searchQuery={searchQuery}
          currentUserId={user?.uid}
          activeColumnId={resolvedActiveColumnId}
        />
      </div>

      {(selectedTask || creatingInColumn) && (
        <TaskPanel
          workspace={workspace}
          task={selectedTask}
          columnId={creatingInColumn}
          columns={columns}
          currentUser={user}
          onClose={() => { setSelectedTask(null); setCreatingInColumn(null) }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Rodar testes**

```bash
npx vitest run
```

Esperado: todos passam.

- [ ] **Step 5: Verificar no browser — desktop**

`npm run dev` em tela cheia: todas as colunas visíveis, ColumnTabs oculto. Comportamento idêntico ao anterior.

- [ ] **Step 6: Verificar no browser — mobile**

No DevTools, ativar viewport mobile (ex: iPhone 12 — 390px). Deve aparecer a strip de abas com "A Fazer | Andamento | Revisão | Concluído". Clicar em cada aba deve trocar a coluna exibida.

- [ ] **Step 7: Commit**

```bash
git add src/components/ColumnTabs.jsx src/components/Board.jsx src/pages/BoardPage.jsx
git commit -m "feat: navegação mobile por abas de coluna"
```
