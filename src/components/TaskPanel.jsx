import { useState } from 'react'
import { useTask } from '../hooks/useTask.js'
import { formatDate } from '../utils/formatters.js'
import CommentSection from './CommentSection.jsx'

const CLIENTS = ['Vereda', 'Sergio', 'Loppas', 'Aliria']

const PRIORITIES = [
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
]

export default function TaskPanel({ workspace, task, columnId, columns, currentUser, users = [], onClose }) {
  const isNew = !task

  const [form, setForm] = useState({
    title:          task?.title          ?? '',
    description:    task?.description    ?? '',
    priority:       task?.priority       ?? 'media',
    deadline:       task?.deadline
                      ? new Date(task.deadline?.toMillis?.() ?? task.deadline)
                          .toISOString().split('T')[0]
                      : '',
    isIntern:       task?.isIntern        ?? false,
    client:         task?.client         ?? '',
    opposingParty:  task?.opposingParty  ?? '',
    processNumber:  task?.processNumber  ?? '',
    columnId:       task?.columnId       ?? columnId ?? columns[0]?.id ?? '',
    assignedTo:     task?.assignedTo     ?? '',
  })

  const { comments, loading, save, remove } = useTask(workspace, task?.id)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await save({
        ...form,
        deadline: form.deadline ? new Date(form.deadline).getTime() : null,
        isIntern: form.isIntern,
      })
      onClose()
    } catch {
      // toast already shown by useTask
    }
  }

  async function handleDelete() {
    if (!confirm('Excluir esta tarefa? Esta ação não pode ser desfeita.')) return
    try {
      await remove()
      onClose()
    } catch {
      // toast already shown by useTask
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-gray-800">
            {isNew ? 'Nova tarefa' : 'Editar tarefa'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-5 py-4 space-y-4 flex-1">

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Título *</label>
              <input
                required
                value={form.title}
                onChange={set('title')}
                placeholder="Descreva a tarefa..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              />
            </div>

            {/* Priority + Deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Prioridade *</label>
                <select
                  value={form.priority}
                  onChange={set('priority')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-500">Prazo</label>
                  <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!form.deadline}
                      onChange={e => setForm(f => ({ ...f, deadline: e.target.checked ? '' : new Date().toISOString().split('T')[0] }))}
                      className="rounded"
                    />
                    Sem prazo
                  </label>
                </div>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={set('deadline')}
                  disabled={!form.deadline}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Responsável *</label>
              <select
                required
                value={form.assignedTo}
                onChange={set('assignedTo')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              >
                <option value="" disabled>Selecione um responsável</option>
                {users.map(u => (
                  <option key={u.uid} value={u.uid}>{u.displayName}</option>
                ))}
              </select>
            </div>

            {/* Column */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Coluna *</label>
              <select
                value={form.columnId}
                onChange={set('columnId')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              >
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Intern toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isIntern}
                onChange={e => setForm(f => ({ ...f, isIntern: e.target.checked }))}
                className="w-4 h-4 rounded accent-brand-900"
              />
              <span className="text-sm font-semibold text-gray-700">Tarefa do Estagiário</span>
            </label>

            {/* Client + Opposing Party */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Cliente *</label>
                <input
                  required
                  list="clients-list"
                  value={form.client}
                  onChange={set('client')}
                  placeholder="Nome do cliente"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
                <datalist id="clients-list">
                  {CLIENTS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Parte contrária</label>
                <input
                  value={form.opposingParty}
                  onChange={set('opposingParty')}
                  placeholder="Opcional"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
              </div>
            </div>

            {/* Process Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nº do Processo</label>
              <input
                value={form.processNumber}
                onChange={set('processNumber')}
                placeholder="Ex: 0012345-67.2024 (opcional)"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={3}
                placeholder="Detalhes, instrução para o estagiário..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900/20 resize-none"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isNew ? 'Criar tarefa' : 'Salvar alterações'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 text-sm px-3"
              >
                Excluir
              </button>
            )}
          </div>
        </form>

        {/* Comments — seção separada abaixo do formulário */}
        {!isNew && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-4 bg-gray-50 overflow-y-auto max-h-64">
            <CommentSection
              workspace={workspace}
              taskId={task.id}
              taskTitle={task.title}
              currentUser={currentUser}
              users={users}
            />
          </div>
        )}
      </div>
    </>
  )
}
