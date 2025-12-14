"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to main profile setup - this route is deprecated
export default function ProfileOnboardingRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/profile/setup')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse font-mono dark:text-green-400 text-green-700">
        REDIRECTING...
      </div>
    </div>
  )
}
