'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, 
  Rocket, 
  Upload, 
  Target, 
  Users, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeBannerProps {
  userId: string
  displayName: string
  profileCompletion: number
  onDismiss?: () => void
}

export function WelcomeBanner({ 
  userId, 
  displayName, 
  profileCompletion,
  onDismiss 
}: WelcomeBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if profile is complete or banner was dismissed
  if (dismissed || profileCompletion >= 100) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const quickStartSteps = [
    {
      icon: Upload,
      title: 'Upload Your First Beat',
      description: 'Add music to your vault',
      action: () => router.push('/vault/upload'),
      completed: false
    },
    {
      icon: Target,
      title: 'Create a Bounty',
      description: 'Get fans to promote your music',
      action: () => router.push('/bounties'),
      completed: false
    },
    {
      icon: Users,
      title: 'Find Collaborators',
      description: 'Connect with other artists',
      action: () => router.push('/network'),
      completed: false
    }
  ]

  return (
    <div className="relative border-2 dark:border-cyan-400 border-cyan-600 p-6 dark:bg-gradient-to-r dark:from-cyan-400/10 dark:to-green-400/10 bg-gradient-to-r from-cyan-600/10 to-green-600/10 mb-6">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 dark:text-green-400/60 text-green-700/60 hover:dark:text-green-400 hover:text-green-700 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 dark:bg-cyan-400/20 bg-cyan-600/20 rounded-full">
          <Rocket className="h-6 w-6 dark:text-cyan-400 text-cyan-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
            WELCOME, {displayName.toUpperCase()}!
          </h2>
          <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
            Let's get you started on NoCulture OS
          </p>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
            PROFILE_COMPLETION
          </span>
          <span className="text-xs font-mono dark:text-cyan-400 text-cyan-700 font-bold">
            {profileCompletion}%
          </span>
        </div>
        <div className="h-2 dark:bg-green-400/20 bg-green-600/20 rounded-full overflow-hidden">
          <div 
            className="h-full dark:bg-cyan-400 bg-cyan-600 transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        {profileCompletion < 100 && (
          <button
            onClick={() => router.push('/profile/setup')}
            className="mt-2 text-xs font-mono dark:text-cyan-400 text-cyan-700 hover:underline flex items-center gap-1"
          >
            Complete your profile <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Quick Start Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStartSteps.map((step, index) => (
          <button
            key={index}
            onClick={step.action}
            className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-black/30 bg-white/50 hover:dark:border-green-400 hover:border-green-600 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full transition-colors ${
                step.completed 
                  ? 'dark:bg-green-400/20 bg-green-600/20' 
                  : 'dark:bg-green-400/10 bg-green-600/10 group-hover:dark:bg-green-400/20 group-hover:bg-green-600/20'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 dark:text-green-400 text-green-700" />
                ) : (
                  <step.icon className="h-4 w-4 dark:text-green-400 text-green-700" />
                )}
              </div>
              <span className="text-sm font-mono font-bold dark:text-green-400 text-green-700">
                {step.title}
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 pl-11">
              {step.description}
            </p>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={() => router.push('/vault/upload')}
          className="dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white font-mono"
        >
          <Upload className="h-4 w-4 mr-2" />
          START_UPLOADING
        </Button>
        <button
          onClick={handleDismiss}
          className="text-sm font-mono dark:text-green-400/60 text-green-700/60 hover:dark:text-green-400 hover:text-green-700"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
