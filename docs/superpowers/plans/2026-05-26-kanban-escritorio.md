# Kanban Escritório — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um sistema Kanban privado para escritório de advocacia e docência, com login Google, drag-and-drop, comentários por tarefa e upload de arquivos, hospedado no GitHub Pages com Firebase como backend.

**Architecture:** SPA React com Firebase SDK rodando no browser. Sem servidor próprio. Firestore para dados em tempo real, Firebase Storage para arquivos, Firebase Auth para login Google com whitelist de e-mails. Deploy automático via GitHub Actions para GitHub Pages.

**Tech Stack:** React 18 + Vite, Firebase 10 (modular SDK), @hello-pangea/dnd, Tailwind CSS, React Router v6, Vitest + React Testing Library

---

## Pré-requisito: Configuração do Firebase (manual — fazer antes de qualquer tarefa)

Antes de começar, o usuário precisa:

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) com arturapv@gmail.com
2. Clique "Adicionar projeto" → nome: `kanban-escritorio` → desabilite Google Analytics → Criar
3. No painel do projeto: **Authentication** → Primeiros passos → Provedores de login → Google → Ativar → salvar
4. **Firestore Database** → Criar banco de dados → Modo produção → `southamerica-east1` (São Paulo) → Concluído
5. **Storage** → Primeiros passos → Modo produção → `southamerica-east1` → Concluído
6. **Configurações do projeto** (ícone ⚙️) → Seus apps → `</>` (Web) → apelido: `kanban-escritorio` → Registrar app
7. Copie o objeto `firebaseConfig` que aparecer — você vai precisar na Tarefa 2

---

## Estrutura de Arquivos

```
kanban-escritorio/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions: build + deploy para Pages
├── src/
│   ├── main.jsx                   # Ponto de entrada React
│   ├── App.jsx                    # Roteamento + AuthGuard
│   ├── firebase.js                # Inicialização Firebase (auth, db, storage)
│   ├── test-setup.js              # Setup Vitest + jest-dom
│   ├── components/
│   │   ├── LoginPage.jsx          # Tela de login Google
│   │   ├── AccessDenied.jsx       # Tela de acesso negado
│   │   ├── TopBar.jsx             # Barra superior: logo, abas, busca, avatar
│   │   ├── Board.jsx              # Container do Kanban (DragDropContext)
│   │   ├── Column.jsx             # Coluna (Droppable) + header
│   │   ├── TaskCard.jsx           # Cartão compacto (Draggable)
│   │   ├── TaskPanel.jsx          # Painel lateral: detalhes, edição
│   │   ├── CommentSection.jsx     # Lista de comentários + input
│   │   ├── AttachmentSection.jsx  # Upload e lista de anexos
│   │   ├── FilterBar.jsx          # Chips de filtro + busca
│   │   └── UserManager.jsx        # Painel admin: gerenciar e-mails
│   ├── hooks/
│   │   ├── useAuth.js             # Estado auth, login, logout, isAdmin, isAuthorized
│   │   ├── useBoard.js            # Colunas + tarefas em tempo real (onSnapshot)
│   │   └── useTask.js             # Tarefa individual + comentários + anexos
│   └── utils/
│       ├── firestore.js           # Funções CRUD: createTask, updateTask, moveTask, etc.
│       └── formatters.js          # formatDate, priorityLabel, priorityColor
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .gitignore
```

---

## Tarefa 1: Bootstrap do Projeto

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/test-setup.js`, `.gitignore`

- [ ] **Step 1: Inicializar projeto Vite + React**

No diretório `C:\Users\artur\Documents\kanban-escritorio`, execute:
```bash
npm create vite@latest . -- --template react
npm install
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install firebase react-router-dom @hello-pangea/dnd
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configurar vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kanban-escritorio/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 4: Configurar tailwind.config.js**

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
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Configurar src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Substituir src/index.css pelo CSS do Tailwind**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Criar .gitignore**

```
node_modules
dist
.env
.env.local
*.env
```

- [ ] **Step 8: Criar src/App.jsx provisório (só para confirmar que roda)**

```jsx
export default function App() {
  return <div className="p-4 text-brand-900 font-bold">Kanban Escritório — setup OK</div>
}
```

- [ ] **Step 9: Atualizar src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 10: Confirmar que o projeto roda**

```bash
npm run dev
```
Esperado: browser abre em `http://localhost:5173/kanban-escritorio/` com texto "Kanban Escritório — setup OK"

- [ ] **Step 11: Confirmar que testes passam**

```bash
npm run test
```
Esperado: "No tests found" (zero falhas)

- [ ] **Step 12: Inicializar git e primeiro commit**

```bash
git init
git add .
git commit -m "feat: bootstrap React + Vite + Firebase + Tailwind"
```

---

## Tarefa 2: Configuração Firebase

**Files:**
- Create: `.env.local`, `src/firebase.js`

- [ ] **Step 1: Criar .env.local com as credenciais do Firebase**

Abra o arquivo `.env.local` na raiz do projeto e preencha com os valores do `firebaseConfig` que você copiou do Console:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=kanban-escritorio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kanban-escritorio
VITE_FIREBASE_STORAGE_BUCKET=kanban-escritorio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

- [ ] **Step 2: Criar src/firebase.js**

```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

- [ ] **Step 3: Verificar que o módulo importa sem erros**

```bash
npm run build
```
Esperado: build completa sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/firebase.js
git commit -m "feat: add Firebase config module"
```

> ⚠️ `.env.local` está no `.gitignore` e NÃO vai para o git. Os secrets vão no GitHub Actions na Tarefa 17.

---

## Tarefa 3: Utilitários — Formatters

**Files:**
- Create: `src/utils/formatters.js`, `src/utils/formatters.test.js`

- [ ] **Step 1: Escrever os testes**

`src/utils/formatters.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { formatDate, priorityLabel, priorityColor, isOverdue } from './formatters.js'

describe('formatDate', () => {
  it('formats a timestamp to dd/mm/yyyy', () => {
    const ts = new Date('2026-05-28T12:00:00').getTime()
    expect(formatDate(ts)).toBe('28/05/2026')
  })
  it('returns "" for null', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('priorityLabel', () => {
  it('returns Portuguese labels', () => {
    expect(priorityLabel('alta')).toBe('Alta')
    expect(priorityLabel('media')).toBe('Média')
    expect(priorityLabel('baixa')).toBe('Baixa')
  })
})

describe('priorityColor', () => {
  it('returns tailwind classes for each priority', () => {
    expect(priorityColor('alta')).toContain('red')
    expect(priorityColor('media')).toContain('amber')
    expect(priorityColor('baixa')).toContain('emerald')
  })
})

describe('isOverdue', () => {
  it('returns true when deadline is in the past', () => {
    const yesterday = Date.now() - 86400000
    expect(isOverdue(yesterday)).toBe(true)
  })
  it('returns false when deadline is in the future', () => {
    const tomorrow = Date.now() + 86400000
    expect(isOverdue(tomorrow)).toBe(false)
  })
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar testes — confirmar que falham**

```bash
npm run test -- formatters
```
Esperado: FAIL — "Cannot find module './formatters.js'"

- [ ] **Step 3: Criar src/utils/formatters.js**

```js
export function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function priorityLabel(priority) {
  return { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[priority] ?? priority
}

export function priorityColor(priority) {
  return {
    alta:  'bg-red-100 text-red-700',
    media: 'bg-amber-100 text-amber-700',
    baixa: 'bg-emerald-100 text-emerald-700',
  }[priority] ?? 'bg-gray-100 text-gray-600'
}

export function isOverdue(timestamp) {
  if (!timestamp) return false
  return timestamp < Date.now()
}
```

- [ ] **Step 4: Rodar testes — confirmar que passam**

```bash
npm run test -- formatters
```
Esperado: PASS — 6 testes

- [ ] **Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add formatters utilities with tests"
```

---

## Tarefa 4: Utilitários — Firestore CRUD

**Files:**
- Create: `src/utils/firestore.js`

- [ ] **Step 1: Criar src/utils/firestore.js**

```js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch, query, orderBy, getDocs,
  setDoc, getDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

// ── Authorized Emails ────────────────────────────────────────────────────────

export async function isEmailAuthorized(email) {
  const snap = await getDoc(doc(db, 'authorizedEmails', email))
  return snap.exists()
}

export async function addAuthorizedEmail(email, addedBy) {
  await setDoc(doc(db, 'authorizedEmails', email), {
    addedBy,
    addedAt: serverTimestamp(),
  })
}

export async function removeAuthorizedEmail(email) {
  await deleteDoc(doc(db, 'authorizedEmails', email))
}

// ── Columns ──────────────────────────────────────────────────────────────────

const DEFAULT_COLUMNS = [
  { name: 'A Fazer',             color: '#6366f1', order: 0 },
  { name: 'Em Andamento',        color: '#f59e0b', order: 1 },
  { name: 'Aguardando Revisão',  color: '#3b82f6', order: 2 },
  { name: 'Concluído',           color: '#10b981', order: 3 },
]

export async function seedColumnsIfEmpty(workspace) {
  const colRef = collection(db, 'workspaces', workspace, 'columns')
  const snap = await getDocs(colRef)
  if (!snap.empty) return
  const batch = writeBatch(db)
  DEFAULT_COLUMNS.forEach(col => {
    batch.set(doc(colRef), col)
  })
  await batch.commit()
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export async function createTask(workspace, data) {
  const colRef = collection(db, 'workspaces', workspace, 'tasks')
  return addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateTask(workspace, taskId, data) {
  const ref = doc(db, 'workspaces', workspace, 'tasks', taskId)
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteTask(workspace, taskId) {
  return deleteDoc(doc(db, 'workspaces', workspace, 'tasks', taskId))
}

export async function moveTask(workspace, taskId, newColumnId) {
  return updateTask(workspace, taskId, { columnId: newColumnId })
}

// ── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(workspace, taskId, { text, authorId, authorName, authorPhoto }) {
  const ref = collection(db, 'workspaces', workspace, 'tasks', taskId, 'comments')
  return addDoc(ref, {
    text,
    authorId,
    authorName,
    authorPhoto: authorPhoto ?? '',
    createdAt: serverTimestamp(),
  })
}

// ── User profile ─────────────────────────────────────────────────────────────

export async function upsertUser(user) {
  const ADMIN_EMAIL = 'arturapv@gmail.com'
  const ref = doc(db, 'users', user.uid)
  await setDoc(ref, {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL ?? '',
    role: user.email === ADMIN_EMAIL ? 'admin' : 'member',
  }, { merge: true })
}
```

- [ ] **Step 2: Confirmar build sem erros**

```bash
npm run build
```
Esperado: build OK

- [ ] **Step 3: Commit**

```bash
git add src/utils/firestore.js
git commit -m "feat: add Firestore CRUD utilities"
```

---

## Tarefa 5: Hook de Autenticação

**Files:**
- Create: `src/hooks/useAuth.js`, `src/hooks/useAuth.test.jsx`

- [ ] **Step 1: Escrever o teste**

`src/hooks/useAuth.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Firebase modules before importing useAuth
vi.mock('../firebase.js', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb(null) // start as signed out
    return () => {}
  }),
}))

vi.mock('../utils/firestore.js', () => ({
  isEmailAuthorized: vi.fn().mockResolvedValue(true),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}))

import { useAuth } from './useAuth.js'

describe('useAuth', () => {
  it('starts as loading', () => {
    const { result } = renderHook(() => useAuth())
    // onAuthStateChanged fires synchronously with null in mock
    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('isAuthorized is false when user is null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthorized).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
npm run test -- useAuth
```
Esperado: FAIL — "Cannot find module './useAuth.js'"

- [ ] **Step 3: Criar src/hooks/useAuth.js**

```js
import { useState, useEffect } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase.js'
import { isEmailAuthorized, upsertUser } from '../utils/firestore.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const ADMIN_EMAIL = 'arturapv@gmail.com'

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setIsAuthorized(false)
        setIsAdmin(false)
        setLoading(false)
        return
      }
      const authorized = await isEmailAuthorized(firebaseUser.email)
      await upsertUser(firebaseUser)
      setUser(firebaseUser)
      setIsAuthorized(authorized)
      setIsAdmin(firebaseUser.email === ADMIN_EMAIL)
      setLoading(false)
    })
  }, [])

  async function login() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function logout() {
    await signOut(auth)
  }

  return { user, isAuthorized, isAdmin, loading, login, logout }
}
```

- [ ] **Step 4: Rodar testes — confirmar passam**

```bash
npm run test -- useAuth
```
Esperado: PASS — 2 testes

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.js src/hooks/useAuth.test.jsx
git commit -m "feat: add useAuth hook with Google login"
```

---

## Tarefa 6: Telas de Login e Acesso Negado

**Files:**
- Create: `src/components/LoginPage.jsx`, `src/components/AccessDenied.jsx`, `src/components/LoginPage.test.jsx`

- [ ] **Step 1: Escrever teste para LoginPage**

`src/components/LoginPage.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from './LoginPage.jsx'

describe('LoginPage', () => {
  it('renders login button', () => {
    render(<LoginPage onLogin={vi.fn()} />)
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument()
  })

  it('calls onLogin when button is clicked', () => {
    const onLogin = vi.fn()
    render(<LoginPage onLogin={onLogin} />)
    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
npm run test -- LoginPage
```
Esperado: FAIL — "Cannot find module './LoginPage.jsx'"

- [ ] **Step 3: Criar src/components/LoginPage.jsx**

```jsx
export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-brand-900 rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-extrabold text-xl">AP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">APVasconcelos</h1>
        <p className="text-gray-500 text-sm mb-8">Sistema de Gestão de Tarefas</p>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>
        <p className="text-xs text-gray-400 mt-6">Acesso restrito. Somente usuários autorizados.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar src/components/AccessDenied.jsx**

```jsx
export default function AccessDenied({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso não autorizado</h2>
        <p className="text-gray-500 text-sm mb-6">
          Seu e-mail não está na lista de usuários autorizados. Entre em contato com o administrador.
        </p>
        <button
          onClick={onLogout}
          className="text-sm text-brand-700 underline hover:text-brand-900"
        >
          Sair e usar outra conta
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Rodar testes**

```bash
npm run test -- LoginPage
```
Esperado: PASS — 2 testes

- [ ] **Step 6: Commit**

```bash
git add src/components/LoginPage.jsx src/components/AccessDenied.jsx src/components/LoginPage.test.jsx
git commit -m "feat: add LoginPage and AccessDenied screens"
```

---

## Tarefa 7: App.jsx — Roteamento + AuthGuard

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Substituir src/App.jsx**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './components/LoginPage.jsx'
import AccessDenied from './components/AccessDenied.jsx'

// Lazy-loaded para evitar importar Firebase antes do auth
import { lazy, Suspense } from 'react'
const BoardPage = lazy(() => import('./pages/BoardPage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

function AuthGuard({ children, requireAdmin = false }) {
  const { user, isAuthorized, isAdmin, loading, login, logout } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Carregando...
    </div>
  )

  if (!user) return <LoginPage onLogin={login} />
  if (!isAuthorized) return <AccessDenied onLogout={logout} />
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <BrowserRouter basename="/kanban-escritorio">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>}>
        <Routes>
          <Route path="/" element={
            <AuthGuard>
              <BoardPage />
            </AuthGuard>
          } />
          <Route path="/admin" element={
            <AuthGuard requireAdmin>
              <AdminPage />
            </AuthGuard>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Criar src/pages/BoardPage.jsx provisório**

```jsx
export default function BoardPage() {
  return <div className="p-8 text-gray-700">Board — em construção</div>
}
```

- [ ] **Step 3: Criar src/pages/AdminPage.jsx provisório**

```jsx
export default function AdminPage() {
  return <div className="p-8 text-gray-700">Admin — em construção</div>
}
```

- [ ] **Step 4: Confirmar build sem erros**

```bash
npm run build
```
Esperado: build OK

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/pages/
git commit -m "feat: add routing and AuthGuard"
```

---

## Tarefa 8: TopBar

**Files:**
- Create: `src/components/TopBar.jsx`, `src/components/TopBar.test.jsx`

- [ ] **Step 1: Escrever teste**

`src/components/TopBar.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TopBar from './TopBar.jsx'

const props = {
  workspace: 'advocacia',
  onWorkspaceChange: vi.fn(),
  onSearch: vi.fn(),
  user: { displayName: 'Artur', photoURL: null, email: 'arturapv@gmail.com' },
  isAdmin: true,
  onLogout: vi.fn(),
  onAdmin: vi.fn(),
}

describe('TopBar', () => {
  it('renders workspace tabs', () => {
    render(<TopBar {...props} />)
    expect(screen.getByText(/advocacia/i)).toBeInTheDocument()
    expect(screen.getByText(/docência/i)).toBeInTheDocument()
  })

  it('calls onWorkspaceChange when docencia tab is clicked', () => {
    render(<TopBar {...props} />)
    fireEvent.click(screen.getByText(/docência/i))
    expect(props.onWorkspaceChange).toHaveBeenCalledWith('docencia')
  })
})
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
npm run test -- TopBar
```
Esperado: FAIL

- [ ] **Step 3: Criar src/components/TopBar.jsx**

```jsx
import { useState } from 'react'

export default function TopBar({ workspace, onWorkspaceChange, onSearch, user, isAdmin, onLogout, onAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-5 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 bg-brand-900 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-extrabold">AP</span>
        </div>
        <span className="text-sm font-bold text-brand-900 hidden sm:block">Vasconcelos</span>
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
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              workspace === id
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-500 hover:text-gray-800'
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
          className="w-full text-xs px-3 py-1.5 bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-brand-900/20"
        />
      </div>

      {/* Avatar + menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-8 h-8 rounded-full bg-brand-900 text-white text-xs font-bold flex items-center justify-center overflow-hidden"
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

- [ ] **Step 4: Rodar testes**

```bash
npm run test -- TopBar
```
Esperado: PASS — 2 testes

- [ ] **Step 5: Commit**

```bash
git add src/components/TopBar.jsx src/components/TopBar.test.jsx
git commit -m "feat: add TopBar with workspace tabs and user menu"
```

---

## Tarefa 9: Hook useBoard (dados em tempo real)

**Files:**
- Create: `src/hooks/useBoard.js`

- [ ] **Step 1: Criar src/hooks/useBoard.js**

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import { seedColumnsIfEmpty } from '../utils/firestore.js'

export function useBoard(workspace) {
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspace) return

    seedColumnsIfEmpty(workspace)

    const colQ = query(
      collection(db, 'workspaces', workspace, 'columns'),
      orderBy('order')
    )
    const unsubCols = onSnapshot(colQ, snap => {
      setColumns(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const taskQ = query(
      collection(db, 'workspaces', workspace, 'tasks'),
      orderBy('createdAt')
    )
    const unsubTasks = onSnapshot(taskQ, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })

    return () => {
      unsubCols()
      unsubTasks()
    }
  }, [workspace])

  function tasksForColumn(columnId) {
    return tasks.filter(t => t.columnId === columnId)
  }

  function searchTasks(query) {
    if (!query) return tasks
    const q = query.toLowerCase()
    return tasks.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.client?.toLowerCase().includes(q) ||
      t.processNumber?.toLowerCase().includes(q)
    )
  }

  return { columns, tasks, loading, tasksForColumn, searchTasks }
}
```

- [ ] **Step 2: Confirmar build sem erros**

```bash
npm run build
```
Esperado: OK

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBoard.js
git commit -m "feat: add useBoard hook with real-time Firestore listener"
```

---

## Tarefa 10: TaskCard

**Files:**
- Create: `src/components/TaskCard.jsx`, `src/components/TaskCard.test.jsx`

- [ ] **Step 1: Escrever testes**

`src/components/TaskCard.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskCard from './TaskCard.jsx'

const task = {
  id: 't1',
  title: 'Recurso trabalhista',
  priority: 'alta',
  client: 'Silva & Filhos',
  opposingParty: 'Empresa XYZ',
  processNumber: '0012345-67.2024',
  deadline: new Date('2026-05-28').getTime(),
  assignedTo: 'user1',
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} />)
    expect(screen.getByText('Recurso trabalhista')).toBeInTheDocument()
  })

  it('renders client name', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} />)
    expect(screen.getByText('Silva & Filhos')).toBeInTheDocument()
  })

  it('renders priority badge', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} />)
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
npm run test -- TaskCard
```
Esperado: FAIL

- [ ] **Step 3: Criar src/components/TaskCard.jsx**

```jsx
import { Draggable } from '@hello-pangea/dnd'
import { formatDate, priorityLabel, priorityColor, isOverdue } from '../utils/formatters.js'

export default function TaskCard({ task, onClick, index }) {
  const overdue = isOverdue(task.deadline?.toMillis?.() ?? task.deadline)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-lg border p-3 cursor-pointer transition-shadow
            ${snapshot.isDragging ? 'shadow-lg rotate-1' : 'shadow-sm hover:shadow-md'}
            ${task.priority === 'alta' ? 'border-l-[3px] border-l-red-400 border-t-gray-200 border-r-gray-200 border-b-gray-200' : 'border-gray-200'}
          `}
        >
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 leading-tight mb-2">{task.title}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {task.client && (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                {task.client}
              </span>
            )}
            {task.processNumber && (
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                Nº {task.processNumber}
              </span>
            )}
            {task.opposingParty && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                {task.opposingParty}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-50">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>
              {priorityLabel(task.priority)}
            </span>
            {task.deadline && (
              <span className={`text-[10px] ml-auto ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                📅 {formatDate(task.deadline?.toMillis?.() ?? task.deadline)}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test -- TaskCard
```
Esperado: PASS — 3 testes

- [ ] **Step 5: Commit**

```bash
git add src/components/TaskCard.jsx src/components/TaskCard.test.jsx
git commit -m "feat: add TaskCard with priority, tags and deadline display"
```

---

## Tarefa 11: Column + Board com Drag-and-Drop

**Files:**
- Create: `src/components/Column.jsx`, `src/components/Board.jsx`

- [ ] **Step 1: Criar src/components/Column.jsx**

```jsx
import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard.jsx'

export default function Column({ column, tasks, onTaskClick, isReview = false }) {
  return (
    <div className={`flex flex-col min-w-[260px] w-[260px] ${isReview ? 'bg-blue-50/50 rounded-xl' : ''}`}>
      {/* Column header */}
      <div className={`flex items-center gap-2 px-2 py-2.5 rounded-lg mb-1 ${isReview ? 'bg-blue-50' : ''}`}>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-xs font-bold text-gray-700">{column.name}</span>
        <span className="ml-auto text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-1 transition-colors
              ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
            `}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
            ))}
            {provided.placeholder}

            {/* Add task hint */}
            <button className="text-xs text-gray-400 hover:text-brand-700 py-2 text-center rounded-lg hover:bg-blue-50 transition-colors mt-1">
              + Adicionar tarefa
            </button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
```

- [ ] **Step 2: Criar src/components/Board.jsx**

```jsx
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column.jsx'
import { moveTask } from '../utils/firestore.js'

export default function Board({ workspace, columns, tasksForColumn, onTaskClick, filter, searchQuery, currentUserId }) {
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

    if (filter === 'mine')   tasks = tasks.filter(t => t.assignedTo === currentUserId)
    if (filter === 'intern') tasks = tasks.filter(t => t.assignedTo !== currentUserId)
    if (filter === 'urgent') tasks = tasks.filter(t => t.priority === 'alta')

    return tasks
  }

  const REVIEW_COLUMN_NAME = 'Aguardando Revisão'

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-5 h-full">
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={getFilteredTasks(col.id)}
            onTaskClick={onTaskClick}
            isReview={col.name === REVIEW_COLUMN_NAME}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
```

- [ ] **Step 3: Confirmar build sem erros**

```bash
npm run build
```
Esperado: OK

- [ ] **Step 4: Commit**

```bash
git add src/components/Column.jsx src/components/Board.jsx
git commit -m "feat: add Board and Column with drag-and-drop"
```

---

## Tarefa 12: BoardPage — Integrando tudo até aqui

**Files:**
- Modify: `src/pages/BoardPage.jsx`

- [ ] **Step 1: Substituir src/pages/BoardPage.jsx**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useBoard } from '../hooks/useBoard.js'
import TopBar from '../components/TopBar.jsx'
import Board from '../components/Board.jsx'
import FilterBar from '../components/FilterBar.jsx'
import TaskPanel from '../components/TaskPanel.jsx'

export default function BoardPage() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState('advocacia')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [creatingInColumn, setCreatingInColumn] = useState(null)

  const { columns, tasks, loading, tasksForColumn } = useBoard(workspace)

  const reviewColumn = columns.find(c => c.name === 'Aguardando Revisão')
  const reviewCount = reviewColumn ? tasksForColumn(reviewColumn.id).length : 0

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
      Carregando...
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <TopBar
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        onSearch={setSearchQuery}
        user={user}
        isAdmin={isAdmin}
        onLogout={logout}
        onAdmin={() => navigate('/admin')}
      />

      {reviewCount > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-center gap-2 text-sm">
          <span className="text-blue-600 font-semibold">
            💬 {reviewCount} {reviewCount === 1 ? 'tarefa aguarda' : 'tarefas aguardam'} sua revisão
          </span>
        </div>
      )}

      <FilterBar filter={filter} onFilterChange={setFilter} />

      <div className="flex-1 overflow-hidden">
        <Board
          workspace={workspace}
          columns={columns}
          tasksForColumn={tasksForColumn}
          onTaskClick={setSelectedTask}
          filter={filter}
          searchQuery={searchQuery}
          currentUserId={user?.uid}
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

- [ ] **Step 2: Criar src/components/FilterBar.jsx provisório**

```jsx
export default function FilterBar({ filter, onFilterChange }) {
  const filters = [
    { id: 'all',    label: 'Todos' },
    { id: 'mine',   label: 'Minhas tarefas' },
    { id: 'intern', label: 'Do estagiário' },
    { id: 'urgent', label: '⚡ Urgente' },
  ]

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-2 flex items-center gap-2">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
            filter === f.id
              ? 'bg-brand-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Criar src/components/TaskPanel.jsx provisório (stub)**

```jsx
export default function TaskPanel({ onClose }) {
  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-gray-200 z-40 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-sm mb-4">Painel de tarefa — em construção</p>
        <button onClick={onClose} className="text-xs text-brand-700 underline">Fechar</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Confirmar que o app roda e o board aparece**

```bash
npm run dev
```
Esperado: board visível com as 4 colunas após login (se Firebase configurado), ou sem erros em desenvolvimento.

- [ ] **Step 5: Commit**

```bash
git add src/pages/BoardPage.jsx src/components/FilterBar.jsx src/components/TaskPanel.jsx
git commit -m "feat: integrate board page with TopBar, FilterBar, and review banner"
```

---

## Tarefa 13: TaskPanel — Formulário Completo

**Files:**
- Modify: `src/components/TaskPanel.jsx`
- Create: `src/hooks/useTask.js`

- [ ] **Step 1: Criar src/hooks/useTask.js**

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import { createTask, updateTask, deleteTask, addComment } from '../utils/firestore.js'

export function useTask(workspace, taskId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!workspace || !taskId) return
    const q = query(
      collection(db, 'workspaces', workspace, 'tasks', taskId, 'comments'),
      orderBy('createdAt')
    )
    return onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [workspace, taskId])

  async function save(data) {
    setLoading(true)
    try {
      if (taskId) {
        await updateTask(workspace, taskId, data)
      } else {
        await createTask(workspace, data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (taskId) await deleteTask(workspace, taskId)
  }

  async function postComment(text, author) {
    await addComment(workspace, taskId, author)
  }

  return { comments, loading, save, remove, postComment }
}
```

- [ ] **Step 2: Substituir src/components/TaskPanel.jsx com implementação completa**

```jsx
import { useState, useEffect } from 'react'
import { useTask } from '../hooks/useTask.js'
import { formatDate } from '../utils/formatters.js'
import CommentSection from './CommentSection.jsx'
import AttachmentSection from './AttachmentSection.jsx'

const PRIORITIES = [
  { value: 'alta',  label: 'Alta',  color: 'text-red-600' },
  { value: 'media', label: 'Média', color: 'text-amber-600' },
  { value: 'baixa', label: 'Baixa', color: 'text-emerald-600' },
]

export default function TaskPanel({ workspace, task, columnId, columns, currentUser, onClose }) {
  const isNew = !task

  const [form, setForm] = useState({
    title:          task?.title          ?? '',
    description:    task?.description    ?? '',
    priority:       task?.priority       ?? 'media',
    deadline:       task?.deadline
                      ? new Date(task.deadline?.toMillis?.() ?? task.deadline)
                          .toISOString().split('T')[0]
                      : '',
    assignedTo:     task?.assignedTo     ?? currentUser?.uid ?? '',
    client:         task?.client         ?? '',
    opposingParty:  task?.opposingParty  ?? '',
    processNumber:  task?.processNumber  ?? '',
    columnId:       task?.columnId       ?? columnId ?? columns[0]?.id ?? '',
  })

  const { comments, loading, save, remove } = useTask(workspace, task?.id)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await save({
      ...form,
      deadline: form.deadline ? new Date(form.deadline).getTime() : null,
    })
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Excluir esta tarefa? Esta ação não pode ser desfeita.')) return
    await remove()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">
            {isNew ? 'Nova tarefa' : 'Editar tarefa'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Título *</label>
              <input
                required
                value={form.title}
                onChange={set('title')}
                placeholder="Descreva a tarefa..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              />
            </div>

            {/* Priority + Deadline row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Prioridade *</label>
                <select
                  value={form.priority}
                  onChange={set('priority')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Prazo *</label>
                <input
                  type="date"
                  required
                  value={form.deadline}
                  onChange={set('deadline')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
              </div>
            </div>

            {/* Column */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Coluna *</label>
              <select
                value={form.columnId}
                onChange={set('columnId')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              >
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Client + Opposing Party */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Cliente *</label>
                <input
                  required
                  value={form.client}
                  onChange={set('client')}
                  placeholder="Nome do cliente"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Parte contrária</label>
                <input
                  value={form.opposingParty}
                  onChange={set('opposingParty')}
                  placeholder="Opcional"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
              </div>
            </div>

            {/* Process Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nº do Processo</label>
              <input
                value={form.processNumber}
                onChange={set('processNumber')}
                placeholder="Ex: 0012345-67.2024 (opcional)"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={3}
                placeholder="Detalhes, instrução para o estagiário..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20 resize-none"
              />
            </div>

            {/* Attachments — only on existing tasks */}
            {!isNew && (
              <AttachmentSection workspace={workspace} taskId={task.id} />
            )}

            {/* Comments — only on existing tasks */}
            {!isNew && (
              <CommentSection workspace={workspace} taskId={task.id} currentUser={currentUser} />
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {isNew ? 'Criar tarefa' : 'Salvar alterações'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 text-sm px-3"
              >
                Excluir
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Confirmar build**

```bash
npm run build
```
Esperado: OK (CommentSection e AttachmentSection ainda não existem — criados nas próximas tarefas, mas o build deve passar se não forem importados ainda)

> Se der erro de módulo não encontrado, crie stubs temporários conforme padrão da Tarefa 12 Step 3.

- [ ] **Step 4: Commit**

```bash
git add src/components/TaskPanel.jsx src/hooks/useTask.js
git commit -m "feat: add TaskPanel with full task form"
```

---

## Tarefa 14: CommentSection

**Files:**
- Create: `src/components/CommentSection.jsx`

- [ ] **Step 1: Criar src/components/CommentSection.jsx**

```jsx
import { useState } from 'react'
import { addComment } from '../utils/firestore.js'
import { useTask } from '../hooks/useTask.js'

export default function CommentSection({ workspace, taskId, currentUser }) {
  const { comments } = useTask(workspace, taskId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    await addComment(workspace, taskId, {
      text: text.trim(),
      authorId:    currentUser.uid,
      authorName:  currentUser.displayName,
      authorPhoto: currentUser.photoURL,
    })
    setText('')
    setSending(false)
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
              <p className="text-xs text-gray-700 mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="text-xs font-semibold bg-brand-900 text-white px-3 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CommentSection.jsx
git commit -m "feat: add CommentSection with real-time comments"
```

---

## Tarefa 15: AttachmentSection (Upload Firebase Storage)

**Files:**
- Create: `src/components/AttachmentSection.jsx`
- Modify: `src/utils/firestore.js` (adicionar função de attachment)

- [ ] **Step 1: Adicionar funções de attachment em src/utils/firestore.js**

Adicione ao final do arquivo:
```js
// ── Attachments ──────────────────────────────────────────────────────────────

export async function addAttachment(workspace, taskId, { name, url, size, contentType, uploadedBy }) {
  const ref = collection(db, 'workspaces', workspace, 'tasks', taskId, 'attachments')
  return addDoc(ref, {
    name,
    url,
    size,
    contentType,
    uploadedBy,
    uploadedAt: serverTimestamp(),
  })
}
```

- [ ] **Step 2: Criar src/components/AttachmentSection.jsx**

```jsx
import { useState, useEffect } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { storage, db } from '../firebase.js'
import { addAttachment } from '../utils/firestore.js'

const MAX_FILE_SIZE_MB = 20

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentSection({ workspace, taskId, currentUser }) {
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!workspace || !taskId) return
    const q = query(
      collection(db, 'workspaces', workspace, 'tasks', taskId, 'attachments'),
      orderBy('uploadedAt')
    )
    return onSnapshot(q, snap => {
      setAttachments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [workspace, taskId])

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setError('')
    setUploading(true)
    setProgress(0)

    const storageRef = ref(storage, `workspaces/${workspace}/tasks/${taskId}/${Date.now()}-${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed',
      snapshot => setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)),
      err => { setError('Erro no upload. Tente novamente.'); setUploading(false) },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        await addAttachment(workspace, taskId, {
          name: file.name,
          url,
          size: file.size,
          contentType: file.type,
          uploadedBy: currentUser?.uid ?? '',
        })
        setUploading(false)
        setProgress(0)
        e.target.value = ''
      }
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">📎 Anexos</p>

      {attachments.length === 0 && !uploading && (
        <p className="text-xs text-gray-400 mb-2">Nenhum arquivo anexado.</p>
      )}

      <div className="space-y-1.5 mb-2">
        {attachments.map(att => (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-brand-700 hover:text-brand-900 bg-blue-50 rounded-lg px-3 py-2 group"
          >
            <span className="text-base">📄</span>
            <span className="flex-1 truncate font-medium">{att.name}</span>
            <span className="text-gray-400 shrink-0">{formatSize(att.size)}</span>
            <span className="text-gray-400 group-hover:text-brand-700">↓</span>
          </a>
        ))}
      </div>

      {uploading && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-brand-900 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 cursor-pointer">
        <span>+ Anexar arquivo</span>
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
        />
      </label>
    </div>
  )
}
```

- [ ] **Step 3: Confirmar build**

```bash
npm run build
```
Esperado: OK

- [ ] **Step 4: Commit**

```bash
git add src/components/AttachmentSection.jsx src/utils/firestore.js
git commit -m "feat: add file upload with Firebase Storage"
```

---

## Tarefa 16: UserManager (Painel Admin)

**Files:**
- Modify: `src/pages/AdminPage.jsx`

- [ ] **Step 1: Substituir src/pages/AdminPage.jsx**

```jsx
import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { addAuthorizedEmail, removeAuthorizedEmail } from '../utils/firestore.js'
import { useNavigate } from 'react-router-dom'

export default function AdminPage() {
  const [emails, setEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    return onSnapshot(collection(db, 'authorizedEmails'), snap => {
      setEmails(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    if (!email.includes('@')) { setError('E-mail inválido'); return }
    setError('')
    setAdding(true)
    await addAuthorizedEmail(email, 'arturapv@gmail.com')
    setNewEmail('')
    setAdding(false)
  }

  async function handleRemove(email) {
    if (!confirm(`Remover acesso de ${email}?`)) return
    await removeAuthorizedEmail(email)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto pt-12 px-4">
        <button
          onClick={() => navigate('/')}
          className="text-xs text-brand-700 hover:underline mb-6 block"
        >
          ← Voltar ao board
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Gerenciar usuários</h1>
          <p className="text-xs text-gray-500 mb-6">Somente e-mails autorizados conseguem acessar o sistema.</p>

          {/* Add email */}
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="novo@email.com"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            />
            <button
              type="submit"
              disabled={adding}
              className="text-sm font-semibold bg-brand-900 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              Adicionar
            </button>
          </form>
          {error && <p className="text-xs text-red-500 -mt-4 mb-4">{error}</p>}

          {/* Email list */}
          <div className="space-y-2">
            {emails.map(e => (
              <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-800">{e.id}</span>
                {e.id !== 'arturapv@gmail.com' && (
                  <button
                    onClick={() => handleRemove(e.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remover
                  </button>
                )}
                {e.id === 'arturapv@gmail.com' && (
                  <span className="text-xs text-gray-400">admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AdminPage.jsx
git commit -m "feat: add user management panel for admin"
```

---

## Tarefa 17: Regras de Segurança do Firestore e Storage

**Files:**
- Create: `firestore.rules`, `storage.rules`

- [ ] **Step 1: Criar firestore.rules na raiz do projeto**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAuthorized() {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/authorizedEmails/$(request.auth.token.email));
    }

    function isAdmin() {
      return isSignedIn() &&
        request.auth.token.email == 'arturapv@gmail.com';
    }

    // Authorized emails — só admin escreve, qualquer autenticado lê (para checar acesso)
    match /authorizedEmails/{email} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // User profiles — cada usuário lê/escreve o próprio, admin lê todos
    match /users/{userId} {
      allow read, write: if isSignedIn() && request.auth.uid == userId;
      allow read: if isAdmin();
    }

    // Workspaces — só usuários autorizados
    match /workspaces/{workspace}/{document=**} {
      allow read, write: if isAuthorized();
    }
  }
}
```

- [ ] **Step 2: Criar storage.rules na raiz do projeto**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /workspaces/{workspace}/tasks/{taskId}/{allFiles=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- [ ] **Step 3: Publicar as regras via Firebase CLI**

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # selecione o projeto kanban-escritorio, aceite firestore.rules
firebase init storage     # aceite storage.rules
firebase deploy --only firestore:rules,storage
```

- [ ] **Step 4: Commit**

```bash
git add firestore.rules storage.rules .firebaserc firebase.json
git commit -m "feat: add Firestore and Storage security rules"
```

---

## Tarefa 18: Seed de E-mail Admin no Firestore

O e-mail admin precisa estar na coleção `authorizedEmails` antes do primeiro login.

- [ ] **Step 1: Adicionar seed via Firebase Console**

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) → seu projeto
2. Firestore Database → Dados → `+ Iniciar coleção` → ID: `authorizedEmails`
3. Primeiro documento: ID do documento = `arturapv@gmail.com`
4. Adicione campo: `addedBy` (string) = `system`, `addedAt` (timestamp) = data atual
5. Salvar

- [ ] **Step 2: Testar login**

```bash
npm run dev
```
Abra `http://localhost:5173/kanban-escritorio/`, clique "Entrar com Google", faça login com arturapv@gmail.com. Esperado: board carrega com as 4 colunas padrão.

- [ ] **Step 3: Testar com e-mail não autorizado**

Saia e entre com outra conta Google. Esperado: tela "Acesso não autorizado".

---

## Tarefa 19: GitHub Actions — Deploy para GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Criar repositório no GitHub**

1. Acesse github.com → New repository
2. Nome: `kanban-escritorio` (exatamente este nome para o base URL funcionar)
3. Privado ✓ → Create repository

- [ ] **Step 2: Adicionar secrets no GitHub**

No repositório → Settings → Secrets and variables → Actions → New repository secret. Adicione um por um:

| Nome | Valor |
|---|---|
| `VITE_FIREBASE_API_KEY` | valor do .env.local |
| `VITE_FIREBASE_AUTH_DOMAIN` | valor do .env.local |
| `VITE_FIREBASE_PROJECT_ID` | valor do .env.local |
| `VITE_FIREBASE_STORAGE_BUCKET` | valor do .env.local |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | valor do .env.local |
| `VITE_FIREBASE_APP_ID` | valor do .env.local |

- [ ] **Step 3: Criar .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        run: npm run build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 4: Ativar GitHub Pages no repositório**

Settings → Pages → Source: "GitHub Actions" → Save

- [ ] **Step 5: Adicionar domínio autorizado no Firebase Auth**

Firebase Console → Authentication → Settings → Authorized domains → Add domain: `SEU_USUARIO.github.io`

- [ ] **Step 6: Push e verificar deploy**

```bash
git remote add origin https://github.com/SEU_USUARIO/kanban-escritorio.git
git push -u origin main
```
Aguarde ~2 min. Acesse `https://SEU_USUARIO.github.io/kanban-escritorio/`. Esperado: tela de login funcionando.

- [ ] **Step 7: Commit final**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deploy to GitHub Pages"
git push
```

---

## Tarefa 20: Testes finais de integração manual

- [ ] **Cheklist de funcionalidades**

| Funcionalidade | OK? |
|---|---|
| Login com Google (arturapv@gmail.com) | ☐ |
| Acesso negado para e-mail não autorizado | ☐ |
| Board carrega com 4 colunas | ☐ |
| Criar nova tarefa com todos os campos | ☐ |
| Tarefa aparece na coluna correta | ☐ |
| Drag-and-drop muda coluna da tarefa | ☐ |
| Banner aparece com tarefas em "Aguardando Revisão" | ☐ |
| Editar tarefa existente | ☐ |
| Excluir tarefa | ☐ |
| Adicionar comentário | ☐ |
| Comentário aparece em tempo real | ☐ |
| Upload de arquivo PDF | ☐ |
| Download do arquivo anexado | ☐ |
| Filtro "Urgente" mostra só prioridade alta | ☐ |
| Busca por cliente | ☐ |
| Aba Docência tem board separado | ☐ |
| Admin adiciona novo e-mail | ☐ |
| Novo usuário consegue fazer login após ser adicionado | ☐ |

- [ ] **Rodar todos os testes unitários**

```bash
npm run test
```
Esperado: todos os testes passam

- [ ] **Commit final**

```bash
git add .
git commit -m "chore: final integration checklist"
git push
```
