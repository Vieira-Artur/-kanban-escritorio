import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUsers } from './useUsers.js'

vi.mock('../firebase.js', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'usersRef'),
  onSnapshot: vi.fn((ref, cb) => {
    cb({
      docs: [
        { id: 'uid1', data: () => ({ displayName: 'Artur Vieira', email: 'a@test.com', photoURL: '' }) },
        { id: 'uid2', data: () => ({ displayName: 'Estagiário', email: 'e@test.com', photoURL: '' }) },
      ],
    })
    return vi.fn()
  }),
}))

describe('useUsers', () => {
  it('retorna lista de usuários do Firestore', () => {
    const { result } = renderHook(() => useUsers())
    expect(result.current.users).toHaveLength(2)
    expect(result.current.users[0]).toEqual({
      uid: 'uid1',
      displayName: 'Artur Vieira',
      email: 'a@test.com',
      photoURL: '',
    })
    expect(result.current.users[1].displayName).toBe('Estagiário')
  })
})
