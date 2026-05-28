import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard.jsx'

export default function Column({ column, tasks, onTaskClick, onAddTask, isReview = false, className = '', users = [] }) {
  return (
    <div className={`flex flex-col w-full sm:w-[260px] sm:min-w-[260px] ${className}`.trim()}>
      {/* Cabeçalho ACIMA da caixa branca */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-sm font-bold text-slate-800">{column.name}</span>
        <span className="ml-auto bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 text-xs font-semibold">
          {tasks.length}
        </span>
      </div>

      {/* Caixa branca = área droppable */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-2 shadow-sm transition-colors ${
              isReview
                ? 'bg-blue-50'
                : snapshot.isDraggingOver
                  ? 'bg-blue-50'
                  : 'bg-white'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} users={users} />
            ))}
            {provided.placeholder}

            <button
              onClick={() => onAddTask?.(column.id)}
              className="text-xs text-gray-400 hover:text-brand-700 py-2 text-center rounded-lg hover:bg-blue-50 transition-colors mt-1"
            >
              + Adicionar tarefa
            </button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
