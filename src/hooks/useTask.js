import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import { createTask, updateTask, deleteTask } from '../utils/firestore.js'

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

  return { comments, loading, save, remove }
}
