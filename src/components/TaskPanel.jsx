import { useState, useEffect } from 'react'
import { useTask } from '../hooks/useTask.js'
import { formatDate } from '../utils/formatters.js'
import CommentSection from './CommentSection.jsx'
import { saveChecklistTemplate, getChecklistTemplates, addHistory } from '../utils/firestore.js'

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
    checklist:      task?.checklist      ?? [],
  })

  const [newItem, setNewItem]           = useState('')
  const [templates, setTemplates]       = useState([])
  const [templateName, setTemplateName] = useState('')
  const [savingTpl, setSavingTpl]       = useState(false)
  const [showHistory, setShowHistory]   = useState(false)

  const { comments, history, loading, save, remove } = useTask(workspace, task?.id)

  function fmtHistoryDate(ts) {
    if (!ts?.toDate) return ''
    const d = ts.toDate()
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  function computeChanges() {
    if (!task) return []
    const changes = []
    const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

    if (form.columnId !== task.columnId) {
      const oldCol = columns.find(c => c.id === task.columnId)
      const newCol = columns.find(c => c.id === form.columnId)
      changes.push(`moveu para "${newCol?.name ?? '?'}" (antes: "${oldCol?.name ?? '?'}")`)
    }
    if (form.priority !== task.priority) {
      changes.push(`alterou a prioridade para ${PRIORITY_LABEL[form.priority]}`)
    }
    const oldDeadline = task.deadline
      ? new Date(task.deadline?.toMillis?.() ?? task.deadline).toLocaleDateString('pt-BR')
      : null
    const newDeadline = form.deadline
      ? new Date(form.deadline).toLocaleDateString('pt-BR')
      : null
    if (oldDeadline !== newDeadline) {
      if (!newDeadline)      changes.push('removeu o prazo')
      else if (!oldDeadline) changes.push(`definiu prazo para ${newDeadline}`)
      else                   changes.push(`alterou prazo para ${newDeadline}`)
    }
    if (form.client !== (task.client ?? '')) {
      changes.push(`alterou o cliente para "${form.client}"`)
    }
    if (form.assignedTo !== (task.assignedTo ?? '')) {
      const newUser = users.find(u => u.uid === form.assignedTo)
      changes.push(`atribuiu para ${newUser?.displayName ?? 'desconhecido'}`)
    }
    return changes
  }

  useEffect(() => {
    getChecklistTemplates().then(setTemplates).catch(() => {})
  }, [])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function addChecklistItem() {
    if (!newItem.trim()) return
    setForm(f => ({
      ...f,
      checklist: [...f.checklist, { id: crypto.randomUUID(), text: newItem.trim(), done: false }],
    }))
    setNewItem('')
  }

  function removeChecklistItem(id) {
    setForm(f => ({ ...f, checklist: f.checklist.filter(i => i.id !== id) }))
  }

  function toggleChecklistItem(id) {
    setForm(f => ({
      ...f,
      checklist: f.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i),
    }))
  }

  async function handleSaveTemplate() {
    if (!templateName.trim() || !form.checklist.length) return
    await saveChecklistTemplate(templateName.trim(), form.checklist)
    const updated = await getChecklistTemplates()
    setTemplates(updated)
    setTemplateName('')
    setSavingTpl(false)
  }

  function loadTemplate(id) {
    const tpl = templates.find(t => t.id === id)
    if (!tpl) return
    setForm(f => ({
      ...f,
      checklist: tpl.items.map(i => ({ id: crypto.randomUUID(), text: i.text, done: false })),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const changes = computeChanges()
    try {
      const savedId = await save({
        ...form,
        deadline: form.deadline ? new Date(form.deadline).getTime() : null,
        isIntern: form.isIntern,
      })
      const author = { authorId: currentUser?.uid ?? 'sistema', authorName: currentUser?.displayName ?? 'Sistema' }
      if (isNew) {
        addHistory(workspace, savedId, { ...author, description: 'criou a tarefa' }).catch(() => {})
      } else {
        changes.forEach(description =>
          addHistory(workspace, savedId, { ...author, description }).catch(() => {})
        )
      }
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
          <button onClick={onClose} aria-label="Fechar painel" className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
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
                      onChange={() => setForm(f => ({ ...f, deadline: '' }))}
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

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  ✅ Checklist
                  {form.checklist.length > 0 && (
                    <span className="ml-2 text-gray-400 font-normal">
                      {form.checklist.filter(i => i.done).length} de {form.checklist.length}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {templates.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={e => { loadTemplate(e.target.value); e.target.value = '' }}
                      className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none"
                    >
                      <option value="" disabled>Carregar template</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                  {form.checklist.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSavingTpl(v => !v)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Salvar template
                    </button>
                  )}
                </div>
              </div>

              {savingTpl && (
                <div className="flex gap-2 mb-2">
                  <input
                    autoFocus
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
                    placeholder="Nome do template..."
                    className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="text-xs bg-brand-900 text-white px-2 py-1.5 rounded hover:bg-blue-800"
                  >
                    Salvar
                  </button>
                </div>
              )}

              {form.checklist.length > 0 && (
                <div className="mb-2">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(form.checklist.filter(i => i.done).length / form.checklist.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1 mb-2">
                {form.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-3.5 h-3.5 rounded accent-brand-900 shrink-0"
                    />
                    <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      aria-label="Remover item do checklist"
                      className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                  placeholder="Adicionar item..."
                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  aria-label="Adicionar item ao checklist"
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded transition-colors"
                >
                  +
                </button>
              </div>
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

        {/* Comments */}
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

        {/* History */}
        {!isNew && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-3 bg-white">
            <button
              type="button"
              onClick={() => setShowHistory(v => !v)}
              aria-label="Mostrar/ocultar histórico"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span>🕐 Histórico</span>
              {history.length > 0 && <span className="text-gray-300">({history.length})</span>}
              <span className="ml-1">{showHistory ? '▲' : '▼'}</span>
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {history.length === 0 && (
                  <p className="text-xs text-gray-400">Nenhum registro ainda.</p>
                )}
                {[...history].reverse().map(h => (
                  <div key={h.id} className="flex items-start gap-2 text-xs">
                    <span className="text-gray-300 mt-0.5 shrink-0">•</span>
                    <span className="text-gray-600 flex-1">
                      <span className="font-semibold text-gray-700">{h.authorName}</span>
                      {' '}{h.description}
                    </span>
                    <span className="text-gray-400 shrink-0 tabular-nums">{fmtHistoryDate(h.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
