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

  return { columns, tasks, loading, tasksForColumn }
}
