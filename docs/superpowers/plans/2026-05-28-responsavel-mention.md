# Responsável Editável + @mention com E-mail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar campo de responsável editável no TaskPanel (com usuários do Firestore) e @mention em comentários com notificação por e-mail via EmailJS.

**Architecture:** `useUsers` hook carrega `/users` do Firestore em tempo real e é chamado uma única vez no `BoardPage`, de onde é propagado como prop para `Board → Column → TaskCard` (exibição do responsável) e para `TaskPanel → CommentSection` (seleção e menção). O `emailService.js` encapsula o EmailJS e é chamado pelo `CommentSection` após salvar o comentário.

**Tech Stack:** React 19, Vite, Firebase Firestore, @emailjs/browser, Vitest, React Testing Library

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/hooks/useUsers.js` | Criar | onSnapshot em /users, retorna array de usuários |
| `src/hooks/useUsers.test.jsx` | Criar | Testes do hook |
| `src/utils/emailService.js` | Criar | Wrapper EmailJS |
| `src/utils/emailService.test.js` | Criar | Testes do emailService |
| `.env.example` | Criar | Template de variáveis de ambiente |
| `src/pages/BoardPage.jsx` | Modificar | Chamar useUsers(), passar users para Board e TaskPanel |
| `src/components/Board.jsx` | Modificar | Receber e repassar prop users para Column |
| `src/components/Column.jsx` | Modificar | Receber e repassar prop users para TaskCard |
| `src/components/TaskCard.jsx` | Modificar | Exibir avatar/nome do responsável no rodapé |
| `src/components/TaskCard.test.jsx` | Modificar | Testar exibição do responsável |
| `src/components/TaskPanel.jsx` | Modificar | Receber users prop, exibir select de responsável |
| `src/components/CommentSection.jsx` | Modificar | Chips de @mention, mentionedUids, envio de e-mail |
| `src/components/CommentSection.test.jsx` | Criar | Testes do CommentSection |

---

## Task 1: Instalar EmailJS e criar `.env.example`

**Files:**
- Create: `.env.example`
- Modify: (nenhum arquivo de código)

- [ ] **Step 1: Instalar a biblioteca EmailJS**

```bash
npm install @emailjs/browser
```

Saída esperada: pacote adicionado ao `node_modules` e listado em `package.json` dependencies.

- [ ] **Step 2: Verificar que `.env` está no `.gitignore`**

```bash
grep -n "\.env" .gitignore
```

Se não aparecer, adicione a linha `.env` ao `.gitignore`.

- [ ] **Step 3: Criar `.env.example`**

Crie o arquivo `.env.example` na raiz do projeto:

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

- [ ] **Step 4: Criar `.env` local com valores placeholder**

Crie o arquivo `.env` na raiz (não será commitado):

```
VITE_EMAILJS_SERVICE_ID=placeholder
VITE_EMAILJS_TEMPLATE_ID=placeholder
VITE_EMAILJS_PUBLIC_KEY=placeholder
```

> As chaves reais serão preenchidas após criar a conta no EmailJS. Por enquanto o placeholder evita que o Vite lance erro de variável indefinida.

- [ ] **Step 5: Commit**

```bash
git add .env.example package.json package-lock.json
git commit -m "chore: instalar @emailjs/browser e criar .env.example"
```

---

## Task 2: Hook `useUsers`

**Files:**
- Create: `src/hooks/useUsers.js`
- Create: `src/hooks/useUsers.test.jsx`

- [ ] **Step 1: Escrever o teste que vai falhar**

Crie `src/hooks/useUsers.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUsers } from './useUsers.js'

vi.mock('../firebase.js', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'usersRef'),
  onSnapshot: vi.fn((ref, cb) => {
    cb({
      docs: [
        { id: 'uid1', data: () => ({ displayName: 'Artur Vieira', email: 'a@test.com', photoURL: '' }) },
        { id: 'uid2', data: () => ({ displayName: 'Estagiário', email: 'e@test.com', photoURL: '' }) },
      ],
    })
    return vi.fn()
  }),
}))

describe('useUsers', () => {
  it('retorna lista de usuários do Firestore', () => {
    const { result } = renderHook(() => useUsers())
    expect(result.current.users).toHaveLength(2)
    expect(result.current.users[0]).toEqual({
      uid: 'uid1',
      displayName: 'Artur Vieira',
      email: 'a@test.com',
      photoURL: '',
    })
    expect(result.current.users[1].displayName).toBe('Estagiário')
  })

})
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```bash
npx vitest run src/hooks/useUsers.test.jsx
```

Esperado: FAIL — "Cannot find module './useUsers.js'"

- [ ] **Step 3: Implementar `useUsers`**

Crie `src/hooks/useUsers.js`:

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const ref = collection(db, 'users')
    return onSnapshot(ref, snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    })
  }, [])

  return { users }
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

```bash
npx vitest run src/hooks/useUsers.test.jsx
```

Esperado: PASS (2 testes)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useUsers.js src/hooks/useUsers.test.jsx
git commit -m "feat: hook useUsers carrega lista de usuários do Firestore"
```

---

## Task 3: Propagar `users` pelo BoardPage → Board → Column → TaskCard

**Files:**
- Modify: `src/pages/BoardPage.jsx`
- Modify: `src/components/Board.jsx`
- Modify: `src/components/Column.jsx`

> Esta task apenas conecta as props. Os testes de comportamento ficam nas tasks seguintes.

- [ ] **Step 1: Atualizar `BoardPage.jsx`**

Abra `src/pages/BoardPage.jsx`. Adicione o import do `useUsers` e chame o hook:

```jsx
import { useUsers } from '../hooks/useUsers.js'
```

Logo após a linha `const { columns, tasks, loading, tasksForColumn } = useBoard(workspace)`, adicione:

```jsx
const { users } = useUsers()
```

No JSX, passe `users` para `Board` e para `TaskPanel`:

```jsx
<Board
  workspace={workspace}
  columns={columns}
  tasksForColumn={tasksForColumn}
  onTaskClick={setSelectedTask}
  filter={filter}
  searchQuery={searchQuery}
  currentUserId={user?.uid}
  users={users}
/>
```

```jsx
<TaskPanel
  workspace={workspace}
  task={selectedTask}
  columnId={creatingInColumn}
  columns={columns}
  currentUser={user}
  users={users}
  onClose={() => { setSelectedTask(null); setCreatingInColumn(null) }}
/>
```

- [ ] **Step 2: Atualizar `Board.jsx`**

Adicione `users` à desestruturação de props e repasse para `Column`:

```jsx
export default function Board({ workspace, columns, tasksForColumn, onTaskClick, filter, searchQuery, currentUserId, users }) {
```

No map de colunas, passe `users`:

```jsx
{columns.map(col => (
  <Column
    key={col.id}
    column={col}
    tasks={getFilteredTasks(col.id)}
    onTaskClick={onTaskClick}
    isReview={col.name === REVIEW_COLUMN_NAME}
    users={users}
  />
))}
```

- [ ] **Step 3: Atualizar `Column.jsx`**

Adicione `users` à desestruturação e repasse para `TaskCard`:

```jsx
export default function Column({ column, tasks, onTaskClick, isReview = false, users = [] }) {
```

No map de tarefas:

```jsx
{tasks.map((task, index) => (
  <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} users={users} />
))}
```

- [ ] **Step 4: Verificar que o app ainda compila**

```bash
npm run dev
```

Abra `http://localhost:5173/kanban-escritorio/` no navegador. O board deve aparecer normalmente (sem mudança visual ainda).

- [ ] **Step 5: Commit**

```bash
git add src/pages/BoardPage.jsx src/components/Board.jsx src/components/Column.jsx
git commit -m "feat: propagar prop users de BoardPage até TaskCard"
```

---

## Task 4: Campo Responsável no TaskPanel

**Files:**
- Modify: `src/components/TaskPanel.jsx`

- [ ] **Step 1: Atualizar a assinatura de `TaskPanel` para receber `users`**

Abra `src/components/TaskPanel.jsx`. Modifique a linha de parâmetros:

```jsx
export default function TaskPanel({ workspace, task, columnId, columns, currentUser, users = [], onClose }) {
```

- [ ] **Step 2: Substituir o campo `assignedTo` por um `<select>` visível**

No JSX, localize o bloco `{/* Column */}` (linha ~108). Logo **antes** dele, adicione o campo Responsável:

```jsx
{/* Responsável */}
<div>
  <label className="block text-xs font-semibold text-gray-500 mb-1">Responsável *</label>
  <select
    required
    value={form.assignedTo}
    onChange={set('assignedTo')}
    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
  >
    <option value="" disabled>Selecione um responsável</option>
    {users.map(u => (
      <option key={u.uid} value={u.uid}>{u.displayName}</option>
    ))}
  </select>
</div>
```

- [ ] **Step 3: Verificar no navegador**

Com `npm run dev` rodando, abra um cartão qualquer. O campo "Responsável" deve aparecer no formulário com os nomes dos usuários do Firestore.

> Se a lista estiver vazia, é porque o usuário logado ainda é o único em `/users`. Crie um segundo usuário de teste ou confirme que `upsertUser` foi chamado no login.

- [ ] **Step 4: Commit**

```bash
git add src/components/TaskPanel.jsx
git commit -m "feat: campo responsável editável no TaskPanel com usuários do Firestore"
```

---

## Task 5: Avatar do Responsável no TaskCard

**Files:**
- Modify: `src/components/TaskCard.jsx`
- Modify: `src/components/TaskCard.test.jsx`

- [ ] **Step 1: Escrever o teste que vai falhar**

Abra `src/components/TaskCard.test.jsx` e adicione:

```jsx
const users = [
  { uid: 'user1', displayName: 'Artur Vieira', email: 'a@test.com', photoURL: '' },
]

describe('TaskCard — responsável', () => {
  it('exibe as iniciais do responsável no rodapé', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} users={users} />)
    expect(screen.getByTitle('Artur Vieira')).toBeInTheDocument()
  })

  it('não quebra quando users está vazio', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} users={[]} />)
    expect(screen.getByText('Recurso trabalhista')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```bash
npx vitest run src/components/TaskCard.test.jsx
```

Esperado: FAIL — `getByTitle('Artur Vieira')` não encontrado

- [ ] **Step 3: Implementar o avatar no `TaskCard`**

Abra `src/components/TaskCard.jsx`. Adicione `users = []` aos parâmetros:

```jsx
export default function TaskCard({ task, onClick, index, users = [] }) {
```

Logo **antes** do `return`, adicione:

```jsx
const assignee = users.find(u => u.uid === task.assignedTo)
function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
}
```

No bloco `{/* Footer */}`, após a span de prioridade e a span de prazo, adicione o avatar:

```jsx
{assignee && (
  <span
    title={assignee.displayName}
    className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-brand-900 text-white text-[9px] font-bold shrink-0 overflow-hidden"
  >
    {assignee.photoURL
      ? <img src={assignee.photoURL} alt={assignee.displayName} className="w-full h-full object-cover" />
      : initials(assignee.displayName)
    }
  </span>
)}
```

> Remova o `ml-auto` da span de prazo se estiver lá, já que o avatar agora ocupa essa posição. O prazo fica entre prioridade e avatar.

- [ ] **Step 4: Rodar os testes para confirmar que passam**

```bash
npx vitest run src/components/TaskCard.test.jsx
```

Esperado: PASS (todos os testes, incluindo os novos)

- [ ] **Step 5: Commit**

```bash
git add src/components/TaskCard.jsx src/components/TaskCard.test.jsx
git commit -m "feat: exibir avatar do responsável no rodapé do TaskCard"
```

---

## Task 6: `emailService.js`

**Files:**
- Create: `src/utils/emailService.js`
- Create: `src/utils/emailService.test.js`

- [ ] **Step 1: Escrever o teste que vai falhar**

Crie `src/utils/emailService.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ status: 200, text: 'OK' })

vi.mock('@emailjs/browser', () => ({
  default: { send: mockSend },
}))

import { sendMentionEmail } from './emailService.js'

describe('sendMentionEmail', () => {
  beforeEach(() => mockSend.mockClear())

  it('chama emailjs.send com os parâmetros corretos', async () => {
    await sendMentionEmail({
      toEmail: 'e@test.com',
      toName: 'Estagiário',
      fromName: 'Artur Vieira',
      taskTitle: 'Revisar contrato',
      commentText: 'Favor revisar @Estagiário',
    })

    expect(mockSend).toHaveBeenCalledOnce()
    const [, , params] = mockSend.mock.calls[0]
    expect(params.to_email).toBe('e@test.com')
    expect(params.to_name).toBe('Estagiário')
    expect(params.from_name).toBe('Artur Vieira')
    expect(params.task_title).toBe('Revisar contrato')
    expect(params.comment_text).toBe('Favor revisar @Estagiário')
    expect(params.app_url).toContain('/kanban-escritorio/')
  })

  it('retorna a promise do emailjs.send', async () => {
    const result = await sendMentionEmail({
      toEmail: 'x@x.com', toName: 'X', fromName: 'Y', taskTitle: 'T', commentText: 'C',
    })
    expect(result.status).toBe(200)
  })
})
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```bash
npx vitest run src/utils/emailService.test.js
```

Esperado: FAIL — "Cannot find module './emailService.js'"

- [ ] **Step 3: Implementar `emailService.js`**

Crie `src/utils/emailService.js`:

```js
import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export function sendMentionEmail({ toEmail, toName, fromName, taskTitle, commentText }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email:     toEmail,
    to_name:      toName,
    from_name:    fromName,
    task_title:   taskTitle,
    comment_text: commentText,
    app_url:      `${window.location.origin}/kanban-escritorio/`,
  }, PUBLIC_KEY)
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

```bash
npx vitest run src/utils/emailService.test.js
```

Esperado: PASS (2 testes)

- [ ] **Step 5: Commit**

```bash
git add src/utils/emailService.js src/utils/emailService.test.js
git commit -m "feat: emailService wrapper para envio de @mentions via EmailJS"
```

---

## Task 7: @mention no CommentSection

**Files:**
- Modify: `src/components/CommentSection.jsx`
- Create: `src/components/CommentSection.test.jsx`

- [ ] **Step 1: Escrever os testes que vão falhar**

Crie `src/components/CommentSection.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentSection from './CommentSection.jsx'

vi.mock('../hooks/useTask.js', () => ({
  useTask: () => ({ comments: [] }),
}))

vi.mock('../utils/firestore.js', () => ({
  addComment: vi.fn().mockResolvedValue({}),
}))

const mockSendMentionEmail = vi.fn().mockResolvedValue({})
vi.mock('../utils/emailService.js', () => ({
  sendMentionEmail: (...args) => mockSendMentionEmail(...args),
}))

const users = [
  { uid: 'uid1', displayName: 'Artur Vieira', email: 'a@test.com', photoURL: '' },
  { uid: 'uid2', displayName: 'Estagiário', email: 'e@test.com', photoURL: '' },
]

const defaultProps = {
  workspace: 'advocacia',
  taskId: 'task1',
  taskTitle: 'Revisar contrato',
  currentUser: { uid: 'uid1', displayName: 'Artur Vieira', photoURL: '' },
  users,
}

describe('CommentSection — @mention chips', () => {
  beforeEach(() => mockSendMentionEmail.mockClear())

  it('não exibe chips antes de digitar @', () => {
    render(<CommentSection {...defaultProps} />)
    expect(screen.queryByText('@Estagiário')).not.toBeInTheDocument()
  })

  it('exibe chips quando usuário digita @', async () => {
    render(<CommentSection {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva um comentário...')
    await userEvent.type(input, 'Olá @')
    expect(screen.getByText('@Estagiário')).toBeInTheDocument()
    expect(screen.getByText('@Artur Vieira')).toBeInTheDocument()
  })

  it('insere @Nome ao clicar num chip e esconde os chips', async () => {
    render(<CommentSection {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva um comentário...')
    await userEvent.type(input, 'Olá @')
    fireEvent.click(screen.getByText('@Estagiário'))
    expect(input.value).toContain('@Estagiário')
    expect(screen.queryByText('@Estagiário')).not.toBeInTheDocument()
  })

  it('envia e-mail para os usuários mencionados ao submeter', async () => {
    render(<CommentSection {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva um comentário...')
    await userEvent.type(input, 'Olá @')
    fireEvent.click(screen.getByText('@Estagiário'))
    fireEvent.click(screen.getByText('Enviar'))
    await waitFor(() => {
      expect(mockSendMentionEmail).toHaveBeenCalledWith(expect.objectContaining({
        toEmail: 'e@test.com',
        toName: 'Estagiário',
        fromName: 'Artur Vieira',
        taskTitle: 'Revisar contrato',
      }))
    })
  })
})
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

```bash
npx vitest run src/components/CommentSection.test.jsx
```

Esperado: FAIL — props `users`, `taskTitle` não reconhecidas / chips não renderizados

- [ ] **Step 3: Implementar o CommentSection atualizado**

Substitua o conteúdo de `src/components/CommentSection.jsx`:

```jsx
import { useState } from 'react'
import { useTask } from '../hooks/useTask.js'
import { addComment } from '../utils/firestore.js'
import { sendMentionEmail } from '../utils/emailService.js'

function renderText(text) {
  return text.split(/(@\S+)/g).map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="bg-blue-100 text-blue-700 rounded px-1 font-semibold text-xs">{part}</span>
      : part
  )
}

export default function CommentSection({ workspace, taskId, taskTitle, currentUser, users = [] }) {
  const { comments } = useTask(workspace, taskId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [mentionedUids, setMentionedUids] = useState(new Set())
  const [showChips, setShowChips] = useState(false)

  function handleTextChange(e) {
    const val = e.target.value
    setText(val)
    setShowChips(/@\w*$/.test(val))
  }

  function handleChipClick(user) {
    setText(prev => prev.replace(/@\w*$/, '') + `@${user.displayName} `)
    setMentionedUids(prev => new Set([...prev, user.uid]))
    setShowChips(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await addComment(workspace, taskId, {
        text: text.trim(),
        authorId:    currentUser.uid,
        authorName:  currentUser.displayName,
        authorPhoto: currentUser.photoURL,
      })

      const emailPromises = [...mentionedUids].map(uid => {
        const user = users.find(u => u.uid === uid)
        if (!user) return Promise.resolve()
        return sendMentionEmail({
          toEmail:     user.email,
          toName:      user.displayName,
          fromName:    currentUser.displayName,
          taskTitle,
          commentText: text.trim(),
        })
      })
      Promise.all(emailPromises).catch(err => console.warn('EmailJS error:', err))

      setText('')
      setMentionedUids(new Set())
      setShowChips(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">💬 Comentários</p>

      <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400">Nenhum comentário ainda.</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-900 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
              {c.authorPhoto
                ? <img src={c.authorPhoto} alt="" className="w-full h-full object-cover" />
                : c.authorName?.[0] ?? '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold text-gray-800">{c.authorName}</span>
                <span className="text-[10px] text-gray-400">
                  {c.createdAt?.toDate
                    ? c.createdAt.toDate().toLocaleDateString('pt-BR')
                    : ''}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-0.5">{renderText(c.text)}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={handleTextChange}
            placeholder="Escreva um comentário..."
            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="text-xs font-semibold bg-brand-900 text-white px-3 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            Enviar
          </button>
        </div>

        {showChips && users.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {users.map(u => (
              <button
                key={u.uid}
                type="button"
                onClick={() => handleChipClick(u)}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-brand-900 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                  {u.displayName?.[0] ?? '?'}
                </span>
                @{u.displayName}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Atualizar a chamada de `CommentSection` no `TaskPanel`**

Abra `src/components/TaskPanel.jsx`. Localize a linha onde `CommentSection` é renderizado:

```jsx
{!isNew && (
  <CommentSection workspace={workspace} taskId={task.id} currentUser={currentUser} />
)}
```

Substitua por:

```jsx
{!isNew && (
  <CommentSection
    workspace={workspace}
    taskId={task.id}
    taskTitle={task.title}
    currentUser={currentUser}
    users={users}
  />
)}
```

- [ ] **Step 5: Rodar os testes para confirmar que passam**

```bash
npx vitest run src/components/CommentSection.test.jsx
```

Esperado: PASS (4 testes)

- [ ] **Step 6: Rodar a suite completa de testes**

```bash
npx vitest run
```

Esperado: todos os testes passam. Se algum teste existente de TaskCard falhar por falta da prop `users`, adicione `users={[]}` nas chamadas de render existentes.

- [ ] **Step 7: Testar manualmente no navegador**

Com `npm run dev`, abra um cartão, adicione um comentário com "@" e verifique que os chips aparecem. Clique num chip e confirme que `@Nome` é inserido. 

> O e-mail não será enviado com as chaves placeholder — isso é esperado. O envio real requer o setup do EmailJS descrito abaixo.

- [ ] **Step 8: Commit**

```bash
git add src/components/CommentSection.jsx src/components/CommentSection.test.jsx src/components/TaskPanel.jsx
git commit -m "feat: @mention em comentários com chips e notificação por e-mail (EmailJS)"
```

---

## Setup EmailJS (pós-deploy — uma vez)

Após o código estar deployado no GitHub Pages:

1. Acesse [emailjs.com](https://www.emailjs.com) → criar conta gratuita
2. **Add Service** → selecione Gmail → conecte com sua conta Google
3. **Email Templates** → Create Template → configure:
   - **Subject:** `{{from_name}} mencionou você em "{{task_title}}"`
   - **Body (HTML ou texto):**
     ```
     Olá, {{to_name}}.

     {{from_name}} mencionou você num comentário da tarefa {{task_title}}:

     {{comment_text}}

     Acesse o Kanban: {{app_url}}
     ```
   - **To Email:** `{{to_email}}`
4. Em **Account** → copie o **Public Key**
5. Em **Email Services** → copie o **Service ID**
6. Em **Email Templates** → copie o **Template ID**
7. Preencha `.env` com os três valores
8. Execute `npm run build && git add dist && git push` para fazer novo deploy

---

## Verificação Final

```bash
npx vitest run
```

Todos os testes devem passar. O app em `npm run dev` deve:
- Exibir campo "Responsável" no painel de tarefa com a lista de usuários
- Mostrar avatar/iniciais do responsável no rodapé de cada cartão
- Exibir chips de @mention ao digitar "@" nos comentários
- Inserir `@Nome` ao clicar num chip
- (Após setup do EmailJS) Enviar e-mail ao destinatário mencionado
