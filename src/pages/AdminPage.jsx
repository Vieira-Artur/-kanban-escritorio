import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { addAuthorizedEmail, removeAuthorizedEmail } from '../utils/firestore.js'
import { useNavigate } from 'react-router-dom'

const ADMIN_EMAIL = 'carellievieira.adv@gmail.com'

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
    await addAuthorizedEmail(email, ADMIN_EMAIL)
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
              className="text-sm font-semibold bg-brand-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
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
                {e.id !== ADMIN_EMAIL && (
                  <button
                    onClick={() => handleRemove(e.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remover
                  </button>
                )}
                {e.id === ADMIN_EMAIL && (
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
