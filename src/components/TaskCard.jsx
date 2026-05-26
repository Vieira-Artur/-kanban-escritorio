import { Draggable } from '@hello-pangea/dnd'
import { formatDate, priorityLabel, priorityColor, isOverdue } from '../utils/formatters.js'

export default function TaskCard({ task, onClick, index }) {
  const deadlineMs = task.deadline?.toMillis?.() ?? task.deadline
  const overdue = isOverdue(deadlineMs)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-lg border p-3 cursor-pointer transition-shadow
            ${snapshot.isDragging ? 'shadow-lg rotate-1' : 'shadow-sm hover:shadow-md'}
            ${task.priority === 'alta' ? 'border-l-[3px] border-l-red-400 border-t-gray-200 border-r-gray-200 border-b-gray-200' : 'border-gray-200'}
          `}
        >
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 leading-tight mb-2">{task.title}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {task.client && (
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                {task.client}
              </span>
            )}
            {task.processNumber && (
              <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                Nº {task.processNumber}
              </span>
            )}
            {task.opposingParty && (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                {task.opposingParty}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-50">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>
              {priorityLabel(task.priority)}
            </span>
            {task.deadline && (
              <span className={`text-xs ml-auto ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                📅 {formatDate(deadlineMs)}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
