"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ArrowRight, Volume2, Terminal, User } from "lucide-react"
import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { TerminalText } from "@/components/ui/terminal-text"
import { Profile } from "@/types/profile"
import { needsOnboarding } from "@/lib/profileStore"

// Loading component
const LoadingBox = () => (
  <div className="border-2 dark:border-green-400/30 border-gray-300 p-6 animate-pulse">
    <div className="h-6 dark:bg-green-400/20 bg-gray-200 w-1/3 mb-4"></div>
    <div className="h-4 dark:bg-green-400/10 bg-gray-100 w-full mb-2"></div>
    <div className="h-4 dark:bg-green-400/10 bg-gray-100 w-2/3"></div>
  </div>
)

// Dynamic imports for better performance
const MatrixBackground = dynamic(() => import("@/components/matrix-background").then(mod => ({ default: mod.MatrixBackground })), { 
  ssr: false,
  loading: () => <div className="h-96 dark:bg-black/50 bg-gray-100 animate-pulse" />
})
const ProfileSetupCard = dynamic(() => import("@/components/home/ProfileSetupCard").then(mod => ({ default: mod.ProfileSetupCard })), { 
  ssr: false,
  loading: () => <LoadingBox />
})
const ProfileIntelCard = dynamic(() => import("@/components/home/ProfileIntelCard").then(mod => ({ default: mod.ProfileIntelCard })), { 
  ssr: false,
  loading: () => <LoadingBox />
})
const DashboardSnapshot = dynamic(() => import("@/components/home/DashboardSnapshot").then(mod => ({ default: mod.DashboardSnapshot })), { 
  ssr: false,
  loading: () => <LoadingBox />
})
const HomeDashboard = dynamic(() => import("@/components/home/HomeDashboard").then(mod => ({ default: mod.HomeDashboard })), { 
  ssr: false,
  loading: () => <LoadingBox />
})

export default function HomePage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showEnter, setShowEnter] = useState(false)
  const privyHook = usePrivy()
  const { user, authenticated, login } = privyHook || {}
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const timer = setTimeout(() => setShowEnter(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Load profile when user is authenticated (non-blocking with timeout)
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      setProfileLoading(true)
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        const response = await fetch(`/api/profile?userId=${user.id}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          // Show setup if profile completion is low
          setShowProfileSetup(data.profileCompletion < 60)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('[HOME] Profile fetch timeout, continuing without profile')
        } else {
          console.error('[HOME] Error loading profile:', err)
        }
        // Don't block the UI, just continue without profile
        setProfile(null)
        setShowProfileSetup(false)
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

  const handleProfileComplete = async () => {
    setShowProfileSetup(false)
    // Reload profile
    if (!user?.id) return
    
    setProfileLoading(true)
    try {
      const response = await fetch(`/api/profile?userId=${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (err) {
      console.error('[HOME] Error reloading profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileSkip = () => {
    setShowProfileSetup(false)
  }

  /**
   * Smart CTA routing:
   * - Not logged in → trigger login
   * - Logged in but no profile → go to onboarding
   * - Profile exists → go to dashboard/intelligence center
   * - If profile loading failed/timeout → go to dashboard anyway
   */
  const handleSmartCTA = () => {
    if (!authenticated) {
      // Not logged in - trigger Privy login
      login()
      return
    }

    if (!user?.id) return

    // If still loading profile, wait a bit
    if (profileLoading) {
      console.log('[HOME] Profile still loading, please wait...')
      return
    }

    // Check if user needs profile setup (completion < 60%)
    if (profile && profile.profileCompletion < 60) {
      // Profile incomplete - go to setup
      router.push('/profile/setup')
      return
    }

    // Default: go to dashboard (works even without profile)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Matrix Background - only in dark mode */}
      <div className="absolute inset-0 z-0 dark:opacity-20 opacity-0">
        <MatrixBackground />
      </div>

      {/* Chaos Grid Overlay */}
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logged-out Hero */}
        {!authenticated && (
          <div
            className={`text-center mb-8 transition-all duration-2000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="relative max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-mono dark:text-green-400 text-gray-900">
                Streamlining how creatives connect, collaborate, and monetize.
              </h1>
              <p className="text-sm md:text-base font-mono dark:text-green-300/80 text-gray-700 mt-4 max-w-2xl mx-auto leading-relaxed">
                NoCulture OS is an operating system for artists, producers, engineers, studios, and other creatives—helping you find the right people, manage projects, and turn sessions and unreleased ideas into revenue.
              </p>
              <div className="text-xs font-mono dark:text-green-400/50 text-gray-500 mt-6 tracking-wider">
                &gt; OS for creatives: VAULT · MARKETPLACE · NETWORK · TOOLS
              </div>
            </div>
          </div>
        )}

        {/* Ghost Character - only when logged out */}
        {!authenticated && (
          <div
            className={`mb-8 transition-all duration-1500 delay-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
          >
            <img src="/images/xen-ghost.webp" alt="Chaos Entity" className="w-32 h-32 md:w-48 md:h-48 animate-bounce" />
          </div>
        )}

        {/* New Home Dashboard (if authenticated) */}
        {authenticated && user?.id ? (
          <div className="w-full max-w-7xl mx-auto px-4">
            {profileLoading ? (
              <div className="text-center py-20">
                <div className="text-xl font-mono dark:text-green-400 text-green-700 animate-pulse">
                  LOADING_DASHBOARD...
                </div>
              </div>
            ) : (
              <HomeDashboard userId={user.id} profile={profile} />
            )}
          </div>
        ) : null}

        {/* 3D Visual + CTA Buttons */}
        {showEnter && !authenticated && (
          <div className="relative w-full max-w-2xl h-96 mb-8">
            <iframe
              src="https://my.spline.design/cybersamuraiupdatedmaterial-c27a709cac8c178c48b37577eb5c789f/"
              frameBorder="0"
              width="100%"
              height="100%"
              className="rounded-xl border-2 border-green-400/50 bg-black/20"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Button
                onClick={handleSmartCTA}
                variant="outline"
                size="lg"
                className="pointer-events-auto bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xl px-8 py-6 backdrop-blur-sm"
              >
                INITIATE_PROTOCOL <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Terminal Command Grid - Control Surface (only show when logged out) */}
        {!authenticated && showEnter && (
          <div
            className={`w-full max-w-6xl transition-all duration-2000 delay-1500 ${showEnter ? "opacity-100" : "opacity-0"}`}
          >
            {/* CORE_MODULES */}
            <div className="mb-12">
              <h2 className="text-xl font-mono text-green-400 mb-4 flex items-center gap-2">
                <span>&gt;_</span> CORE_MODULES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* VAULT */}
                <Link href="/vault">
                  <div className="border-2 border-green-400 p-6 font-mono text-green-400 text-center uppercase hover:bg-green-400 hover:text-black transition-colors cursor-pointer h-full">
                    <div className="text-lg font-bold mb-3">&gt; VAULT</div>
                    <div className="text-xs tracking-wide normal-case text-green-300">Upload works-in-progress, invite collabs, track versions & splits.</div>
                  </div>
                </Link>
                {/* MARKETPLACE */}
                <Link href="/marketplace">
                  <div className="border-2 border-green-400 p-6 font-mono text-green-400 text-center uppercase hover:bg-green-400 hover:text-black transition-colors cursor-pointer h-full">
                    <div className="text-lg font-bold mb-3">&gt; MARKETPLACE</div>
                    <div className="text-xs tracking-wide normal-case text-green-300">Sell beats, packs, services, and access. Instant payouts.</div>
                  </div>
                </Link>
                {/* NETWORK */}
                <Link href="/network">
                  <div className="border-2 border-green-400 p-6 font-mono text-green-400 text-center uppercase hover:bg-green-400 hover:text-black transition-colors cursor-pointer h-full">
                    <div className="text-lg font-bold mb-3">&gt; NETWORK</div>
                    <div className="text-xs tracking-wide normal-case text-green-300">Find artists, producers, engineers, studios, and top buyers.</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* FINANCE_LAYER */}
            <div className="mb-12">
              <h2 className="text-xl font-mono text-green-400 mb-4 flex items-center gap-2">
                <span>&gt;_</span> FINANCE_LAYER
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <Link href="/earnings">
                  <div className="border-2 border-pink-400 p-6 font-mono text-pink-400 text-center uppercase hover:bg-pink-400 hover:text-black transition-colors cursor-pointer">
                    <div className="text-lg font-bold mb-3">&gt; EARNINGS / VAULTS</div>
                    <div className="text-xs tracking-wide normal-case text-pink-300">Payouts, Recoupable data, and future fan-capital tools.</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* TOOLS */}
            <div className="mb-12">
              <h2 className="text-xl font-mono text-green-400 mb-4 flex items-center gap-2">
                <span>&gt;_</span> TOOLS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <Link href="/tools">
                  <div className="border-2 border-cyan-400 p-6 font-mono text-cyan-400 text-center uppercase hover:bg-cyan-400 hover:text-black transition-colors cursor-pointer">
                    <div className="text-lg font-bold mb-3">&gt; TOOLS DIRECTORY</div>
                    <div className="text-xs tracking-wide normal-case text-cyan-300">Connect Recoupable, Songstats, Audius, WaveWarZ, Dreamster, etc.</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-xs font-mono text-green-400/60">
          <div>© 2025 NoCulture Studios</div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-3 w-3" />
            <span>SYSTEM_ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
