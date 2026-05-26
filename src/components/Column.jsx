import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard.jsx'

export default function Column({ column, tasks, onTaskClick, isReview = false }) {
  return (
    <div className={`flex flex-col min-w-[260px] w-[260px] ${isReview ? 'bg-blue-50/50 rounded-xl' : ''}`}>
      {/* Column header */}
      <div className={`flex items-center gap-2 px-2 py-2.5 rounded-lg mb-1 ${isReview ? 'bg-blue-50' : ''}`}>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-xs font-bold text-gray-700">{column.name}</span>
        <span className="ml-auto text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-1 transition-colors
              ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
            `}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
            ))}
            {provided.placeholder}

            {/* Add task hint */}
            <button className="text-xs text-gray-400 hover:text-brand-700 py-2 text-center rounded-lg hover:bg-blue-50 transition-colors mt-1">
              + Adicionar tarefa
            </button>
          </div>
        )}
      </Droppable>
    </div>
  )
}
