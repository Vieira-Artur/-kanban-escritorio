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
  { name: 'A Fazer',            color: '#eab308', order: 0 },
  { name: 'Em Andamento',       color: '#f59e0b', order: 1 },
  { name: 'Aguardando Revisão', color: '#3b82f6', order: 2 },
  { name: 'Pronto p/ Envio',    color: '#8b5cf6', order: 3 },
  { name: 'Concluído',          color: '#10b981', order: 4 },
]

export async function seedColumnsIfEmpty(workspace) {
  const colRef = collection(db, 'workspaces', workspace, 'columns')
  const snap = await getDocs(colRef)

  if (snap.empty) {
    const batch = writeBatch(db)
    DEFAULT_COLUMNS.forEach(col => batch.set(doc(colRef), col))
    await batch.commit()
    return
  }

  // Migrate: add missing columns and sync order + color of existing ones
  const existing = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const existingNames = new Set(existing.map(c => c.name))
  const missing = DEFAULT_COLUMNS.filter(c => !existingNames.has(c.name))

  const batch = writeBatch(db)
  missing.forEach(col => batch.set(doc(colRef), col))
  existing.forEach(col => {
    const canonical = DEFAULT_COLUMNS.find(d => d.name === col.name)
    if (!canonical) return
    const updates = {}
    if (col.order !== canonical.order) updates.order = canonical.order
    if (col.color !== canonical.color) updates.color = canonical.color
    if (Object.keys(updates).length > 0) {
      batch.update(doc(colRef, col.id), updates)
    }
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

export async function reorderTasks(workspace, orderedIds) {
  const batch = writeBatch(db)
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'workspaces', workspace, 'tasks', id), { order: index })
  })
  await batch.commit()
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

// ── History ──────────────────────────────────────────────────────────────────

export async function addHistory(workspace, taskId, { authorId, authorName, description }) {
  const ref = collection(db, 'workspaces', workspace, 'tasks', taskId, 'history')
  return addDoc(ref, { authorId, authorName, description, createdAt: serverTimestamp() })
}

// ── Checklist Templates ──────────────────────────────────────────────────────

export async function saveChecklistTemplate(name, items) {
  return addDoc(collection(db, 'checklistTemplates'), {
    name,
    items: items.map(i => ({ text: i.text })),
    createdAt: serverTimestamp(),
  })
}

export async function getChecklistTemplates() {
  const snap = await getDocs(query(collection(db, 'checklistTemplates'), orderBy('name')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── User profile ─────────────────────────────────────────────────────────────

export async function getUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const ADMIN_EMAILS = ['carellievieira.adv@gmail.com', 'arturapv@gmail.com']

export async function upsertUser(user) {
  const ref = doc(db, 'users', user.uid)
  await setDoc(ref, {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL ?? '',
    role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'member',
  }, { merge: true })
}
