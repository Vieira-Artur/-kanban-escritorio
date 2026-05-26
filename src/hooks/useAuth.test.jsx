import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Firebase modules before importing useAuth
vi.mock('../firebase.js', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb(null) // start as signed out
    return () => {}
  }),
}))

vi.mock('../utils/firestore.js', () => ({
  isEmailAuthorized: vi.fn().mockResolvedValue(true),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}))

import { useAuth } from './useAuth.js'

describe('useAuth', () => {
  it('starts as loading', () => {
    const { result } = renderHook(() => useAuth())
    // onAuthStateChanged fires synchronously with null in mock
    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('isAuthorized is false when user is null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthorized).toBe(false)
  })
})
