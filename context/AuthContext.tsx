'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'

interface AuthContextType {
  user: (User & { socials?: any }) | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user: privyUser, getAccessToken } = usePrivy()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async () => {
    if (!ready || !authenticated) {
      setLoading(false)
      return
    }

    // Set loading to false immediately to not block UI
    setLoading(false)

    try {
      const token = await getAccessToken()
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
      
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        console.warn('User API returned non-OK status:', response.status)
        setUser(null)
      }
    } catch (error) {
      // Don't log timeout errors as errors, they're expected in demo mode
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('User fetch timed out - continuing in demo mode')
      } else {
        console.warn('Failed to fetch user:', error)
      }
      setUser(null)
    }
  }

  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        setUser(null)
        setLoading(false)
      } else {
        fetchUser()
      }
    }
  }, [ready, authenticated, getAccessToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
