import { Draggable } from '@hello-pangea/dnd'
import { formatDate, priorityLabel, priorityColor, isOverdue } from '../utils/formatters.js'

export default function TaskCard({ task, onClick, index, users = [] }) {
  const deadlineMs = task.deadline?.toMillis?.() ?? task.deadline
  const overdue = isOverdue(deadlineMs)
  const assignee = users.find(u => u.uid === task.assignedTo)
  function initials(name) {
    return name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  }

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
                Cliente: {task.client}
              </span>
            )}
            {task.opposingParty && (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                Parte: {task.opposingParty}
              </span>
            )}
            {task.processNumber && (
              <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                Nº {task.processNumber}
              </span>
            )}
            <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
              👤 {task.isIntern ? 'Estagiário' : 'Artur Vieira'}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-50">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>
              {priorityLabel(task.priority)}
            </span>
            {task.deadline && (
              <span className={`text-xs ${assignee ? '' : 'ml-auto'} ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                📅 {formatDate(deadlineMs)}
              </span>
            )}
            {assignee && (
              <span
                title={assignee.displayName}
                className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-brand-900 text-white text-[9px] font-bold shrink-0 overflow-hidden"
              >
                {assignee.photoURL
                  ? <img src={assignee.photoURL} alt={assignee.displayName} className="w-full h-full object-cover" />
                  : initials(assignee.displayName)
                }
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
