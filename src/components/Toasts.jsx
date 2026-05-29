import { useToast } from '../context/ToastContext.jsx'

export default function Toasts() {
  const { toasts, dismiss } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white max-w-sm pointer-events-auto
            ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-white/70 hover:text-white text-base leading-none shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
