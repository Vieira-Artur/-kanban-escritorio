// src/components/TaskPanel.jsx — temporary stub, replaced in T13
export default function TaskPanel({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl border-l border-gray-200 z-40 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm mb-4">Painel de tarefa — em construção</p>
          <button onClick={onClose} className="text-xs text-brand-700 underline">Fechar</button>
        </div>
      </div>
    </>
  )
}
