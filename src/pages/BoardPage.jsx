import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useBoard } from '../hooks/useBoard.js'
import TopBar from '../components/TopBar.jsx'
import Board from '../components/Board.jsx'
import FilterBar from '../components/FilterBar.jsx'
import TaskPanel from '../components/TaskPanel.jsx'

export default function BoardPage() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState('advocacia')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [creatingInColumn, setCreatingInColumn] = useState(null)

  const { columns, tasks, loading, tasksForColumn } = useBoard(workspace)

  const reviewColumn = columns.find(c => c.name === 'Aguardando Revisão')
  const reviewCount = reviewColumn ? tasksForColumn(reviewColumn.id).length : 0

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
      Carregando...
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <TopBar
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        onSearch={setSearchQuery}
        user={user}
        isAdmin={isAdmin}
        onLogout={logout}
        onAdmin={() => navigate('/admin')}
      />

      {reviewCount > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-center gap-2 text-sm shrink-0">
          <span className="text-blue-600 font-semibold">
            💬 {reviewCount} {reviewCount === 1 ? 'tarefa aguarda' : 'tarefas aguardam'} sua revisão
          </span>
        </div>
      )}

      <FilterBar filter={filter} onFilterChange={setFilter} />

      <div className="flex-1 overflow-hidden">
        <Board
          workspace={workspace}
          columns={columns}
          tasksForColumn={tasksForColumn}
          onTaskClick={setSelectedTask}
          onAddTask={columnId => setCreatingInColumn(columnId)}
          filter={filter}
          searchQuery={searchQuery}
          currentUserId={user?.uid}
        />
      </div>

      {(selectedTask || creatingInColumn) && (
        <TaskPanel
          workspace={workspace}
          task={selectedTask}
          columnId={creatingInColumn}
          columns={columns}
          currentUser={user}
          onClose={() => { setSelectedTask(null); setCreatingInColumn(null) }}
        />
      )}
    </div>
  )
}
