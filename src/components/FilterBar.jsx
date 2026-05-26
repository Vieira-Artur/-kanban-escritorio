export default function FilterBar({ filter, onFilterChange }) {
  const filters = [
    { id: 'all',    label: 'Todos' },
    { id: 'mine',   label: 'Minhas tarefas' },
    { id: 'intern', label: 'Do estagiário' },
    { id: 'urgent', label: '⚡ Urgente' },
  ]

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-2 flex items-center gap-2 shrink-0">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
            filter === f.id
              ? 'bg-brand-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
