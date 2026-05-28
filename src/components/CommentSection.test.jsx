import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentSection from './CommentSection.jsx'

vi.mock('../hooks/useTask.js', () => ({
  useTask: () => ({ comments: [] }),
}))

vi.mock('../utils/firestore.js', () => ({
  addComment: vi.fn().mockResolvedValue({}),
}))

const mockSendMentionEmail = vi.fn().mockResolvedValue({})
vi.mock('../utils/emailService.js', () => ({
  sendMentionEmail: (...args) => mockSendMentionEmail(...args),
}))

const users = [
  { uid: 'uid1', displayName: 'Artur Vieira', email: 'a@test.com', photoURL: '' },
  { uid: 'uid2', displayName: 'Estagiário', email: 'e@test.com', photoURL: '' },
]

const defaultProps = {
  workspace: 'advocacia',
  taskId: 'task1',
  taskTitle: 'Revisar contrato',
  currentUser: { uid: 'uid1', displayName: 'Artur Vieira', photoURL: '' },
  users,
}

describe('CommentSection — @mention chips', () => {
  beforeEach(() => mockSendMentionEmail.mockClear())

  it('não exibe chips antes de digitar @', () => {
    render(<CommentSection {...defaultProps} />)
    expect(screen.queryByText('@Estagiário')).not.toBeInTheDocument()
  })

  it('exibe chips quando usuário digita @', async () => {
    render(<CommentSection {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva um comentário...')
    await userEvent.type(input, 'Olá @')
    expect(screen.getByText('@Estagiário')).toBeInTheDocument()
    expect(screen.getByText('@Artur Vieira')).toBeInTheDocument()
  })

  it('insere @Nome ao clicar num chip e esconde os chips', async () => {
    render(<CommentSection {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva um comentário...')
    await userEvent.type(input, 'Olá @')
    fireEvent.click(screen.getByText('@Estagiário'))
    expect(input.value).toContain('@Estagiário')
    expect(screen.queryByText('@Estagiário')).not.toBeInTheDocument()
  })

  it('envia e-mail para os usuários mencionados ao submeter', async () => {
    render(<CommentSection {...defaultProps} />)
    const input = screen.getByPlaceholderText('Escreva um comentário...')
    await userEvent.type(input, 'Olá @')
    fireEvent.click(screen.getByText('@Estagiário'))
    fireEvent.click(screen.getByText('Enviar'))
    await waitFor(() => {
      expect(mockSendMentionEmail).toHaveBeenCalledWith(expect.objectContaining({
        toEmail: 'e@test.com',
        toName: 'Estagiário',
        fromName: 'Artur Vieira',
        taskTitle: 'Revisar contrato',
      }))
    })
  })
})
