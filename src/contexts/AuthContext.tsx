'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)
  const router = useRouter()

  useEffect(() => {
    if (initialUser !== undefined) {
      setLoading(false)
      return
    }
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
