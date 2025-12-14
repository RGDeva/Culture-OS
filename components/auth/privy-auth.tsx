"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@privy-io/react-auth"

// Initialize Privy client
const privy = createClient({
  appId: "cmd4wfneb008ujs0lbqln5875",
  embeddedWalletApiKey: "4JdvajqhDRZuBHiWxhgLFnqSbqb8rHBZiCXSjdUGzZ3ssbGpa9udiZU2hsvh1tK3tusJFSxdYjY7acpjJfJyuFpM"
})

export function PrivyAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const router = useRouter()

  const handleLogin = async (provider: string) => {
    try {
      setIsAuthenticating(true)
      const authResult = await privy.authenticate({
        provider,
        onSuccess: async (user) => {
          // Check if user has role
          const role = await checkUserRole(user.id)
          if (!role) {
            router.push('/initiate_protocol')
          } else {
            // Redirect to role-specific dashboard
            router.push(`/${role}_dashboard`)
          }
        }
      })
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const checkUserRole = async (userId: string) => {
    // TODO: Implement Supabase check for user role
    // For now, return null to force role selection
    return null
  }

  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-green-400/20 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-12">
          <Link href="/" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK_TO_SYSTEM
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">AUTH_PROTOCOL</h1>
          <div className="text-sm font-mono text-green-400/60">STEP_1/3</div>
        </div>

        {/* Auth Options */}
        <div className="space-y-6 w-full max-w-2xl">
          <div className="text-center text-green-400/80 mb-8">
            <p className="text-xl font-mono">SELECT_AUTH_METHOD</p>
            <p className="text-sm mt-2">Choose your authentication method</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleLogin('email')}
              className="w-full bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'AUTHENTICATING...' : 'EMAIL'}
            </Button>
            <Button
              onClick={() => handleLogin('google')}
              className="w-full bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'AUTHENTICATING...' : 'GOOGLE'}
            </Button>
            <Button
              onClick={() => handleLogin('twitter')}
              className="w-full bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'AUTHENTICATING...' : 'TWITTER'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
