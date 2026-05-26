export function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function priorityLabel(priority) {
  return { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[priority] ?? priority
}

export function priorityColor(priority) {
  return {
    alta:  'bg-red-100 text-red-700',
    media: 'bg-amber-100 text-amber-700',
    baixa: 'bg-emerald-100 text-emerald-700',
  }[priority] ?? 'bg-gray-100 text-gray-600'
}

export function isOverdue(timestamp) {
  if (!timestamp) return false
  return timestamp < Date.now()
}
