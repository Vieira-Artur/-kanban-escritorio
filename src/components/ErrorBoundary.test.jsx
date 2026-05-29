import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary.jsx'

function BrokenChild() {
  throw new Error('falha proposital')
}

describe('ErrorBoundary', () => {
  it('exibe fallback quando filho lança erro', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><BrokenChild /></ErrorBoundary>)
    expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recarregar/i })).toBeInTheDocument()
    spy.mockRestore()
  })

  it('renderiza filhos normalmente quando não há erro', () => {
    render(<ErrorBoundary><div>conteúdo ok</div></ErrorBoundary>)
    expect(screen.getByText('conteúdo ok')).toBeInTheDocument()
  })
})
