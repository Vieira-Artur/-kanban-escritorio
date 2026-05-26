import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TopBar from './TopBar.jsx'

const props = {
  workspace: 'advocacia',
  onWorkspaceChange: vi.fn(),
  onSearch: vi.fn(),
  user: { displayName: 'Artur', photoURL: null, email: 'arturapv@gmail.com' },
  isAdmin: true,
  onLogout: vi.fn(),
  onAdmin: vi.fn(),
}

describe('TopBar', () => {
  it('renders workspace tabs', () => {
    render(<TopBar {...props} />)
    expect(screen.getByText(/advocacia/i)).toBeInTheDocument()
    expect(screen.getByText(/docência/i)).toBeInTheDocument()
  })

  it('calls onWorkspaceChange when docencia tab is clicked', () => {
    render(<TopBar {...props} />)
    fireEvent.click(screen.getByText(/docência/i))
    expect(props.onWorkspaceChange).toHaveBeenCalledWith('docencia')
  })
})
