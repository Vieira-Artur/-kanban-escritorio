import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column.jsx'
import { moveTask, reorderTasks } from '../utils/firestore.js'

export default function Board({ workspace, columns, tasksForColumn, onTaskClick, onAddTask, filter, searchQuery, currentUserId, activeColumnId, users }) {
  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return

    if (destination.droppableId === source.droppableId) {
      if (destination.index === source.index) return
      const colTasks = tasksForColumn(destination.droppableId)
      const reordered = [...colTasks]
      const [moved] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, moved)
      await reorderTasks(workspace, reordered.map(t => t.id))
      return
    }

    await moveTask(workspace, draggableId, destination.droppableId)
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
      <div className="flex gap-4 overflow-x-auto p-4 sm:p-5 h-full">
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={getFilteredTasks(col.id)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            isReview={col.name === REVIEW_COLUMN_NAME}
            className={col.id !== activeColumnId ? 'hidden sm:block' : ''}
            users={users}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
