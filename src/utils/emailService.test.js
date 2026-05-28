import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@emailjs/browser', () => {
  const mockSend = vi.fn().mockResolvedValue({ status: 200, text: 'OK' })
  return {
    default: { send: mockSend },
  }
})

import { sendMentionEmail } from './emailService.js'
import emailjs from '@emailjs/browser'

const mockSend = emailjs.send

describe('sendMentionEmail', () => {
  beforeEach(() => mockSend.mockClear())

  it('chama emailjs.send com os parâmetros corretos', async () => {
    await sendMentionEmail({
      toEmail: 'e@test.com',
      toName: 'Estagiário',
      fromName: 'Artur Vieira',
      taskTitle: 'Revisar contrato',
      commentText: 'Favor revisar @Estagiário',
    })

    expect(mockSend).toHaveBeenCalledOnce()
    const [, , params] = mockSend.mock.calls[0]
    expect(params.to_email).toBe('e@test.com')
    expect(params.to_name).toBe('Estagiário')
    expect(params.from_name).toBe('Artur Vieira')
    expect(params.task_title).toBe('Revisar contrato')
    expect(params.comment_text).toBe('Favor revisar @Estagiário')
    expect(params.app_url).toContain('/kanban-escritorio/')
  })

  it('retorna a promise do emailjs.send', async () => {
    const result = await sendMentionEmail({
      toEmail: 'x@x.com', toName: 'X', fromName: 'Y', taskTitle: 'T', commentText: 'C',
    })
    expect(result.status).toBe(200)
  })
})
