import { describe, it, expect } from 'vitest'
import { formatDate, priorityLabel, priorityColor, isOverdue } from './formatters.js'

describe('formatDate', () => {
  it('formats a timestamp to dd/mm/yyyy', () => {
    const ts = new Date('2026-05-28T12:00:00').getTime()
    expect(formatDate(ts)).toBe('28/05/2026')
  })
  it('returns "" for null', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('priorityLabel', () => {
  it('returns Portuguese labels', () => {
    expect(priorityLabel('alta')).toBe('Alta')
    expect(priorityLabel('media')).toBe('Média')
    expect(priorityLabel('baixa')).toBe('Baixa')
  })
})

describe('priorityColor', () => {
  it('returns tailwind classes for each priority', () => {
    expect(priorityColor('alta')).toContain('red')
    expect(priorityColor('media')).toContain('amber')
    expect(priorityColor('baixa')).toContain('emerald')
  })
})

describe('isOverdue', () => {
  it('returns true when deadline is in the past', () => {
    const yesterday = Date.now() - 86400000
    expect(isOverdue(yesterday)).toBe(true)
  })
  it('returns false when deadline is in the future', () => {
    const tomorrow = Date.now() + 86400000
    expect(isOverdue(tomorrow)).toBe(false)
  })
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false)
  })
})
