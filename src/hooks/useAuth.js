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
