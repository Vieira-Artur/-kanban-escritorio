export default function FilterBar({ filter, onFilterChange }) {
  const filters = [
    { id: 'all',    label: 'Todos' },
    { id: 'mine',   label: 'Minhas tarefas' },
    { id: 'intern', label: 'Do estagiário' },
    { id: 'urgent', label: '⚡ Urgente' },
  ]

  return (
    <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center gap-2 shrink-0">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
            filter === f.id
              ? 'bg-brand-900 text-white'
              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
