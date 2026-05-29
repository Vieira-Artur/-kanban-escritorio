import { DragDropContext } from '@hello-pangea/dnd'
import emailjs from '@emailjs/browser'
import Column from './Column.jsx'
import { moveTask, reorderTasks } from '../utils/firestore.js'
import { useToast } from '../context/ToastContext.jsx'

const EMAILJS_SERVICE  = 'service_15ksn4c'
const EMAILJS_TEMPLATE = 'template_ex0jp91'
const EMAILJS_KEY      = 'oS_35Exr1g3iWgdJC'

export default function Board({ workspace, columns, tasksForColumn, onTaskClick, onAddTask, filter, searchQuery, currentUser, activeColumnId, users }) {
  const { addToast } = useToast()

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return

    if (destination.droppableId === source.droppableId) {
      if (destination.index === source.index) return
      const colTasks = tasksForColumn(destination.droppableId)
      const reordered = [...colTasks]
      const [moved] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, moved)
      try {
        await reorderTasks(workspace, reordered.map(t => t.id))
      } catch {
        addToast('Não foi possível reordenar as tarefas. Tente novamente.')
      }
      return
    }

    try {
      await moveTask(workspace, draggableId, destination.droppableId)
    } catch {
      addToast('Não foi possível mover a tarefa. Tente novamente.')
      return
    }

    const destColumn = columns.find(c => c.id === destination.droppableId)
    if (destColumn?.name === 'Aguardando Revisão') {
      const task = tasksForColumn(source.droppableId).find(t => t.id === draggableId)
      emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        from_name:    currentUser?.displayName ?? 'Estagiário',
        name:         currentUser?.displayName ?? 'Estagiário',
        email:        currentUser?.email ?? '',
        to_name:      'Artur',
        to_email:     'arturapv@gmail.com',
        task_title:   task?.title ?? '(sem título)',
        comment_text: `Tarefa enviada para Aguardando Revisão${task?.client ? ` — cliente: ${task.client}` : ''}`,
        app_url:      window.location.origin,
      }, EMAILJS_KEY)
    }
  }

  function getFilteredTasks(columnId) {
    let tasks = tasksForColumn(columnId)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.client?.toLowerCase().includes(q) ||
        t.processNumber?.toLowerCase().includes(q)
      )
    }

    if (filter === 'mine')   tasks = tasks.filter(t => !t.isIntern)
    if (filter === 'intern') tasks = tasks.filter(t => t.isIntern)
    if (filter === 'urgent') tasks = tasks.filter(t => t.priority === 'alta')

    return tasks
  }

  const REVIEW_COLUMN_NAME = 'Aguardando Revisão'

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-auto p-4 sm:p-5 h-full items-start">
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={getFilteredTasks(col.id)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            isReview={col.name === REVIEW_COLUMN_NAME}
            className={col.id !== activeColumnId ? 'hidden sm:flex sm:flex-col' : ''}
            users={users}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
