export default function FilterBar({ filter, onFilterChange, bgClass = 'bg-slate-100' }) {
  const filters = [
    { id: 'all',    label: 'Todos' },
    { id: 'mine',   label: 'Minhas tarefas' },
    { id: 'intern', label: 'Do estagiário' },
    { id: 'urgent', label: '⚡ Urgente' },
  ]

  const borderClass = bgClass === 'bg-stone-100' ? 'border-stone-200' : 'border-slate-200'

  return (
    <div className={`${bgClass} border-b ${borderClass} px-5 py-2 flex items-center gap-2 shrink-0`}>
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
