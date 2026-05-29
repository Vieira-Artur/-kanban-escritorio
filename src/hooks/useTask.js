import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import { createTask, updateTask, deleteTask } from '../utils/firestore.js'
import { useToast } from '../context/ToastContext.jsx'

export function useTask(workspace, taskId) {
  const [comments, setComments] = useState([])
  const [history,  setHistory]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const { addToast } = useToast()

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

  useEffect(() => {
    if (!workspace || !taskId) return
    const q = query(
      collection(db, 'workspaces', workspace, 'tasks', taskId, 'history'),
      orderBy('createdAt')
    )
    return onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [workspace, taskId])

  async function save(data) {
    setLoading(true)
    try {
      if (taskId) {
        await updateTask(workspace, taskId, data)
        return taskId
      } else {
        const ref = await createTask(workspace, data)
        return ref.id
      }
    } catch {
      addToast('Não foi possível salvar a tarefa. Tente novamente.')
      throw new Error('save failed')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    try {
      if (taskId) await deleteTask(workspace, taskId)
    } catch {
      addToast('Não foi possível excluir a tarefa. Tente novamente.')
      throw new Error('remove failed')
    }
  }

  return { comments, history, loading, save, remove }
}
