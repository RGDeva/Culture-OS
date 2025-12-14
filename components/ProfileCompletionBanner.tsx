"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'
import { getProfile } from '@/lib/profileStore'

/**
 * Banner shown to users who skipped onboarding
 * Reminds them to complete their profile to unlock features
 */
export function ProfileCompletionBanner() {
  const router = useRouter()
  const privyHook = usePrivy()
  const { user } = privyHook || {}
  const [shouldShow, setShouldShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    try {
      // Check if user needs to complete profile
      const profile = getProfile(user.id)
      
      if (profile && profile.profileOnboardingSkipped && !profile.profileOnboardingCompleted) {
        setShouldShow(true)
      }
    } catch (err) {
      // Silently fail - banner is not critical
      console.warn('[BANNER] Could not check profile status:', err)
    }
  }, [user?.id])

  if (!shouldShow || dismissed) {
    return null
  }

  return (
    <div className="bg-yellow-500/10 border-2 border-yellow-500/50 p-4 mb-6 font-mono relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-yellow-500/70 hover:text-yellow-500"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-500 font-bold text-sm mb-1">
            PROFILE_INCOMPLETE
          </h3>
          <p className="text-yellow-500/80 text-xs mb-3">
            Complete your profile to unlock data insights, campaign recommendations, and full marketplace integration
          </p>
          <Button
            onClick={() => router.push('/onboarding/profile')}
            size="sm"
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-mono text-xs"
          >
            &gt; COMPLETE_PROFILE_NOW
          </Button>
        </div>
      </div>
    </div>
  )
}
