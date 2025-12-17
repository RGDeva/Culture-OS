"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { usePrivy } from "@privy-io/react-auth"
import { Profile } from "@/types/profile"

// Loading component
const LoadingBox = () => (
  <div className="border-2 dark:border-green-400/30 border-gray-300 p-6 animate-pulse">
    <div className="h-6 dark:bg-green-400/20 bg-gray-200 w-1/3 mb-4"></div>
    <div className="h-4 dark:bg-green-400/10 bg-gray-100 w-full mb-2"></div>
    <div className="h-4 dark:bg-green-400/10 bg-gray-100 w-2/3"></div>
  </div>
)

// Dynamic imports for better performance
const LandingPage = dynamic(() => import("@/components/landing/LandingPage").then(mod => ({ default: mod.LandingPage })), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0a0a0a]" />
})
const WhopStyleDashboard = dynamic(() => import("@/components/home/WhopStyleDashboard").then(mod => ({ default: mod.WhopStyleDashboard })), { 
  ssr: false,
  loading: () => <LoadingBox />
})

export default function HomePage() {
  const privyHook = usePrivy()
  const { user, authenticated } = privyHook || {}
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Load profile when user is authenticated (non-blocking with timeout)
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      setProfileLoading(true)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        const response = await fetch(`/api/profile?userId=${user.id}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('[HOME] Profile fetch timeout, continuing without profile')
        } else {
          console.error('[HOME] Error loading profile:', err)
        }
        setProfile(null)
      } finally {
        setProfileLoading(false)
      }
    }

    if (authenticated && user?.id) {
      loadProfile()
    } else {
      setProfileLoading(false)
    }
  }, [authenticated, user?.id])

  // Show new landing page for unauthenticated users
  if (!authenticated) {
    return <LandingPage />
  }

  // Show dashboard for authenticated users
  return (
    <div className="min-h-screen bg-black">
      <div className="w-full">
        {profileLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl font-mono text-green-400 animate-pulse">
              LOADING_DASHBOARD...
            </div>
          </div>
        ) : user?.id ? (
          <WhopStyleDashboard userId={user.id} profile={profile} />
        ) : null}
      </div>
    </div>
  )
}
