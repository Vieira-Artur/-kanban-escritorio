const ABBREV = {
  'A Fazer': 'A Fazer',
  'Em Andamento': 'Andamento',
  'Aguardando Revisão': 'Revisão',
  'Concluído': 'Concluído',
}

export default function ColumnTabs({ columns, activeColumnId, onColumnChange, tasksForColumn }) {
  return (
    <div className="sm:hidden bg-white border-b border-gray-100 flex overflow-x-auto shrink-0">
      {columns.map(col => {
        const isActive = col.id === activeColumnId
        const count = tasksForColumn(col.id).length
        return (
          <button
            key={col.id}
            onClick={() => onColumnChange(col.id)}
            className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              isActive
                ? 'text-brand-900 border-brand-900'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {ABBREV[col.name] ?? col.name}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              isActive
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
