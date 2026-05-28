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
