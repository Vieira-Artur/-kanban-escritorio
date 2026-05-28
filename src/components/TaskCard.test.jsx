import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskCard from './TaskCard.jsx'

// Mock @hello-pangea/dnd since it requires DragDropContext to be present
vi.mock('@hello-pangea/dnd', () => ({
  Draggable: ({ children }) => children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}))

const task = {
  id: 't1',
  title: 'Recurso trabalhista',
  priority: 'alta',
  client: 'Silva & Filhos',
  opposingParty: 'Empresa XYZ',
  processNumber: '0012345-67.2024',
  deadline: new Date('2026-05-28').getTime(),
  assignedTo: 'user1',
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} />)
    expect(screen.getByText('Recurso trabalhista')).toBeInTheDocument()
  })

  it('renders client name', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} />)
    expect(screen.getByText(/Silva & Filhos/)).toBeInTheDocument()
  })

  it('renders priority badge', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} />)
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })
})

const users = [
  { uid: 'user1', displayName: 'Artur Vieira', email: 'a@test.com', photoURL: '' },
]

describe('TaskCard — responsável', () => {
  it('exibe as iniciais do responsável no rodapé', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} users={users} />)
    expect(screen.getByTitle('Artur Vieira')).toBeInTheDocument()
  })

  it('não quebra quando users está vazio', () => {
    render(<TaskCard task={task} onClick={vi.fn()} index={0} users={[]} />)
    expect(screen.getByText('Recurso trabalhista')).toBeInTheDocument()
  })
})
