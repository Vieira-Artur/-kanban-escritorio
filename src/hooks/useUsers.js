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
