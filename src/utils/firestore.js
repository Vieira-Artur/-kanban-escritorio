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

export async function getUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function upsertUser(user) {
  const ADMIN_EMAIL = 'carellievieira.adv@gmail.com'
  const ref = doc(db, 'users', user.uid)
  await setDoc(ref, {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL ?? '',
    role: user.email === ADMIN_EMAIL ? 'admin' : 'member',
  }, { merge: true })
}
