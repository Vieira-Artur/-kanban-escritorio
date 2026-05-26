import { useState } from 'react'
import { useTask } from '../hooks/useTask.js'
import { addComment } from '../utils/firestore.js'

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
          className="text-xs font-semibold bg-brand-900 text-white px-3 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
