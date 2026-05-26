import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from './LoginPage.jsx'

describe('LoginPage', () => {
  it('renders login button', () => {
    render(<LoginPage onLogin={vi.fn()} />)
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument()
  })

  it('calls onLogin when button is clicked', () => {
    const onLogin = vi.fn()
    render(<LoginPage onLogin={onLogin} />)
    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })
})
